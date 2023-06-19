package com.dogu.deviceagent.screen

import android.media.MediaCodec
import android.media.MediaFormat
import com.dogu.deviceagent.Logger
import kotlinx.coroutines.channels.SendChannel
import java.io.IOException

class MediaCodecCallback(
    private val codec: MediaCodec,
    private val channel: SendChannel<ByteArray>,
    private val options: Options
) : MediaCodec.Callback() {
    var error : Throwable? = null
    var cloesd = false
    override fun onInputBufferAvailable(codec: MediaCodec, index: Int) {
        Logger.v("MediaCodecCallback.onOutputBufferAvailable $index")
    }

    override fun onOutputBufferAvailable(
        codec: MediaCodec,
        outputBufferId: Int,
        bufferInfo: MediaCodec.BufferInfo
    ) {
        Logger.v("MediaCodecCallback.onOutputBufferAvailable $outputBufferId")

        val eof = bufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0
        try {
            if (channel.isClosedForSend) {
                cloesd = true
//                throw IOException("channel is closed")
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
    }

    override fun onError(codec: MediaCodec, e: MediaCodec.CodecException) {
        Logger.e("MediaCodecCallback.onError $e")
        error = e
    }

    override fun onOutputFormatChanged(codec: MediaCodec, format: MediaFormat) {
        Logger.e("MediaCodecCallback.onOutputFormatChanged $format")
    }
}
