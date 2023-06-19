package com.dogu.deviceagent.screen

import android.graphics.Rect
import com.dogu.deviceagent.BuildConfig
import com.dogu.deviceagent.Device

import com.dogu.deviceagent.Logger


class ScreenInfo(
    /**
     * Device (physical) size, possibly cropped
     */
    val contentRect // device size, possibly cropped
    : Rect, unlockedVideoSize: Size, deviceRotation: Int, lockedVideoOrientation: Int
) {

    /**
     * Video size, possibly smaller than the device size, already taking the device rotation and crop into account.
     *
     *
     * However, it does not include the locked video orientation.
     */
    private val unlockedVideoSize: Size

    /**
     * Device rotation, related to the natural device orientation (0, 1, 2 or 3)
     */
    val deviceRotation: Int

    /**
     * The locked video orientation (-1: disabled, 0: normal, 1: 90° CCW, 2: 180°, 3: 90° CW)
     */
    private val lockedVideoOrientation: Int

    /**
     * Return the video size as if locked video orientation was not set.
     *
     * @return the unlocked video size
     */
    fun getUnlockedVideoSize(): Size {
        return unlockedVideoSize
    }

    /**
     * Return the actual video size if locked video orientation is set.
     *
     * @return the actual video size
     */
    val videoSize: Size
        get() = if (videoRotation % 2 == 0) {
            unlockedVideoSize
        } else unlockedVideoSize.rotate()

    fun withDeviceRotation(newDeviceRotation: Int): ScreenInfo {
        if (newDeviceRotation == deviceRotation) {
            return this
        }
        // true if changed between portrait and landscape
        val orientationChanged = (deviceRotation + newDeviceRotation) % 2 != 0
        val newContentRect: Rect
        val newUnlockedVideoSize: Size
        if (orientationChanged) {
            newContentRect = flipRect(contentRect)
            newUnlockedVideoSize = unlockedVideoSize.rotate()
        } else {
            newContentRect = contentRect
            newUnlockedVideoSize = unlockedVideoSize
        }
        return ScreenInfo(
            newContentRect,
            newUnlockedVideoSize,
            newDeviceRotation,
            lockedVideoOrientation
        )
    }// no offset

    /**
     * Return the rotation to apply to the device rotation to get the requested locked video orientation
     *
     * @return the rotation offset
     */
    val videoRotation: Int
        get() {
            return if (lockedVideoOrientation == -1) {
                // no offset
                0
            } else (deviceRotation + 4 - lockedVideoOrientation) % 4
        }// no offset

    /**
     * Return the rotation to apply to the requested locked video orientation to get the device rotation
     *
     * @return the (reverse) rotation offset
     */
    val reverseVideoRotation: Int
        get() {
            return if (lockedVideoOrientation == -1) {
                // no offset
                0
            } else (lockedVideoOrientation + 4 - deviceRotation) % 4
        }

    companion object {
        fun computeScreenInfo(
            rotation: Int,
            deviceSize: Size,
            maxResolution: Int,
            lockedVideoOrientation: Int,
        ): ScreenInfo {
            var lockedVideoOrientation = lockedVideoOrientation
            if (lockedVideoOrientation == Device.LOCK_VIDEO_ORIENTATION_INITIAL) {
                // The user requested to lock the video orientation to the current orientation
                lockedVideoOrientation = rotation
            }
            var contentRect = Rect(0, 0, deviceSize.width, deviceSize.height)

            val videoSize: Size =
                computeVideoSize(contentRect.width().toInt(), contentRect.height().toInt(), maxResolution)
            return ScreenInfo(contentRect, videoSize, rotation, lockedVideoOrientation)
        }

        private fun formatCrop(rect: Rect?): String {
            return rect!!.width()
                .toString() + ":" + rect.height() + ":" + rect.left + ":" + rect.top
        }

        private fun computeVideoSize(w: Int, h: Int, maxResolution: Int): Size {
            // Compute the video size and the padding of the content inside this video.
            // Principle:
            // - scale down the great side of the screen to maxResolution (if necessary);
            // - scale down the other side so that the aspect ratio is preserved;
            // - round this value to the nearest multiple of 8 (H.264 only accepts multiples of 8)
            var w = w
            var h = h
            w = w and 7.inv() // in case it's not a multiple of 8
            h = h and 7.inv()
            if (maxResolution > 0) {
                if (BuildConfig.DEBUG && maxResolution % 8 != 0) {
                    throw AssertionError("Max size must be a multiple of 8")
                }
                val portrait = h > w
                var major = if (portrait) h else w
                var minor = if (portrait) w else h
                if (major > maxResolution) {
                    val majorExact = major * maxResolution / minor
                    val minorExact = minor * maxResolution / major
                    // +4 to round the value to the nearest multiple of 8
                    minor = maxResolution
                    major = majorExact + 4 and 7.inv()
                }
                w = if (portrait) minor else major
                h = if (portrait) major else minor
            }
            return Size(w, h)
        }

        private fun flipRect(crop: Rect): Rect {
            return Rect(crop.top, crop.left, crop.bottom, crop.right)
        }
    }

    init {
        this.unlockedVideoSize = unlockedVideoSize
        this.deviceRotation = deviceRotation
        this.lockedVideoOrientation = lockedVideoOrientation
    }
}
