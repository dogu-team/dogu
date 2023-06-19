package com.dogu.deviceagent.runtimetest

import android.app.ActivityManager
import android.content.Context
import android.os.IBinder
import android.os.Looper
import android.util.Log
import com.dogu.deviceagent.Logger
import com.dogu.deviceagent.reflect.ReflectObject
import com.dogu.deviceagent.util.Constants

class ReflectionTest {
    companion object {
        fun test(){
//            testContext()
//            testActivityManager()
        }

        private fun testActivityManager() {
            Logger.i( "ReflectionTest.test")
            try {
                val obj = ReflectObject("android.app.ActivityManagerNative")
                val amInst = obj.callStatic(ReflectObject::class, "getDefault")
                Logger.v( "ActivityManagerNative.Default $amInst")

                val binder = amInst.call(ReflectObject::class, "asBinder")
                Logger.v( "ActivityManagerNative.Binder $binder")

                val iface = ReflectObject("android.app.ActivityManagerNative").callStatic(
                    ReflectObject::class,
                    "asInterface",
                    Pair(IBinder::class, binder)
                )
                Logger.v( "ActivityManagerNative.asInterface $iface")

                var isMonkey = amInst.call(Boolean::class, "isUserAMonkey");
                Logger.v( "ActivityManagerNative.isMonkey $isMonkey")


                val memInfo =
                    ReflectObject("android.app.ActivityManager\$MemoryInfo").createInstance<ActivityManager.MemoryInfo>()
                Logger.v( "ActivityManagerNative.memInfo $memInfo")

                iface.call(
                    Void::class,
                    "getMemoryInfo",
                    Pair(ActivityManager.MemoryInfo::class, memInfo)
                );
                val totlaMem = memInfo.get(Long::class, "totalMem");
                Logger.v( "ActivityManagerNative.totlaMem $totlaMem")

            } catch (e: Exception) {
                throw AssertionError(e);
            }
        }

        private fun testContext() {
            Looper.prepareMainLooper();

            val activityThread =
                ReflectObject("android.app.ActivityThread").createInstanceHidden()
            Logger.v( "ActivityManagerNative.activityThread $activityThread")

            val ctx = activityThread.call(Context::class, "getSystemContext")
            Logger.v( "ActivityManagerNative.ctx $ctx")
        }
    }
}
