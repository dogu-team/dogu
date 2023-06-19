package com.dogu.deviceagent.reflect


import android.annotation.SuppressLint
import android.os.Bundle
import android.os.IBinder
import com.dogu.deviceagent.Logger
import com.dogu.deviceagent.screen.exception.SettingsException
import java.io.Closeable
import java.lang.reflect.InvocationTargetException
import java.lang.reflect.Method

class ContentProvider internal constructor(
    private val manager: ActivityManager, // android.content.IContentProvider
    private val provider: Any, private val name: String, private val token: IBinder
) :
    Closeable {
    // old versions
    @get:Throws(NoSuchMethodException::class)
    @get:SuppressLint("PrivateApi")
    private var callMethod: Method? = null
        private get() {
            if (field == null) {
                try {
                    val attributionSourceClass = Class.forName("android.content.AttributionSource")
                    field = provider.javaClass.getMethod(
                        "call", attributionSourceClass,
                        String::class.java,
                        String::class.java,
                        String::class.java,
                        Bundle::class.java
                    )
                    callMethodVersion = 0
                } catch (e0: NoSuchMethodException) {
                    // old versions
                    try {
                        field = provider.javaClass
                            .getMethod(
                                "call",
                                String::class.java,
                                String::class.java,
                                String::class.java,
                                String::class.java,
                                String::class.java,
                                Bundle::class.java
                            )
                        callMethodVersion = 1
                    } catch (e1: NoSuchMethodException) {
                        try {
                            field = provider.javaClass.getMethod(
                                "call",
                                String::class.java,
                                String::class.java,
                                String::class.java,
                                String::class.java,
                                Bundle::class.java
                            )
                            callMethodVersion = 2
                        } catch (e2: NoSuchMethodException) {
                            field = provider.javaClass.getMethod(
                                "call",
                                String::class.java,
                                String::class.java,
                                String::class.java,
                                Bundle::class.java
                            )
                            callMethodVersion = 3
                        }
                    }
                } catch (e0: ClassNotFoundException) {
                    try {
                        field = provider.javaClass
                            .getMethod(
                                "call",
                                String::class.java,
                                String::class.java,
                                String::class.java,
                                String::class.java,
                                String::class.java,
                                Bundle::class.java
                            )
                        callMethodVersion = 1
                    } catch (e1: NoSuchMethodException) {
                        try {
                            field = provider.javaClass.getMethod(
                                "call",
                                String::class.java,
                                String::class.java,
                                String::class.java,
                                String::class.java,
                                Bundle::class.java
                            )
                            callMethodVersion = 2
                        } catch (e2: NoSuchMethodException) {
                            field = provider.javaClass.getMethod(
                                "call",
                                String::class.java,
                                String::class.java,
                                String::class.java,
                                Bundle::class.java
                            )
                            callMethodVersion = 3
                        }
                    }
                }
            }
            return field
        }
    private var callMethodVersion = 0

    @get:Throws(
        ClassNotFoundException::class,
        NoSuchMethodException::class,
        IllegalAccessException::class,
        InvocationTargetException::class,
        InstantiationException::class
    )
    @get:SuppressLint("PrivateApi")
    private var attributionSource: Any? = null
        private get() {
            if (field == null) {
                val cl = Class.forName("android.content.AttributionSource\$Builder")
                val builder = cl.getConstructor(Int::class.javaPrimitiveType)
                    .newInstance(ServiceManager.USER_ID)
                cl.getDeclaredMethod("setPackageName", String::class.java)
                    .invoke(builder, ServiceManager.PACKAGE_NAME)
                field = cl.getDeclaredMethod("build").invoke(builder)
            }
            return field
        }

    @Throws(
        ClassNotFoundException::class,
        NoSuchMethodException::class,
        InvocationTargetException::class,
        InstantiationException::class,
        IllegalAccessException::class
    )
    private fun call(callMethodName: String, arg: String, extras: Bundle): Bundle {
        return try {
            val method: Method? = callMethod
            val args: Array<Any?>
            args = when (callMethodVersion) {
                0 -> arrayOf(attributionSource, "settings", callMethodName, arg, extras)
                1 -> arrayOf(ServiceManager.PACKAGE_NAME, null, "settings", callMethodName, arg, extras)
                2 -> arrayOf(ServiceManager.PACKAGE_NAME, "settings", callMethodName, arg, extras)
                else -> arrayOf(ServiceManager.PACKAGE_NAME, callMethodName, arg, extras)
            }
            method?.invoke(provider, *args) as Bundle
        } catch (e: InvocationTargetException) {
            Logger.e("Could not invoke method $e")
            throw e
        } catch (e: IllegalAccessException) {
            Logger.e("Could not invoke method $e")
            throw e
        } catch (e: NoSuchMethodException) {
            Logger.e("Could not invoke method $e")
            throw e
        } catch (e: ClassNotFoundException) {
            Logger.e("Could not invoke method $e")
            throw e
        } catch (e: InstantiationException) {
            Logger.e("Could not invoke method $e")
            throw e
        }
    }

    override fun close() {
        manager.removeContentProviderExternal(name, token)
    }

    @Throws(SettingsException::class)
    fun getValue(table: String, key: String): String? {
        val method = getGetMethod(table)
        val arg = Bundle()
        arg.putInt(CALL_METHOD_USER_KEY, ServiceManager.USER_ID)
        return try {
            val bundle = call(method, key, arg) ?: return null
            bundle.getString("value")
        } catch (e: Exception) {
            throw SettingsException(table, "get", key, null, e)
        }
    }

    @Throws(SettingsException::class)
    fun putValue(table: String, key: String, value: String?) {
        val method = getPutMethod(table)
        val arg = Bundle()
        arg.putInt(CALL_METHOD_USER_KEY, ServiceManager.USER_ID)
        arg.putString(NAME_VALUE_TABLE_VALUE, value)
        try {
            call(method, key, arg)
        } catch (e: Exception) {
            throw SettingsException(table, "put", key, value, e)
        }
    }

    companion object {
        const val TABLE_SYSTEM = "system"
        const val TABLE_SECURE = "secure"
        const val TABLE_GLOBAL = "global"

        // See android/providerHolder/Settings.java
        private const val CALL_METHOD_GET_SYSTEM = "GET_system"
        private const val CALL_METHOD_GET_SECURE = "GET_secure"
        private const val CALL_METHOD_GET_GLOBAL = "GET_global"
        private const val CALL_METHOD_PUT_SYSTEM = "PUT_system"
        private const val CALL_METHOD_PUT_SECURE = "PUT_secure"
        private const val CALL_METHOD_PUT_GLOBAL = "PUT_global"
        private const val CALL_METHOD_USER_KEY = "_user"
        private const val NAME_VALUE_TABLE_VALUE = "value"
        private fun getGetMethod(table: String): String {
            return when (table) {
                TABLE_SECURE -> CALL_METHOD_GET_SECURE
                TABLE_SYSTEM -> CALL_METHOD_GET_SYSTEM
                TABLE_GLOBAL -> CALL_METHOD_GET_GLOBAL
                else -> throw IllegalArgumentException("Invalid table: $table")
            }
        }

        private fun getPutMethod(table: String): String {
            return when (table) {
                TABLE_SECURE -> CALL_METHOD_PUT_SECURE
                TABLE_SYSTEM -> CALL_METHOD_PUT_SYSTEM
                TABLE_GLOBAL -> CALL_METHOD_PUT_GLOBAL
                else -> throw IllegalArgumentException("Invalid table: $table")
            }
        }
    }
}
