package com.dogu.deviceagent.util

class Strings {
    companion object {
        fun stringify(arr: Array<*>): String {
            return arr.joinToString(", ")
        }

        fun stringify(arr: List<*>): String {
            return arr.joinToString(", ")
        }
    }
}
