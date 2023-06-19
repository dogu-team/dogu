package com.dogu.deviceagent.screen

class DisplayInfo(
    val displayId: Int,
    val size: Size,
    val rotation: Int,
    val layerStack: Int,
    val flags: Int
) {

    companion object {
        const val FLAG_SUPPORTS_PROTECTED_BUFFERS = 0x00000001
    }
}
