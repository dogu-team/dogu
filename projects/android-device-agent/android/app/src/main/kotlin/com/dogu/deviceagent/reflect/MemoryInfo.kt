package com.dogu.deviceagent.reflect

class MemoryInfo(private val memInfoReflectObj: ReflectObject) {

    //wrapper of : https://developer.android.com/reference/android/app/ActivityManager.MemoryInfo
    fun getAvailMem(): Long {
        return memInfoReflectObj.get(Long::class, "availMem")
    }

    fun isLowMemory(): Boolean {
        return memInfoReflectObj.get(Boolean::class, "lowMemory")
    }

    fun getThreshold(): Long {
        return memInfoReflectObj.get(Long::class, "threshold")
    }

    fun getTotalMem(): Long {
        return memInfoReflectObj.get(Long::class, "totalMem")
    }

}
