package com.dogu.deviceagent.screen.exception

import android.media.MediaCodecInfo


class InvalidEncoderException(val name: String, val availableEncoders: Array<MediaCodecInfo>) :
    RuntimeException("There is no encoder having name '$name\", availables: ${availableEncoders.map { it.name }}")
