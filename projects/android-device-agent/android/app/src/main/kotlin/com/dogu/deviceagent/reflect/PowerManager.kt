package com.dogu.deviceagent.reflect

import android.annotation.SuppressLint
import android.os.Build
import android.os.IInterface
import com.dogu.deviceagent.Logger

import java.lang.reflect.InvocationTargetException
import java.lang.reflect.Method

class PowerManager(private val manager: IInterface) {
    // we may lower minSdkVersion in the future
    @get:Throws(NoSuchMethodException::class)
    private var isScreenOnMethod: Method? = null
        private get() {
            if (field == null) {
                @SuppressLint("ObsoleteSdkInt") val methodName// we may lower minSdkVersion in the future
                        =
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT_WATCH) "isInteractive" else "isScreenOn"
                field = manager.javaClass.getMethod(methodName)
            }
            return field
        }

    val isScreenOn: Boolean
        get() = try {
            val method = isScreenOnMethod
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
