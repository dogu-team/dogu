package com.dogu.deviceagent.screen


import android.os.Build
import com.dogu.deviceagent.Logger
import com.dogu.deviceagent.reflect.ContentProvider
import com.dogu.deviceagent.reflect.ServiceManager
import com.dogu.deviceagent.screen.exception.SettingsException
import java.io.IOException


class Settings(serviceManager: ServiceManager) {
    private val serviceManager: ServiceManager

    @Throws(SettingsException::class)
    fun getValue(table: String, key: String): String {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
            // on Android >= 12, it always fails: <https://github.com/Genymobile/scrcpy/issues/2788>
            try {
                serviceManager.activityManager.createSettingsProvider().use { provider ->
                    return provider?.getValue(
                        table,
                        key
                    ) ?: ""
                }
            } catch (e: SettingsException) {
                Logger.w("Could not get settings value via ContentProvider, fallback to settings process $e")
            }
        }
        return execSettingsGet(table, key)
    }

    @Throws(SettingsException::class)
    fun putValue(table: String, key: String, value: String) {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
            // on Android >= 12, it always fails: <https://github.com/Genymobile/scrcpy/issues/2788>
            try {
                serviceManager.activityManager.createSettingsProvider().use { provider ->
                    provider?.putValue(
                        table,
                        key,
                        value
                    )
                }
            } catch (e: SettingsException) {
                Logger.w("Could not get settings value via ContentProvider, fallback to settings process $e")
            }
        }
        execSettingsPut(table, key, value)
    }

    @Throws(SettingsException::class)
    fun getAndPutValue(table: String, key: String, value: String): String {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
            // on Android >= 12, it always fails: <https://github.com/Genymobile/scrcpy/issues/2788>
            try {
                serviceManager.activityManager.createSettingsProvider().use { provider ->
                    val oldValue: String = provider?.getValue(table, key) ?: ""
                    if (value != oldValue) {
                        provider?.putValue(table, key, value)
                    }
                    return oldValue
                }
            } catch (e: SettingsException) {
                Logger.w("Could not get settings value via ContentProvider, fallback to settings process $e")
            }
        }
        val oldValue = getValue(table, key)
        if (value != oldValue) {
            putValue(table, key, value)
        }
        return oldValue
    }

    companion object {
        val TABLE_SYSTEM: String = ContentProvider.TABLE_SYSTEM
        val TABLE_SECURE: String = ContentProvider.TABLE_SECURE
        val TABLE_GLOBAL: String = ContentProvider.TABLE_GLOBAL

        @Throws(SettingsException::class)
        private fun execSettingsPut(table: String, key: String, value: String) {
            try {
                Command.exec("settings", "put", table, key, value)
            } catch (e: IOException) {
                throw SettingsException("put", table, key, value, e)
            } catch (e: InterruptedException) {
                throw SettingsException("put", table, key, value, e)
            }
        }

        @Throws(SettingsException::class)
        private fun execSettingsGet(table: String, key: String): String {
            return try {
                Command.execReadLine("settings", "get", table, key) ?: ""
            } catch (e: IOException) {
                throw SettingsException("get", table, key, null, e)
            } catch (e: InterruptedException) {
                throw SettingsException("get", table, key, null, e)
            }
        }
    }

    init {
        this.serviceManager = serviceManager
    }
}
