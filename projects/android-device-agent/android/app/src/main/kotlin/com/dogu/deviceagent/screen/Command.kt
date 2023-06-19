package com.dogu.deviceagent.screen

import java.io.IOException
import java.util.*


object Command {
    @Throws(IOException::class, InterruptedException::class)
    fun exec(vararg cmd: String?) {
        val process = Runtime.getRuntime().exec(cmd)
        val exitCode = process.waitFor()
        if (exitCode != 0) {
            throw IOException("Command " + Arrays.toString(cmd) + " returned with value " + exitCode)
        }
    }

    @Throws(IOException::class, InterruptedException::class)
    fun execReadLine(vararg cmd: String?): String? {
        var result: String? = null
        val process = Runtime.getRuntime().exec(cmd)
        val scanner = Scanner(process.inputStream)
        if (scanner.hasNextLine()) {
            result = scanner.nextLine()
        }
        val exitCode = process.waitFor()
        if (exitCode != 0) {
            throw IOException("Command " + Arrays.toString(cmd) + " returned with value " + exitCode)
        }
        return result
    }
}
