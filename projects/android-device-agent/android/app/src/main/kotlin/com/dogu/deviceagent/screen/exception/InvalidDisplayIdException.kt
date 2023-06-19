package com.dogu.deviceagent.screen.exception

class InvalidDisplayIdException(val displayId: Int, val availableDisplayIds: IntArray) :
    RuntimeException("There is no display having id $displayId")
