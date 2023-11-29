package com.dogu.deviceagent

import android.content.IOnPrimaryClipChangedListener
import android.graphics.Rect
import android.os.Build
import android.os.IBinder
import android.os.SystemClock
import android.view.*
import com.dogu.deviceagent.reflect.*
import com.dogu.deviceagent.reflect.SurfaceControl
import com.dogu.deviceagent.reflect.WindowManager
import com.dogu.deviceagent.screen.*
import com.dogu.deviceagent.screen.exception.InvalidDisplayIdException
import java.util.concurrent.atomic.AtomicBoolean


class Device(private val options: Options) {
    interface RotationListener {
        fun onRotationChanged(rotation: Int)
    }

    interface ClipboardListener {
        fun onClipboardTextChanged(text: String?)
    }

    private val deviceSize: Size
    private var maxResolution: Int
    private val lockVideoOrientation: Int
    private var screenInfo: ScreenInfo
    private var rotationListener: RotationListener? = null
    private var clipboardListener: ClipboardListener? = null
    private val isSettingClipboard = AtomicBoolean()

    /**
     * Logical display identifier
     */
    private val displayId: Int

    /**
     * The surface flinger layer stack associated with this logical display
     */
    val layerStack: Int
    private val supportsInputEvents: Boolean

    @Synchronized
    fun setMaxResolution(newMaxResolution: Int) {
        maxResolution = newMaxResolution
        screenInfo = ScreenInfo.computeScreenInfo(
            screenInfo.reverseVideoRotation,
            deviceSize,
            newMaxResolution,
            lockVideoOrientation,
        )
    }

    @Synchronized
    fun getScreenInfo(): ScreenInfo {
        return screenInfo
    }

    @Synchronized
    fun getDeviceSize(): Size {
        return deviceSize
    }


    fun getPhysicalPoint(position: Position): Point? {
        // it hides the field on purpose, to read it with a lock
        val screenInfo: ScreenInfo = getScreenInfo() // read with synchronization

//        val unlockedVideoSize: Size = screenInfo.getUnlockedVideoSize()

        val reverseVideoRotation: Int = screenInfo.reverseVideoRotation
        // reverse the video rotation to apply the events
        val devicePosition: Position = position.rotate(reverseVideoRotation)
        val clientVideoSize: Size = devicePosition.screenSize

//         (yow) ignore
//        if (!unlockedVideoSize.equals(clientVideoSize)) {
//            // The client sends a click relative to a video with wrong dimensions,
//            // the device may have been rotated since the event was generated, so ignore the event
//            return null
//        }

        val contentRect: Rect = screenInfo.contentRect
        val point: Point = devicePosition.getPoint()
        val convertedX: Int =
            contentRect.left + point.x * contentRect.width() / clientVideoSize.width
        val convertedY: Int =
            contentRect.top + point.y * contentRect.height() / clientVideoSize.height
        return Point(convertedX, convertedY)
    }

    fun supportsInputEvents(): Boolean {
        return supportsInputEvents
    }

    fun injectEvent(event: InputEvent?, injectMode: Int): Boolean {
        return injectEvent(event, displayId, injectMode)
    }

    fun injectKeyEvent(
        action: Int,
        keyCode: Int,
        repeat: Int,
        metaState: Int,
        injectMode: Int
    ): Boolean {
        return injectKeyEvent(
            action,
            keyCode,
            repeat,
            metaState,
            displayId,
            injectMode
        )
    }

    fun pressReleaseKeycode(keyCode: Int, injectMode: Int): Boolean {
        return pressReleaseKeycode(
            keyCode,
            displayId,
            injectMode
        )
    }

    @Synchronized
    fun setRotationListener(rotationListener: RotationListener?) {
        this.rotationListener = rotationListener
    }

    @Synchronized
    fun setClipboardListener(clipboardListener: ClipboardListener?) {
        this.clipboardListener = clipboardListener
    }

    fun setClipboardText(text: String): Boolean {
        val clipboardManager: ClipboardManager? =
            SERVICE_MANAGER.clipboardManager
        if (null == clipboardManager) {
            Logger.e("clipboardManager null")
            return false
        }
        val currentClipboard: String? = clipboardText
        if (currentClipboard != null && currentClipboard == text) {
            Logger.e("Device clipboard already contains the same text")
            // The clipboard already contains the requested text.
            // Since pasting text from the computer involves setting the device clipboard, it could be set twice on a copy-paste. This would cause
            // the clipboard listeners to be notified twice, and that would flood the Android keyboard clipboard history. To workaround this
            // problem, do not explicitly set the clipboard text if it already contains the expected content.
            return false
        }
        isSettingClipboard.set(true)
        val ok: Boolean = clipboardManager.setText(text)
        isSettingClipboard.set(false)

        return ok
    }

    companion object {
        val POWER_MODE_OFF: Int = SurfaceControl.POWER_MODE_OFF
        val POWER_MODE_NORMAL: Int = SurfaceControl.POWER_MODE_NORMAL
        val INJECT_MODE_ASYNC: Int = InputManager.INJECT_INPUT_EVENT_MODE_ASYNC
        val INJECT_MODE_WAIT_FOR_RESULT: Int = InputManager.INJECT_INPUT_EVENT_MODE_WAIT_FOR_RESULT
        val INJECT_MODE_WAIT_FOR_FINISH: Int = InputManager.INJECT_INPUT_EVENT_MODE_WAIT_FOR_FINISH
        const val LOCK_VIDEO_ORIENTATION_UNLOCKED = -1
        const val LOCK_VIDEO_ORIENTATION_INITIAL = -2
        private val SERVICE_MANAGER: ServiceManager = ServiceManager()
        private val SETTINGS: Settings =
            Settings(SERVICE_MANAGER)
        val deviceName: String
            get() = Build.MODEL

        fun supportsInputEvents(displayId: Int): Boolean {
            return displayId == 0 || Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
        }

        fun injectEvent(inputEvent: InputEvent?, displayId: Int, injectMode: Int): Boolean {
            // Logger.v("injectEvent: $inputEvent, $displayId, $injectMode")
            if (!supportsInputEvents(displayId)) {
                throw InternalException("Could not inject input event if !supportsInputEvents()")
            }
            return if (displayId != 0 && !InputManager.setDisplayId(inputEvent, displayId)) {
                false
            } else SERVICE_MANAGER.inputManager!!
                .injectInputEvent(inputEvent, injectMode)
        }

        fun injectKeyEvent(
            action: Int,
            keyCode: Int,
            repeat: Int,
            metaState: Int,
            displayId: Int,
            injectMode: Int
        ): Boolean {
            val now = SystemClock.uptimeMillis()
            val event = KeyEvent(
                now,
                now,
                action,
                keyCode,
                repeat,
                metaState,
                KeyCharacterMap.VIRTUAL_KEYBOARD,
                0,
                0,
                InputDevice.SOURCE_KEYBOARD
            )
            return injectEvent(event, displayId, injectMode)
        }

        fun pressReleaseKeycode(keyCode: Int, displayId: Int, injectMode: Int): Boolean {
            injectKeyEvent(
                KeyEvent.ACTION_DOWN,
                keyCode,
                0,
                0,
                displayId,
                injectMode
            )
            Thread.sleep(200)
            return injectKeyEvent(
                KeyEvent.ACTION_UP,
                keyCode,
                0,
                0,
                displayId,
                injectMode
            )
        }

        val isScreenOn: Boolean
            get() = SERVICE_MANAGER.powerManager?.isScreenOn ?: false

        fun expandNotificationPanel() {
            SERVICE_MANAGER.statusBarManager?.expandNotificationsPanel()
        }

        fun expandSettingsPanel() {
            SERVICE_MANAGER.statusBarManager?.expandSettingsPanel()
        }

        fun collapsePanels() {
            SERVICE_MANAGER.statusBarManager?.collapsePanels()
        }

        val clipboardText: String?
            get() {
                val clipboardManager: ClipboardManager =
                    SERVICE_MANAGER.clipboardManager
                        ?: return null
                val s: CharSequence = clipboardManager.text ?: return null
                return s.toString()
            }

        /**
         * @param mode one of the `POWER_MODE_*` constants
         */
        fun setScreenPowerMode(mode: Int): Boolean {
            val d: IBinder = SurfaceControl.builtInDisplay!!
            if (d == null) {
                Logger.e("Could not get built-in display")
                return false
            }
            return SurfaceControl.setDisplayPowerMode(d, mode)
        }

        fun powerOffScreen(displayId: Int): Boolean {
            return if (!isScreenOn) {
                true
            } else pressReleaseKeycode(
                KeyEvent.KEYCODE_POWER,
                displayId,
                INJECT_MODE_ASYNC
            )
        }

        /**
         * Disable auto-rotation (if enabled), set the screen rotation and re-enable auto-rotation (if it was enabled).
         */
        fun rotateDevice() {
            val wm: WindowManager =
                SERVICE_MANAGER.windowManager ?: return
            val accelerometerRotation: Boolean = !wm.isRotationFrozen
            val currentRotation: Int = wm.rotation
            val newRotation = currentRotation and 1 xor 1 // 0->1, 1->0, 2->1, 3->0
            val newRotationString = if (newRotation == 0) "portrait" else "landscape"
            Logger.i("Device rotation requested: $newRotationString")
            wm.freezeRotation(newRotation)

            // restore auto-rotate if necessary
            if (accelerometerRotation) {
                wm.thawRotation()
            }
        }

        val settings: Settings
            get() = SETTINGS
    }

    init {
        displayId = options.displayId
        val displayInfo: DisplayInfo? =
            SERVICE_MANAGER.displayManager?.getDisplayInfo(displayId)
        if (displayInfo == null) {
            val displayIds: IntArray =
                SERVICE_MANAGER.displayManager?.displayIds ?: intArrayOf()
            throw InvalidDisplayIdException(displayId, displayIds)
        }
        val displayInfoFlags: Int = displayInfo.flags
        deviceSize = displayInfo.size
        maxResolution = options.maxResolution
        lockVideoOrientation = options.lockVideoOrientation
        screenInfo = ScreenInfo.computeScreenInfo(
            displayInfo.rotation,
            deviceSize,
            maxResolution,
            lockVideoOrientation,
        )
        layerStack = displayInfo.layerStack
        SERVICE_MANAGER.windowManager?.registerRotationWatcher(object : IRotationWatcher.Stub() {
                override fun onRotationChanged(rotation: Int) {
                    synchronized(this@Device) {
                        screenInfo = screenInfo.withDeviceRotation(rotation)

                        // notify
                        if (rotationListener != null) {
                            rotationListener?.onRotationChanged(rotation)
                        }
                    }
                }
            }, displayId)
        if (options.control && options.clipboardAutosync) {
            // If control and autosync are enabled, synchronize Android clipboard to the computer automatically
            val clipboardManager: ClipboardManager? =
                SERVICE_MANAGER.clipboardManager
            if (clipboardManager != null) {
                clipboardManager.addPrimaryClipChangedListener(object :
                    IOnPrimaryClipChangedListener.Stub() {
                    override fun dispatchPrimaryClipChanged() {
                        if (isSettingClipboard.get()) {
                            // This is a notification for the change we are currently applying, ignore it
                            return
                        }
                        synchronized(this@Device) {
                            if (clipboardListener != null) {
                                val text: String? =
                                    clipboardText
                                if (text != null) {
                                    clipboardListener?.onClipboardTextChanged(text)
                                }
                            }
                        }
                    }
                })
            } else {
                Logger.w("No clipboard manager, copy-paste between device and computer will not work")
            }
        }
        if (displayInfoFlags and DisplayInfo.FLAG_SUPPORTS_PROTECTED_BUFFERS === 0) {
            Logger.w("Display doesn't have FLAG_SUPPORTS_PROTECTED_BUFFERS flag, mirroring can be restricted")
        }

        // main display or any display on Android >= Q
        supportsInputEvents = displayId == 0 || Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
        if (!supportsInputEvents) {
            Logger.w("Input events are not supported for secondary displays before Android 10")
        }
    }
}
