package com.dogu.deviceagent.screen.exception

class SettingsException(
    method: String,
    table: String,
    key: String,
    value: String?,
    cause: Throwable?
) :
    Exception(createMessage(method, table, key, value), cause) {
    companion object {
        private fun createMessage(
            method: String,
            table: String,
            key: String,
            value: String?
        ): String {
            return "Could not access settings: " + method + " " + table + " " + key + if (value != null) " $value" else ""
        }
    }
}
