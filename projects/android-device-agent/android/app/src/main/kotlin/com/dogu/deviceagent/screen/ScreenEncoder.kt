package com.dogu.deviceagent.screen


import android.graphics.Rect
import android.media.MediaCodec
import android.media.MediaCodecInfo
import android.media.MediaCodecList
import android.media.MediaFormat
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.view.Surface
import com.dogu.deviceagent.Device
import com.dogu.deviceagent.Logger
import com.dogu.deviceagent.reflect.SurfaceControl
import com.dogu.deviceagent.screen.exception.InvalidEncoderException
import kotlinx.coroutines.channels.SendChannel
import java.io.IOException
import java.nio.ByteBuffer
import java.util.*
import java.util.concurrent.atomic.AtomicBoolean


class EncodeOptionCombination(
    public val fps: Int,
    public val resoulution: Int
) {}

class ScreenEncoder(
    private val option: Options,
    codecOptions: List<CodecOption>,
    encoderName: String,
    downsizeOnError: Boolean
) : Device.RotationListener {
    private val rotationChanged = AtomicBoolean()
    private val headerBuffer = ByteBuffer.allocate(12)
    private val encoderName: String
    private val codecOptions: List<CodecOption>
    private val downsizeOnError: Boolean
    private var ptsOrigin: Long = 0

    override fun onRotationChanged(rotation: Int) {
        rotationChanged.set(true)
    }

    fun consumeRotationChange(): Boolean {
        return rotationChanged.getAndSet(false)
    }

    @Throws(IOException::class)
    fun streamScreen(device: Device, channel: SendChannel<ByteArray>) {
        internalStreamScreen(device, channel)
    }

    @Throws(IOException::class)
    private fun internalStreamScreen(device: Device, channel: SendChannel<ByteArray>) {
        Logger.i("ScreenEncoder.internalStreamScreen createFormat")
        val format = createFormat(
            option,
            codecOptions
        )
        Logger.i("ScreenEncoder.internalStreamScreen setRotationListener")

        device.setRotationListener(this)
        var alive: Boolean = true
        Logger.i("ScreenEncoder.internalStreamScreen getDeviceSize")
        val deviceSize = device.getDeviceSize()
        var sameResTryCount = 0;
        Logger.i("ScreenEncoder.internalStreamScreen getEncodeOptionCombinations")
        val combinations = getEncodeOptionCombinations(option, deviceSize);
        var combinationIndex = 0;

        try {
            do {
                Logger.i("ScreenEncoder.internalStreamScreen combination")
                var combination: EncodeOptionCombination = combinations[combinationIndex];

                val codec = createCodec(encoderName)
                Logger.i("ScreenEncoder.internalStreamScreen createDisplay")
                val display = createDisplay()
                Logger.i("ScreenEncoder.internalStreamScreen getScreenInfo")
                val screenInfo: ScreenInfo = device.getScreenInfo()
                val contentRect: Rect = screenInfo.contentRect
                // include the locked video orientation
                val videoRect: Rect = screenInfo.videoSize.toRect()
                // does not include the locked video orientation
                val unlockedVideoRect: Rect = screenInfo.getUnlockedVideoSize().toRect()
                val videoRotation: Int = screenInfo.videoRotation
                val layerStack: Int = device.layerStack
                Logger.i("ScreenEncoder.internalStreamScreen setSize")
                setSize(format, videoRect.width(), videoRect.height())

                option.maxFps = combination.fps
                option.maxResolution = combination.resoulution


                Logger.v(
                    "ScreenEncoder internalStreamScreen bitrate:${option.bitRate}" +
                            ", frameRate:${option.frameRate}" +
                            ", frameInterval:${option.frameInterval}" +
                            ", maxfps:${combination.fps}" +
                            ", maxResolution:${combination.resoulution}" +
                            ", width:${videoRect.width()}" +
                            ", height:${videoRect.height()}" +
                            ", deviceWidth:${deviceSize.width}" +
                            ", deviceHeight:${deviceSize.height}"
                );

                var surface: Surface? = null
                try {
                    configure(codec, format)
                    surface = codec.createInputSurface()
                    setDisplaySurface(
                        display,
                        surface,
                        videoRotation,
                        contentRect,
                        unlockedVideoRect,
                        layerStack
                    )
                    codec.start()
                    Logger.i("ScreenEncoder.internalStreamScreen started")
                    alive = encode(codec, channel, option)
                    // do not call stop() on exception, it would trigger an IllegalStateException
                    codec.stop()
                    Logger.i("ScreenEncoder.internalStreamScreen stopeed")
                } catch (e: Exception) {
                    when (e) {
                        is IllegalStateException, is IllegalArgumentException -> {
                            Logger.e("ScreenEncoder.internalStreamScreen  retry. Encoding error: " + e.javaClass.name + ": " + e.message)
                            sameResTryCount++
                            if (3 < sameResTryCount) {
                                sameResTryCount = 0
                                combinationIndex += 1
                                if (combinations.size <= combinationIndex) {
                                    Logger.e("ScreenEncoder.internalStreamScreen run out of combination")
                                    throw e
                                }
                                device.setMaxResolution(combinations[combinationIndex].resoulution)
                                Logger.i("ScreenEncoder.internalStreamScreen Retrying with fps:${combination.fps}, res:${combination.resoulution} ...")
                            }
                            alive = true
                        }
                        is IOException, is InvalidEncoderException -> {
                            Logger.e("ScreenEncoder.internalStreamScreen closed. Encoding error: " + e.javaClass.name + ": " + e.message)
                            alive = false
                        }
                        else -> {
                            Logger.e("ScreenEncoder internalStreamScreen error: " + e.javaClass.name + ": " + e.message)
                            throw e
                        }
                    }
                    Thread.sleep(300)
                } finally {
                    destroyDisplay(display)
                    codec.release()
                    Logger.i("ScreenEncoder.internalStreamScreen released")
                    surface?.release()
                }
            } while (alive)
        } finally {
            device.setRotationListener(null)
        }
    }

    @Throws(IOException::class)
    private fun encode(
        codec: MediaCodec,
        channel: SendChannel<ByteArray>,
        options: Options
    ): Boolean {
        Logger.i("ScreenEncoder.encode")

        val deltaTime = if (options.maxFps == 0) 33 else 1000 / options.maxFps
        var befTime = System.currentTimeMillis()
        var eof = false
        val bufferInfo = MediaCodec.BufferInfo()
        var lastKeyframeShowTime = System.currentTimeMillis()
        while (!consumeRotationChange() && !eof) {
            val outputBufferId = codec.dequeueOutputBuffer(bufferInfo, -1)
            try {
                eof = bufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0
                if (eof) {
                    Logger.i("ScreenEncoder.encode eof")
                    break
                }
                if (channel.isClosedForSend) {
                    throw IOException("channel is closed")
                }
                if (consumeRotationChange()) {
                    // must restart encoding with new size
                    break
                }
                if (bufferInfo.flags and MediaCodec.BUFFER_FLAG_KEY_FRAME != 0) {
                    lastKeyframeShowTime = System.currentTimeMillis()
                } else {
                    val curTime = System.currentTimeMillis()
                    val elapsedTime = curTime - lastKeyframeShowTime
                    if (elapsedTime > 2000) {
                        val param = Bundle()
                        param.putInt(MediaCodec.PARAMETER_KEY_REQUEST_SYNC_FRAME, 0)
                        codec.setParameters(param)
                    }
                }
                if (outputBufferId >= 0) {
                    val codecBuffer = codec.getOutputBuffer(outputBufferId)
                    if (null != codecBuffer) {
                        IO.writeFully(channel, codecBuffer)
                    }
                }

            } finally {
                if (outputBufferId >= 0) {
                    codec.releaseOutputBuffer(outputBufferId, false)
                }
            }

            val curTime = System.currentTimeMillis()
            val elapsedTime = curTime - befTime
            val diffTime = deltaTime - elapsedTime
            if (0 < diffTime) {
                Thread.sleep(diffTime - 1)
            }
            befTime = System.currentTimeMillis()
        }
        return !eof
    }

    companion object {
        private const val KEY_MAX_FPS_TO_ENCODER = "max-fps-to-encoder"

        // Keep the values in descending order
        private const val PACKET_FLAG_CONFIG = 1L shl 63
        private const val PACKET_FLAG_KEY_FRAME = 1L shl 62


        private fun listEncoders(): Array<MediaCodecInfo> {
            val result: MutableList<MediaCodecInfo> = ArrayList()
            val list = MediaCodecList(MediaCodecList.REGULAR_CODECS)
            for (codecInfo in list.codecInfos) {
                if (codecInfo.isEncoder && Arrays.asList(*codecInfo.supportedTypes)
                        .contains(MediaFormat.MIMETYPE_VIDEO_VP8)
                ) {
                    result.add(codecInfo)
                }
            }
            return result.toTypedArray()
        }

        @Throws(IOException::class)
        private fun createCodec(encoderName: String?): MediaCodec {
            if (encoderName != null && encoderName.isNotEmpty()) {
                Logger.v("Creating encoder by name: '$encoderName'")
                return try {
                    MediaCodec.createByCodecName(encoderName)
                } catch (e: IllegalArgumentException) {
                    val encoders = listEncoders()
                    throw InvalidEncoderException(encoderName, encoders)
                }
            }
            val codec = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_VIDEO_VP8)
            Logger.v("Using encoder: '" + codec.name + "'")
            return codec
        }

        private fun setCodecOption(format: MediaFormat, codecOption: CodecOption) {
            val key: String = codecOption.key
            val value: Any = codecOption.value
            if (value is Int) {
                format.setInteger(key, value)
            } else if (value is Long) {
                format.setLong(key, value)
            } else if (value is Float) {
                format.setFloat(key, value)
            } else if (value is String) {
                format.setString(key, value)
            }
            Logger.v("Codec option set: " + key + " (" + value.javaClass.simpleName + ") = " + value)
        }

        private fun createFormat(
            options: Options,
            codecOptions: List<CodecOption>?
        ): MediaFormat {
            val format = MediaFormat()
            format.setString(MediaFormat.KEY_MIME, MediaFormat.MIMETYPE_VIDEO_VP8)
            format.setInteger(
                MediaFormat.KEY_COLOR_FORMAT,
                MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface
            )
            format.setInteger(MediaFormat.KEY_LATENCY, 0)
//            format.setInteger(MediaFormat.KEY_QUALITY, 1)
//            format.setInteger(MediaFormat.KEY_INTRA_REFRESH_PERIOD, 10)
            format.setInteger(MediaFormat.KEY_PRIORITY, 0)

            format.setInteger(MediaFormat.KEY_BIT_RATE, options.bitRate)
            // must be present to configure the encoder, but does not impact the actual frame rate, which is variable
            format.setInteger(MediaFormat.KEY_FRAME_RATE, options.frameRate)
            format.setInteger(MediaFormat.KEY_OPERATING_RATE, options.frameRate)
            format.setInteger(MediaFormat.KEY_CAPTURE_RATE, options.frameRate)
            format.setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, options.frameInterval)
            // display the very first frame, and recover from bad quality when no new frames
            format.setLong(
                MediaFormat.KEY_REPEAT_PREVIOUS_FRAME_AFTER,
                options.repeatFrameDelay.toLong()
            ) // µs

            if (options.maxFps > 0) {
                // The key existed privately before Android 10:
                // <https://android.googlesource.com/platform/frameworks/base/+/625f0aad9f7a259b6881006ad8710adce57d1384%5E%21/>
                // <https://github.com/Genymobile/scrcpy/issues/488#issuecomment-567321437>
                format.setFloat(KEY_MAX_FPS_TO_ENCODER, options.maxFps.toFloat())
            }
            if (codecOptions != null) {
                for (codecOption in codecOptions) {
                    setCodecOption(format, codecOption)
                }
            }
            return format
        }

        private fun createDisplay(): IBinder {
            // Since Android 12 (preview), secure displays could not be created with shell permissions anymore.
            // On Android 12 preview, SDK_INT is still R (not S), but CODENAME is "S".
            val secure =
                Build.VERSION.SDK_INT < Build.VERSION_CODES.R || Build.VERSION.SDK_INT == Build.VERSION_CODES.R && "S" != Build.VERSION.CODENAME
            return SurfaceControl.createDisplay("scrcpy", secure)
        }

        private fun configure(codec: MediaCodec, format: MediaFormat) {
            codec.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
        }

        private fun setSize(format: MediaFormat, width: Int, height: Int) {
            format.setInteger(MediaFormat.KEY_WIDTH, width)
            format.setInteger(MediaFormat.KEY_HEIGHT, height)
        }

        private fun setDisplaySurface(
            display: IBinder,
            surface: Surface,
            orientation: Int,
            deviceRect: Rect,
            displayRect: Rect,
            layerStack: Int
        ) {
            SurfaceControl.openTransaction()
            try {
                SurfaceControl.setDisplaySurface(display, surface)
                SurfaceControl.setDisplayProjection(display, orientation, deviceRect, displayRect)
                SurfaceControl.setDisplayLayerStack(display, layerStack)
            } finally {
                SurfaceControl.closeTransaction()
            }
        }

        private fun destroyDisplay(display: IBinder) {
            SurfaceControl.destroyDisplay(display)
        }

        private val MAX_FPS_FALLBACK = intArrayOf(60, 45, 30, 20, 15)
        private val MAX_SIZE_FALLBACK = intArrayOf(1080, 960, 840, 720, 600, 480, 360)

        private fun getEncodeOptionCombinations(
            option: Options,
            deviceSize: Size
        ): List<EncodeOptionCombination> {
            val combinations: MutableList<EncodeOptionCombination> = ArrayList()
            val fpsFallbacks = intArrayOf(option.maxFps, *MAX_FPS_FALLBACK)
            val sizeFallbacks = intArrayOf(option.maxResolution, *MAX_SIZE_FALLBACK)
            var longerInDeviceSize = deviceSize.width.coerceAtLeast(deviceSize.height)


            for (maxFps in fpsFallbacks) {
                if (maxFps > option.maxFps) {
                    continue
                }
                for (maxSize in sizeFallbacks) {
                    if (maxSize > option.maxResolution) {
                        continue
                    }
                    combinations.add(EncodeOptionCombination(maxFps, maxSize))
//                    combinations.add(EncodeOptionCombination(maxFps, longerInDeviceSize))
                }
            }

            return combinations
        }


        private fun chooseMaxResolutionFallback(failedSize: Size): Int {
            val currentMaxResolution: Int = Math.min(failedSize.width, failedSize.height)
            for (value in MAX_SIZE_FALLBACK) {
                if (value < currentMaxResolution) {
                    // We found a smaller value to reduce the video size
                    return value
                }
            }
            // No fallback, fail definitively
            return 0
        }

    }

    init {
        this.codecOptions = codecOptions
        this.encoderName = encoderName
        this.downsizeOnError = downsizeOnError
    }

}
