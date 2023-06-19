package com.dogu.deviceagent.reflect


import android.content.ClipData
import android.content.IOnPrimaryClipChangedListener

import android.os.Build
import android.os.IInterface
import com.dogu.deviceagent.Logger

import java.lang.reflect.InvocationTargetException
import java.lang.reflect.Method

class ClipboardManager(private val manager: IInterface) {
    @get:Throws(NoSuchMethodException::class)
    private var getPrimaryClipMethod: Method? = null
        private get() {
            if (field == null) {
                field = if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                    manager.javaClass.getMethod("getPrimaryClip", String::class.java)
                } else {
                    manager.javaClass.getMethod(
                        "getPrimaryClip",
                        String::class.java,
                        Int::class.javaPrimitiveType
                    )
                }
            }
            return field
        }

    @get:Throws(NoSuchMethodException::class)
    private var setPrimaryClipMethod: Method? = null
        private get() {
            if (field == null) {
                field = if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                    manager.javaClass.getMethod(
                        "setPrimaryClip",
                        ClipData::class.java,
                        String::class.java
                    )
                } else {
                    manager.javaClass.getMethod(
                        "setPrimaryClip",
                        ClipData::class.java,
                        String::class.java,
                        Int::class.javaPrimitiveType
                    )
                }
            }
            return field
        }

    @get:Throws(NoSuchMethodException::class)
    private var addPrimaryClipChangedListener: Method? = null
        private get() {
            if (field == null) {
                field = if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                    manager.javaClass
                        .getMethod(
                            "addPrimaryClipChangedListener",
                            IOnPrimaryClipChangedListener::class.java,
                            String::class.java
                        )
                } else {
                    manager.javaClass
                        .getMethod(
                            "addPrimaryClipChangedListener",
                            IOnPrimaryClipChangedListener::class.java,
                            String::class.java,
                            Int::class.javaPrimitiveType
                        )
                }
            }
            return field
        }
    val text: CharSequence?
        get() = try {
            val method = getPrimaryClipMethod
            val clipData = getPrimaryClip(
                method,
                manager
            )
            if (clipData == null || clipData.itemCount == 0) {
                null
            } else clipData.getItemAt(0).text
        } catch (e: InvocationTargetException) {
            Logger.e("Could not invoke method $e")
            null
        } catch (e: IllegalAccessException) {
            Logger.e("Could not invoke method $e")
            null
        } catch (e: NoSuchMethodException) {
            Logger.e("Could not invoke method $e")
            null
        }

    fun setText(text: CharSequence?): Boolean {
        return try {
            val method = setPrimaryClipMethod
            val clipData = ClipData.newPlainText("", text)
            setPrimaryClip(method, manager, clipData)
            true
        } catch (e: InvocationTargetException) {
            Logger.e("Could not invoke method $e")
            false
        } catch (e: IllegalAccessException) {
            Logger.e("Could not invoke method $e")
            false
        } catch (e: NoSuchMethodException) {
            Logger.e("Could not invoke method $e")
            false
        }
    }

    fun addPrimaryClipChangedListener(listener: IOnPrimaryClipChangedListener): Boolean {
        return try {
            val method = addPrimaryClipChangedListener
            addPrimaryClipChangedListener(method, manager, listener)
            true
        } catch (e: InvocationTargetException) {
            Logger.e("Could not invoke method $e")
            false
        } catch (e: IllegalAccessException) {
            Logger.e("Could not invoke method $e")
            false
        } catch (e: NoSuchMethodException) {
            Logger.e("Could not invoke method $e")
            false
        }
    }

    companion object {
        @Throws(InvocationTargetException::class, IllegalAccessException::class)
        private fun getPrimaryClip(method: Method?, manager: IInterface): ClipData? {
            return if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                method!!.invoke(manager, ServiceManager.PACKAGE_NAME) as ClipData?
            } else method!!.invoke(
                manager,
                ServiceManager.PACKAGE_NAME,
                ServiceManager.USER_ID
            ) as ClipData?
        }

        @Throws(InvocationTargetException::class, IllegalAccessException::class)
        private fun setPrimaryClip(method: Method?, manager: IInterface, clipData: ClipData) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                method!!.invoke(manager, clipData, ServiceManager.PACKAGE_NAME)
            } else {
                method!!.invoke(
                    manager,
                    clipData,
                    ServiceManager.PACKAGE_NAME,
                    ServiceManager.USER_ID
                )
            }
        }

        @Throws(InvocationTargetException::class, IllegalAccessException::class)
        private fun addPrimaryClipChangedListener(
            method: Method?,
            manager: IInterface,
            listener: IOnPrimaryClipChangedListener
        ) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                method!!.invoke(manager, listener, ServiceManager.PACKAGE_NAME)
            } else {
                method!!.invoke(
                    manager,
                    listener,
                    ServiceManager.PACKAGE_NAME,
                    ServiceManager.USER_ID
                )
            }
        }
    }
}
