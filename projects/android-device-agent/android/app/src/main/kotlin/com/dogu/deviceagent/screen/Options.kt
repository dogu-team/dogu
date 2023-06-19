package com.dogu.deviceagent.screen

import android.graphics.Rect
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.io.File


const val OPTIONS_PATH = "/data/local/tmp/da-options.json"

@Serializable
data class Options(
    var bitRate: Int = 8000000,
    var maxFps: Int = 0,
    var frameRate: Int = 30,
    var frameInterval: Int = 10,
    var repeatFrameDelay: Int = 100000, // repeat after 100ms
    var maxResolution: Int = 0,
    var lockVideoOrientation: Int = -1,
    var control: Boolean = true,
    var displayId: Int = 0,
    var showTouches: Boolean = false,
    var stayAwake: Boolean = false,
    var encoderName: String = "",
    var powerOffScreenOnClose: Boolean = false,
    var clipboardAutosync: Boolean = true,
    var downsizeOnError: Boolean = true,
    var cleanup: Boolean = true,
    var powerOn: Boolean = true,
)
