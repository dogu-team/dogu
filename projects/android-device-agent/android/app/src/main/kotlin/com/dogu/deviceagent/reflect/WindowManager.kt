package com.dogu.deviceagent.reflect


import android.os.IInterface
import android.view.IRotationWatcher
import com.dogu.deviceagent.InternalException
import com.dogu.deviceagent.Logger
import java.lang.reflect.InvocationTargetException
import java.lang.reflect.Method

class WindowManager(  // old version
    private val manager: IInterface
) {
    // method changed since this commit:
    // https://android.googlesource.com/platform/frameworks/base/+/8ee7285128c3843401d4c4d0412cd66e86ba49e3%5E%21/#F2
    @get:Throws(NoSuchMethodException::class)
    private var getRotationMethod: Method? = null
        private get() {
            if (field == null) {
                val cls: Class<*> = manager.javaClass
                field = try {
                    // method changed since this commit:
                    // https://android.googlesource.com/platform/frameworks/base/+/8ee7285128c3843401d4c4d0412cd66e86ba49e3%5E%21/#F2
                    cls.getMethod("getDefaultDisplayRotation")
                } catch (e: NoSuchMethodException) {
                    // old version
                    cls.getMethod("getRotation")
                }
            }
            return field
        }

    @get:Throws(NoSuchMethodException::class)
    private var freezeRotationMethod: Method? = null
        private get() {
            if (field == null) {
                field = manager.javaClass.getMethod("freezeRotation", Int::class.javaPrimitiveType)
            }
            return field
        }

    @get:Throws(NoSuchMethodException::class)
    private var isRotationFrozenMethod: Method? = null
        private get() {
            if (field == null) {
                field = manager.javaClass.getMethod("isRotationFrozen")
            }
            return field
        }

    @get:Throws(NoSuchMethodException::class)
    private var thawRotationMethod: Method? = null
        private get() {
            if (field == null) {
                field = manager.javaClass.getMethod("thawRotation")
            }
            return field
        }
    val rotation: Int
        get() = try {
            val method = getRotationMethod
            method!!.invoke(manager) as Int
        } catch (e: InvocationTargetException) {
            Logger.e("Could not invoke method $e")
            0
        } catch (e: IllegalAccessException) {
            Logger.e("Could not invoke method $e")
            0
        } catch (e: NoSuchMethodException) {
            Logger.e("Could not invoke method $e")
            0
        }

    fun freezeRotation(rotation: Int) {
        try {
            val method = freezeRotationMethod
            method!!.invoke(manager, rotation)
        } catch (e: InvocationTargetException) {
            Logger.e("Could not invoke method $e")
        } catch (e: IllegalAccessException) {
            Logger.e("Could not invoke method $e")
        } catch (e: NoSuchMethodException) {
            Logger.e("Could not invoke method $e")
        }
    }

    val isRotationFrozen: Boolean
        get() {
            return try {
                val method = isRotationFrozenMethod
                method!!.invoke(manager) as Boolean
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

    fun thawRotation() {
        try {
            val method = thawRotationMethod
            method!!.invoke(manager)
        } catch (e: InvocationTargetException) {
            Logger.e("Could not invoke method $e")
        } catch (e: IllegalAccessException) {
            Logger.e("Could not invoke method $e")
        } catch (e: NoSuchMethodException) {
            Logger.e("Could not invoke method $e")
        }
    }

    fun registerRotationWatcher(rotationWatcher: IRotationWatcher?, displayId: Int) {
        try {
            val cls: Class<*> = manager.javaClass
            try {
                // display parameter added since this commit:
                // https://android.googlesource.com/platform/frameworks/base/+/35fa3c26adcb5f6577849fd0df5228b1f67cf2c6%5E%21/#F1
                cls.getMethod(
                    "watchRotation",
                    IRotationWatcher::class.java,
                    Int::class.javaPrimitiveType
                ).invoke(
                    manager, rotationWatcher, displayId
                )
            } catch (e: NoSuchMethodException) {
                // old version
                cls.getMethod("watchRotation", IRotationWatcher::class.java)
                    .invoke(manager, rotationWatcher)
            }
        } catch (e: Exception) {
            throw e
        }
    }
}
