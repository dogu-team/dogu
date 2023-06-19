package com.dogu.deviceagent.screen

import java.util.*
import com.dogu.protocol.generated.inner.types.DeviceControlOuterClass.DevicePosition


class Position(point: Point, screenSize: Size) {
    private val point: Point
    val screenSize: Size

    constructor(devicePosition : DevicePosition) : this(
        Point(devicePosition.x, devicePosition.y),
        Size(devicePosition.screenWidth, devicePosition.screenHeight)
    ) {
    }

    constructor(x: Int, y: Int, screenWidth: Int, screenHeight: Int) : this(
        Point(x, y),
        Size(screenWidth, screenHeight)
    ) {
    }

    fun getPoint(): Point {
        return point
    }

    fun rotate(rotation: Int): Position {
        return when (rotation) {
            1 -> Position(
                Point(screenSize.height - point.y, point.x),
                screenSize.rotate()
            )
            2 -> Position(
                Point(
                    screenSize.width - point.x,
                    screenSize.height - point.y
                ), screenSize
            )
            3 -> Position(
                Point(point.y, screenSize.width - point.x),
                screenSize.rotate()
            )
            else -> this
        }
    }

    override fun equals(o: Any?): Boolean {
        if (this === o) {
            return true
        }
        if (o == null || javaClass != o.javaClass) {
            return false
        }
        val position = o as Position
        return point == position.point && screenSize == position.screenSize
    }

    override fun hashCode(): Int {
        return Objects.hash(point, screenSize)
    }

    override fun toString(): String {
        return "Position{point=$point, screenSize=$screenSize}"
    }

    init {
        this.point = point
        this.screenSize = screenSize
    }
}
