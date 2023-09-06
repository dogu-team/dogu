package com.dogu.deviceagent.reflect

import android.annotation.SuppressLint
import android.os.IBinder
import android.os.IInterface
import com.dogu.deviceagent.Logger
import java.lang.reflect.InvocationTargetException
import java.lang.reflect.Method


@SuppressLint("PrivateApi,DiscouragedPrivateApi")
class ServiceManager {
    private var getServiceMethod: Method? = null
    val activityManager = ActivityManager()

    var windowManager: WindowManager? = null
        get() {
            if (field == null) {
                field = WindowManager(getService("window", "android.view.IWindowManager"))
            }
            return field
        }
        private set
    var displayManager: DisplayManager? = null
        get() {
            if (field == null) {
                field = try {
                    val displayManager = try {
                        val dmClass = Class.forName("android.hardware.display.DisplayManagerGlobal")
                        val getInstanceMethod =
                            dmClass.javaClass.getDeclaredMethod("getInstance")
                        DisplayManager(getInstanceMethod.invoke(null) as IInterface)
                    } catch (e: Exception) {
                        DisplayManager(
                            getService(
                                "display",
                                "android.hardware.display.IDisplayManager"
                            )
                        )
                    }
                    displayManager
                } catch (e: Exception) {
                    throw AssertionError(e)
                }
            }
            return field
        }
        private set
    var inputManager: InputManager? = null
        get() {
            if (field == null) {
                field = try {
                    val inputManagerTried = try{
                        val im = ReflectObject("android.hardware.input.InputManagerGlobal",).callStatic(
                            Object::class,
                            "getInstance"
                        )
                        InputManager(im)
                    } catch (e: Exception) {
                        Logger.e("Could not get InputManagerGlobal, try with InputManager. $e")
                        val getInstanceMethod =
                            android.hardware.input.InputManager::class.java.getDeclaredMethod("getInstance")
                        val im = getInstanceMethod.invoke(null) as Object
                        InputManager(im)
                    }
                    inputManagerTried
                } catch (e: NoSuchMethodException) {
                    throw AssertionError(e)
                } catch (e: IllegalAccessException) {
                    throw AssertionError(e)
                } catch (e: InvocationTargetException) {
                    throw AssertionError(e)
                }
            }
            return field
        }
        private set
    var powerManager: PowerManager? = null
        get() {
            if (field == null) {
                field = PowerManager(getService("power", "android.os.IPowerManager"))
            }
            return field
        }
        private set
    var statusBarManager: StatusBarManager? = null
        get() {
            if (field == null) {
                field = StatusBarManager(
                    getService(
                        "statusbar",
                        "com.android.internal.statusbar.IStatusBarService"
                    )
                )
            }
            return field
        }
        private set

    // Some devices have no clipboard manager
    // <https://github.com/Genymobile/scrcpy/issues/1440>
    // <https://github.com/Genymobile/scrcpy/issues/1556>
    var clipboardManager: ClipboardManager? = null
        get() {
            if (field == null) {
                val clipboard = getService("clipboard", "android.content.IClipboard")
                    ?: return null
                field = ClipboardManager(clipboard)
            }
            return field
        }
        private set


    private fun getService(service: String, type: String): IInterface {
        return try {
            val binder = getServiceMethod!!.invoke(null, service) as IBinder
            val asInterfaceMethod = Class.forName("$type\$Stub").getMethod(
                "asInterface",
                IBinder::class.java
            )
            asInterfaceMethod.invoke(null, binder) as IInterface
        } catch (e: Exception) {
            throw AssertionError(e)
        }
    }

    companion object {
        const val PACKAGE_NAME = "com.android.shell"
        const val USER_ID = 0
    }

    init {
        getServiceMethod = try {
            Class.forName("android.os.ServiceManager").getDeclaredMethod(
                "getService",
                String::class.java
            )
        } catch (e: Exception) {
            throw AssertionError(e)
        }
    }
}
