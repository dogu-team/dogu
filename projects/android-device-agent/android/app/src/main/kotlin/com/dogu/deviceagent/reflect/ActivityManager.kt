package com.dogu.deviceagent.reflect

import android.app.ActivityManager
import android.os.Binder
import android.os.IBinder
import com.dogu.deviceagent.Logger
import java.lang.reflect.InvocationTargetException
import java.lang.reflect.Method

class ActivityManager {
    private val amReflectObj: ReflectObject


    fun getMemoryInfo(): MemoryInfo {
        val memInfo =
            ReflectObject("android.app.ActivityManager\$MemoryInfo").createInstance<ActivityManager.MemoryInfo>()

        amReflectObj.call(
            Void::class,
            "getMemoryInfo",
            Pair(ActivityManager.MemoryInfo::class, memInfo)
        );
        return MemoryInfo(memInfo)
    }


    fun removeContentProviderExternal(name: String, token: IBinder) {
        try {
            amReflectObj.call(
                Void::class,
                "removeContentProviderExternal",
                Pair(String::class, name),
                Pair(IBinder::class, token)
            )
        } catch (e: InvocationTargetException) {
            Logger.e("Could not invoke method $e")
        } catch (e: IllegalAccessException) {
            Logger.e("Could not invoke method $e")
        } catch (e: NoSuchMethodException) {
            Logger.e("Could not invoke method $e")
        }
    }

    fun createSettingsProvider(): ContentProvider? {
        return getContentProviderExternal("settings", Binder())
    }

    init {
        try {
            val obj = ReflectObject("android.app.ActivityManagerNative")
            val amInst = obj.callStatic(ReflectObject::class, "getDefault")
            val binder = amInst.call(ReflectObject::class, "asBinder")

            amReflectObj = ReflectObject("android.app.ActivityManagerNative").callStatic(
                ReflectObject::class,
                "asInterface",
                Pair(IBinder::class, binder)
            )
            Logger.v("ActivityManager.asInterface $amReflectObj")

        } catch (e: Exception) {
            throw e
        }
    }

    private fun getContentProviderExternal(name: String, token: IBinder): ContentProvider? {
        return try {
            var providerHolder: ReflectObject? = null
            try {
                providerHolder = amReflectObj.call(
                    ReflectObject::class,
                    "getContentProviderExternal",
                    Pair(String::class, name),
                    Pair(Int::class, ServiceManager.USER_ID),
                    Pair(IBinder::class, token),
                    Pair(String::class, "")
                )
            } catch (e: Exception) {
            }

            try {
                providerHolder = amReflectObj.call(
                    ReflectObject::class,
                    "getContentProviderExternal",
                    Pair(String::class, name),
                    Pair(Int::class, ServiceManager.USER_ID),
                    Pair(IBinder::class, token),
                    Pair(String::class, "")
                )
            } catch (e: Exception) {
            }
            val providerHolderClass = providerHolder?.getInstance()?.javaClass
            if(providerHolderClass == null) {
                return null
            }

            // ContentProviderHolder providerHolder = getContentProviderExternal(...);
            // IContentProvider provider = providerHolder.provider;
            val providerField = providerHolderClass.getDeclaredField("provider")
            providerField.isAccessible = true
            val provider = providerField[providerHolder] ?: return null
            ContentProvider(this, provider, name, token)
        } catch (e: InvocationTargetException) {
            Logger.e("Could not invoke method $e")
            null
        } catch (e: IllegalAccessException) {
            Logger.e("Could not invoke method $e")
            null
        } catch (e: NoSuchMethodException) {
            Logger.e("Could not invoke method $e")
            null
        } catch (e: NoSuchFieldException) {
            Logger.e("Could not invoke method $e")
            null
        }
    }
}
