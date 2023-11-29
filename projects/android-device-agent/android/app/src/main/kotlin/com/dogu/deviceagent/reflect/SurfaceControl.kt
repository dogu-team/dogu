package com.dogu.deviceagent.reflect


import android.annotation.SuppressLint
import android.graphics.Rect
import android.os.Build
import android.os.IBinder
import android.view.Surface
import com.dogu.deviceagent.Logger
import java.lang.reflect.InvocationTargetException
import java.lang.reflect.Method

@SuppressLint("PrivateApi")
object SurfaceControl {
    private var CLASS: Class<*>? = null

    // see <https://android.googlesource.com/platform/frameworks/base.git/+/pie-release-2/core/java/android/view/SurfaceControl.java#305>
    const val POWER_MODE_OFF = 0
    const val POWER_MODE_NORMAL = 2

    // the method signature has changed in Android Q
    // <https://github.com/Genymobile/scrcpy/issues/586>
    @get:Throws(NoSuchMethodException::class)
    private var getBuiltInDisplayMethod: Method? = null
        private get() {
            if (field == null) {
                // the method signature has changed in Android Q
                // <https://github.com/Genymobile/scrcpy/issues/586>
                field = if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                    CLASS!!.getMethod(
                        "getBuiltInDisplay",
                        Int::class.javaPrimitiveType
                    )
                } else {
                    CLASS!!.getMethod("getInternalDisplayToken")
                }
            }
            return field
        }

    @get:Throws(NoSuchMethodException::class)
    private var setDisplayPowerModeMethod: Method? = null
        private get() {
            if (field == null) {
                field = CLASS!!.getMethod(
                    "setDisplayPowerMode",
                    IBinder::class.java,
                    Int::class.javaPrimitiveType
                )
            }
            return field
        }

    fun openTransaction() {
        try {
            CLASS!!.getMethod("openTransaction").invoke(null)
        } catch (e: Exception) {
            throw e
        }
    }

    fun closeTransaction() {
        try {
            CLASS!!.getMethod("closeTransaction").invoke(null)
        } catch (e: Exception) {
            throw e
        }
    }

    fun setDisplayProjection(
        displayToken: IBinder?,
        orientation: Int,
        layerStackRect: Rect?,
        displayRect: Rect?
    ) {
        try {
            CLASS!!.getMethod(
                "setDisplayProjection",
                IBinder::class.java,
                Int::class.javaPrimitiveType,
                Rect::class.java,
                Rect::class.java
            )
                .invoke(null, displayToken, orientation, layerStackRect, displayRect)
        } catch (e: Exception) {
            throw e
        }
    }

    fun setDisplayLayerStack(displayToken: IBinder?, layerStack: Int) {
        try {
            CLASS!!.getMethod(
                "setDisplayLayerStack",
                IBinder::class.java,
                Int::class.javaPrimitiveType
            ).invoke(null, displayToken, layerStack)
        } catch (e: Exception) {
            throw e
        }
    }

    fun setDisplaySurface(displayToken: IBinder?, surface: Surface?) {
        try {
            CLASS!!.getMethod("setDisplaySurface", IBinder::class.java, Surface::class.java)
                .invoke(null, displayToken, surface)
        } catch (e: Exception) {
            throw e
        }
    }

    fun createDisplay(name: String?, secure: Boolean): IBinder {
        return try {
            CLASS!!.getMethod("createDisplay", String::class.java, Boolean::class.javaPrimitiveType)
                .invoke(null, name, secure) as IBinder
        } catch (e: Exception) {
            throw e
        }
    }

    // call getBuiltInDisplay(0)

    // call getInternalDisplayToken()
    val builtInDisplay: IBinder?
        get() = try {
            val method = getBuiltInDisplayMethod
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                // call getBuiltInDisplay(0)
                method!!.invoke(null, 0) as IBinder
            } else method!!.invoke(null) as IBinder

            // call getInternalDisplayToken()
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

    fun setDisplayPowerMode(displayToken: IBinder?, mode: Int): Boolean {
        return try {
            val method = setDisplayPowerModeMethod
            method!!.invoke(null, displayToken, mode)
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

    fun destroyDisplay(displayToken: IBinder?) {
        try {
            CLASS!!.getMethod("destroyDisplay", IBinder::class.java).invoke(null, displayToken)
        } catch (e: Exception) {
            throw e
        }
    }

    init {
        try {
            CLASS = Class.forName("android.view.SurfaceControl")
        } catch (e: ClassNotFoundException) {
            throw e
        }
    }
}
