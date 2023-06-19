package com.dogu.deviceagent.reflect


import android.os.IInterface
import com.dogu.deviceagent.Logger
import java.lang.reflect.InvocationTargetException
import java.lang.reflect.Method


class StatusBarManager(private val manager: IInterface) {
    // Custom version for custom vendor ROM: <https://github.com/Genymobile/scrcpy/issues/2551>
    @get:Throws(NoSuchMethodException::class)
    private var expandNotificationsPanelMethod: Method? = null
        private get() {
            if (field == null) {
                try {
                    field = manager.javaClass.getMethod("expandNotificationsPanel")
                } catch (e: NoSuchMethodException) {
                    // Custom version for custom vendor ROM: <https://github.com/Genymobile/scrcpy/issues/2551>
                    field = manager.javaClass.getMethod(
                        "expandNotificationsPanel",
                        Int::class.javaPrimitiveType
                    )
                    expandNotificationPanelMethodCustomVersion = true
                }
            }
            return field
        }
    private var expandNotificationPanelMethodCustomVersion = false
    private var expandSettingsPanelMethod: Method? = null
    private var expandSettingsPanelMethodNewVersion = true

    @get:Throws(NoSuchMethodException::class)
    private var collapsePanelsMethod: Method? = null
        private get() {
            if (field == null) {
                field = manager.javaClass.getMethod("collapsePanels")
            }
            return field
        }

    // Since Android 7: https://android.googlesource.com/platform/frameworks/base.git/+/a9927325eda025504d59bb6594fee8e240d95b01%5E%21/
    @get:Throws(NoSuchMethodException::class)
    private val expandSettingsPanel: Method?
        private get() {
            if (expandSettingsPanelMethod == null) {
                try {
                    // Since Android 7: https://android.googlesource.com/platform/frameworks/base.git/+/a9927325eda025504d59bb6594fee8e240d95b01%5E%21/
                    expandSettingsPanelMethod =
                        manager.javaClass.getMethod("expandSettingsPanel", String::class.java)
                } catch (e: NoSuchMethodException) {
                    // old version
                    expandSettingsPanelMethod = manager.javaClass.getMethod("expandSettingsPanel")
                    expandSettingsPanelMethodNewVersion = false
                }
            }
            return expandSettingsPanelMethod
        }

    fun expandNotificationsPanel() {
        try {
            val method = expandNotificationsPanelMethod
            if (expandNotificationPanelMethodCustomVersion) {
                method!!.invoke(manager, 0)
            } else {
                method!!.invoke(manager)
            }
        } catch (e: InvocationTargetException) {
            Logger.e("Could not invoke method $e")
        } catch (e: IllegalAccessException) {
            Logger.e("Could not invoke method $e")
        } catch (e: NoSuchMethodException) {
            Logger.e("Could not invoke method $e")
        }
    }

    fun expandSettingsPanel() {
        try {
            val method = expandSettingsPanel
            if (expandSettingsPanelMethodNewVersion) {
                // new version
                method!!.invoke(manager, null as Any?)
            } else {
                // old version
                method!!.invoke(manager)
            }
        } catch (e: InvocationTargetException) {
            Logger.e("Could not invoke method $e")
        } catch (e: IllegalAccessException) {
            Logger.e("Could not invoke method $e")
        } catch (e: NoSuchMethodException) {
            Logger.e("Could not invoke method $e")
        }
    }

    fun collapsePanels() {
        try {
            val method = collapsePanelsMethod
            method!!.invoke(manager)
        } catch (e: InvocationTargetException) {
            Logger.e("Could not invoke method $e")
        } catch (e: IllegalAccessException) {
            Logger.e("Could not invoke method $e")
        } catch (e: NoSuchMethodException) {
            Logger.e("Could not invoke method $e")
        }
    }
}
