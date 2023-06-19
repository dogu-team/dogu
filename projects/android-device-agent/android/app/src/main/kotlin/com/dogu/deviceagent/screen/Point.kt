package com.dogu.deviceagent.screen

import java.util.*


class Point(val x: Int, val y: Int) {

    override fun equals(o: Any?): Boolean {
        if (this === o) {
            return true
        }
        if (o == null || javaClass != o.javaClass) {
            return false
        }
        val point = o as Point
        return x == point.x && y == point.y
    }

    override fun hashCode(): Int {
        return Objects.hash(x, y)
    }

    override fun toString(): String {
        return "Point{x=$x, y=$y}"
    }
}
