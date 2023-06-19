package com.dogu.deviceagent.control

import android.os.Build
import android.os.SystemClock
import android.view.InputDevice
import android.view.KeyCharacterMap
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.MotionEvent.PointerCoords
import android.view.MotionEvent.PointerProperties
import com.dogu.deviceagent.Device
import com.dogu.deviceagent.Logger
import com.dogu.deviceagent.screen.Point
import com.dogu.deviceagent.screen.Position
import java.io.IOException
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

import com.dogu.protocol.generated.inner.types.DeviceControlOuterClass.DeviceControl
import com.dogu.protocol.generated.inner.types.DeviceControlOuterClass.DeviceControlType
import com.dogu.protocol.generated.inner.types.DeviceControlOuterClass.DeviceControlCopyKey
import com.dogu.protocol.generated.inner.types.DeviceControlOuterClass.DeviceControlSequece
import com.dogu.protocol.generated.outer.Errors


class Controller(
    device: Device,
    clipboardAutosync: Boolean,
    powerOn: Boolean
) {
    private val device: Device
    private val clipboardAutosync: Boolean
    private val powerOn: Boolean
    private val charMap = KeyCharacterMap.load(KeyCharacterMap.VIRTUAL_KEYBOARD)
    private var lastTouchDown: Long = 0
    private var lastTouchDownFromRemote: Long = 0
    private val pointersState: PointersState = PointersState()
    private val pointerProperties = Array<PointerProperties>(PointersState.MAX_POINTERS){ PointerProperties() }
    private val pointerCoords = Array<PointerCoords>(PointersState.MAX_POINTERS){ PointerCoords() }
    private var keepPowerModeOff = false
    private fun initPointers() {
        for (i in 0 until PointersState.MAX_POINTERS) {
            val props = PointerProperties()
            props.toolType = MotionEvent.TOOL_TYPE_FINGER
            val coords = PointerCoords()
            coords.orientation = 0f
            coords.size = 0f
            pointerProperties[i] = props
            pointerCoords[i] = coords
        }
    }

    @Throws(IOException::class)
    fun handleEvent(msg : DeviceControl) : Errors.ErrorResult{

        // on start, power on the device
        if (powerOn && !Device.isScreenOn) {
            device.pressReleaseKeycode(KeyEvent.KEYCODE_POWER, Device.INJECT_MODE_ASYNC)

            // dirty hack
            // After POWER is injected, the device is powered on asynchronously.
            // To turn the device screen off while mirroring, the client will send a message that
            // would be handled before the device is actually powered on, so its effect would
            // be "canceled" once the device is turned back on.
            // Adding this delay prevents to handle the message before the device is actually
            // powered on.
            SystemClock.sleep(500)
        }
        when (msg.type) {
            DeviceControlType.DEVICE_CONTROL_TYPE_AOS_INJECT_KEYCODE -> if (device.supportsInputEvents()) {
                injectKeycode(
                    msg.action.number,
                    msg.keycode.number,
                    msg.repeat,
                    msg.metaState.number
                )
            }
            DeviceControlType.DEVICE_CONTROL_TYPE_AOS_INJECT_TEXT -> if (device.supportsInputEvents()) {
                injectText(msg.getText())
            }
            DeviceControlType.DEVICE_CONTROL_TYPE_AOS_INJECT_TOUCH_EVENT -> if (device.supportsInputEvents()) {
                injectTouch(
                    msg.action.number,
                    msg.pointerId,
                    Position(msg.position),
                    msg.pressure,
                    msg.buttons,
                    msg.timeStamp
                )
            }
            DeviceControlType.DEVICE_CONTROL_TYPE_AOS_INJECT_SCROLL_EVENT -> if (device.supportsInputEvents()) {
                injectScroll(
                    Position(msg.position),
                    msg.hScroll,
                    msg.vScroll,
                    msg.buttons,
                    msg.timeStamp
                )
            }
            DeviceControlType.DEVICE_CONTROL_TYPE_AOS_BACK_OR_SCREEN_ON -> if (device.supportsInputEvents()) {
                pressBackOrTurnScreenOn(msg.action.number)
            }
            DeviceControlType.DEVICE_CONTROL_TYPE_AOS_EXPAND_NOTIFICATION_PANEL -> Device.expandNotificationPanel()
            DeviceControlType.DEVICE_CONTROL_TYPE_AOS_EXPAND_SETTINGS_PANEL -> Device.expandSettingsPanel()
            DeviceControlType.DEVICE_CONTROL_TYPE_AOS_COLLAPSE_PANELS -> Device.collapsePanels()
            DeviceControlType.DEVICE_CONTROL_TYPE_AOS_GET_CLIPBOARD -> getClipboard(msg.copyKey.number)
            DeviceControlType.DEVICE_CONTROL_TYPE_AOS_SET_CLIPBOARD -> setClipboard(
                msg.text,
                msg.paste,
                msg.sequence
            )
            DeviceControlType.DEVICE_CONTROL_TYPE_AOS_SET_SCREEN_POWER_MODE -> if (device.supportsInputEvents()) {
                val mode: Int = msg.action.number
                val setPowerModeOk: Boolean = Device.setScreenPowerMode(mode)
                if (setPowerModeOk) {
                    keepPowerModeOff = mode == Device.POWER_MODE_OFF
                    Logger.i("Device screen turned " + if (mode == Device.POWER_MODE_OFF) "off" else "on")
                }
            }
            DeviceControlType.DEVICE_CONTROL_TYPE_AOS_ROTATE_DEVICE -> Device.rotateDevice()
            else -> {}
        }

        return Errors.ErrorResult.newBuilder().build();
    }

    private fun injectKeycode(action: Int, keycode: Int, repeat: Int, metaState: Int): Boolean {
        if (keepPowerModeOff && action == KeyEvent.ACTION_UP && (keycode == KeyEvent.KEYCODE_POWER || keycode == KeyEvent.KEYCODE_WAKEUP)) {
            schedulePowerModeOff()
        }
        return device.injectKeyEvent(action, keycode, repeat, metaState, Device.INJECT_MODE_ASYNC)
    }

    private fun injectChar(c: Char): Boolean {
        val decomposed: String? = KeyComposition.decompose(c)
        val chars = decomposed?.toCharArray() ?: charArrayOf(c)
        val events = charMap.getEvents(chars) ?: return false
        for (event in events) {
            if (!device.injectEvent(event, Device.INJECT_MODE_ASYNC)) {
                return false
            }
        }
        return true
    }

    private fun injectText(text: String): Int {
        var successCount = 0
        for (c in text.toCharArray()) {
            if (!injectChar(c)) {
                Logger.w("Could not inject char u+" + String.format("%04x", c.code))
                continue
            }
            successCount++
        }
        return successCount
    }

    private fun injectTouch(
        action: Int,
        pointerId: Long,
        position: Position,
        pressure: Float,
        buttons: Int,
        timeStamp: Long
    ): Boolean {
        var action = action
        var buttons = buttons
        val now = SystemClock.uptimeMillis()
        val point: Point? = device.getPhysicalPoint(position)
        if (point == null) {
            Logger.w("Ignore touch event, it was generated for a different device size")
            return false
        }
        val pointerIndex: Int = pointersState.getPointerIndex(pointerId)
        if (pointerIndex == -1) {
            Logger.w("Too many pointers for touch event")
            return false
        }
        val pointer: Pointer = pointersState.get(pointerIndex)
        pointer.point = point
        pointer.pressure = pressure
        pointer.isUp = (action == MotionEvent.ACTION_UP)
        val pointerCount: Int = pointersState.update(pointerProperties, pointerCoords)
        if (pointerCount == 1) {
            if (action == MotionEvent.ACTION_DOWN) {
                lastTouchDown = now
                lastTouchDownFromRemote = timeStamp
            }
        } else {
            // secondary pointers must use ACTION_POINTER_* ORed with the pointerIndex
            if (action == MotionEvent.ACTION_UP) {
                action =
                    MotionEvent.ACTION_POINTER_UP or (pointerIndex shl MotionEvent.ACTION_POINTER_INDEX_SHIFT)
            } else if (action == MotionEvent.ACTION_DOWN) {
                action =
                    MotionEvent.ACTION_POINTER_DOWN or (pointerIndex shl MotionEvent.ACTION_POINTER_INDEX_SHIFT)
            }
        }

        // Right-click and middle-click only work if the source is a mouse
        val nonPrimaryButtonPressed = buttons and MotionEvent.BUTTON_PRIMARY.inv() != 0
        val source =
            if (nonPrimaryButtonPressed) InputDevice.SOURCE_MOUSE else InputDevice.SOURCE_TOUCHSCREEN
        if (source != InputDevice.SOURCE_MOUSE) {
            // Buttons must not be set for touch events
            buttons = 0
        }
        val event = MotionEvent
            .obtain(
                lastTouchDown,
                lastTouchDown + (timeStamp - lastTouchDownFromRemote),
                action,
                pointerCount,
                pointerProperties,
                pointerCoords,
                0,
                buttons,
                1f,
                1f,
                DEFAULT_DEVICE_ID,
                0,
                source,
                0
            )
        return device.injectEvent(event, Device.INJECT_MODE_ASYNC)
    }

    private fun injectScroll(
        position: Position,
        hScroll: Int,
        vScroll: Int,
        buttons: Int,
        timeStamp: Long
    ): Boolean {
        val now = SystemClock.uptimeMillis()
        val point: Point = device.getPhysicalPoint(position)
            ?: // ignore event
            return false
        val props = pointerProperties[0]
        props!!.id = 0
        val coords = pointerCoords[0]
        coords!!.x = point.x.toFloat()
        coords.y = point.y.toFloat()
        coords.setAxisValue(MotionEvent.AXIS_HSCROLL, hScroll.toFloat() / 50.0f)
        coords.setAxisValue(MotionEvent.AXIS_VSCROLL, vScroll.toFloat() / 50.0f)
        val event = MotionEvent
            .obtain(
                lastTouchDown,
                lastTouchDown + (timeStamp - lastTouchDownFromRemote),
                MotionEvent.ACTION_SCROLL,
                1,
                pointerProperties,
                pointerCoords,
                0,
                buttons,
                1f,
                1f,
                Controller.Companion.DEFAULT_DEVICE_ID,
                0,
                InputDevice.SOURCE_MOUSE,
                0
            )
        return device.injectEvent(event, Device.INJECT_MODE_ASYNC)
    }

    private fun pressBackOrTurnScreenOn(action: Int): Boolean {
        if (Device.isScreenOn) {
            return device.injectKeyEvent(
                action,
                KeyEvent.KEYCODE_BACK,
                0,
                0,
                Device.INJECT_MODE_ASYNC
            )
        }

        // Screen is off
        // Only press POWER on ACTION_DOWN
        if (action != KeyEvent.ACTION_DOWN) {
            // do nothing,
            return true
        }
        if (keepPowerModeOff) {
            schedulePowerModeOff()
        }
        return device.pressReleaseKeycode(KeyEvent.KEYCODE_POWER, Device.INJECT_MODE_ASYNC)
    }

    private fun getClipboard(copyKey: Int) {
        // On Android >= 7, press the COPY or CUT key if requested
        if (copyKey != DeviceControlCopyKey.DEVICE_CONTROL_COPY_KEY_UNSPECIFIED_VALUE && Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && device.supportsInputEvents()) {
            val key =
                if (copyKey == DeviceControlCopyKey.DEVICE_CONTROL_COPY_KEY_COPY_VALUE) KeyEvent.KEYCODE_COPY else KeyEvent.KEYCODE_CUT
            // Wait until the event is finished, to ensure that the clipboard text we read just after is the correct one
            device.pressReleaseKeycode(key, Device.INJECT_MODE_WAIT_FOR_FINISH)
        }

        // If clipboard autosync is enabled, then the device clipboard is synchronized to the computer clipboard whenever it changes, in
        // particular when COPY or CUT are injected, so it should not be synchronized twice. On Android < 7, do not synchronize at all rather than
        // copying an old clipboard content.
//        if (!clipboardAutosync) {
//            val clipboardText: String? = Device.clipboardText
//            if (clipboardText != null) {
//                sender.pushClipboardText(clipboardText)
//            }
//        }
    }

    private fun setClipboard(text: String, paste: Boolean, sequence: Long): Boolean {
        Logger.i("Controller.setClipboard $text, $paste, $sequence")

        val ok: Boolean = device.setClipboardText(text)
        if (ok) {
            Logger.i("Controller.setClipboard clipboard set ok")
        }else{
            Logger.e("Controller.setClipboard clipboard set failed")
        }

        // On Android >= 7, also press the PASTE key if requested
        if (paste && Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && device.supportsInputEvents()) {
            Logger.i("Controller.setClipboard press keycode paste")
            device.pressReleaseKeycode(KeyEvent.KEYCODE_PASTE, Device.INJECT_MODE_WAIT_FOR_FINISH)
            Logger.i("Controller.setClipboard press keycode paste done")
        }
//        if (sequence != DeviceControlSequece.DEVICE_CONTROL_SEQUECE_UNSPECIFIED_VALUE.toLong()) {
//            // Acknowledgement requested
//            sender.pushAckClipboard(sequence)
//        }
        return ok
    }

    companion object {
        private const val DEFAULT_DEVICE_ID = 0
        private val EXECUTOR = Executors.newSingleThreadScheduledExecutor()

        /**
         * Schedule a call to set power mode to off after a small delay.
         */
        private fun schedulePowerModeOff() {
            EXECUTOR.schedule(Runnable {
                Logger.i("Forcing screen off")
                Device.setScreenPowerMode(Device.POWER_MODE_OFF)
            }, 200, TimeUnit.MILLISECONDS)
        }
    }

    init {
        this.device = device
        this.clipboardAutosync = clipboardAutosync
        this.powerOn = powerOn
        initPointers()
    }
}
