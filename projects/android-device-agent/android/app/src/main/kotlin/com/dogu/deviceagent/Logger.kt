package com.dogu.deviceagent

import android.util.Log
import org.slf4j.LoggerFactory

interface ILogger {
    fun v(msg: String)
    fun i(msg: String)
    fun e(msg: String)
}

class Logger {
    companion object {
        private var deviceNickName = "";
        private val TAG = "deviceagent"
        private val logbackLogger = LoggerFactory.getLogger(org.slf4j.Logger.ROOT_LOGGER_NAME)

        fun setDeviceNickName(nickName: String) {
            deviceNickName = nickName
        }
        fun formatMsg(msg: String): String {
            return "${Thread.currentThread().id}|$deviceNickName > $msg"

        }

        fun v(msg: String) {
            Log.v(TAG, formatMsg(msg))
            logbackLogger.debug(formatMsg(msg))
        }

        fun i(msg: String) {
            Log.i(TAG, formatMsg(msg))
            logbackLogger.info(formatMsg(msg))
        }

        fun w(msg: String) {
            Log.w(TAG, formatMsg(msg))
            logbackLogger.warn(formatMsg(msg))
        }

        fun e(msg: String) {
            Log.e(TAG, formatMsg(msg))
            logbackLogger.error(formatMsg(msg))
        }
    }
}

