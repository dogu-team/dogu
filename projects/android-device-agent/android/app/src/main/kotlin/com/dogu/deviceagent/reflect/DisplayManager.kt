package com.dogu.deviceagent.reflect

import android.os.IInterface
import com.dogu.deviceagent.screen.DisplayInfo
import com.dogu.deviceagent.screen.Size


class DisplayManager(private val manager: IInterface) {
    fun getDisplayInfo(displayId: Int): DisplayInfo? {
        return try {
            val displayInfo =
                manager.javaClass.getMethod("getDisplayInfo", Int::class.javaPrimitiveType).invoke(
                    manager, displayId
                ) ?: return null
            val cls: Class<*> = displayInfo.javaClass
            // width and height already take the rotation into account
            val width = cls.getDeclaredField("logicalWidth").getInt(displayInfo)
            val height = cls.getDeclaredField("logicalHeight").getInt(displayInfo)
            val rotation = cls.getDeclaredField("rotation").getInt(displayInfo)
            val layerStack = cls.getDeclaredField("layerStack").getInt(displayInfo)
            val flags = cls.getDeclaredField("flags").getInt(displayInfo)
            DisplayInfo(displayId, Size(width, height), rotation, layerStack, flags)
        } catch (e: Exception) {
            throw e
        }
    }

    val displayIds: IntArray
        get() = try {
            manager.javaClass.getMethod("getDisplayIds").invoke(manager) as IntArray
        } catch (e: Exception) {
            throw e
        }

}
