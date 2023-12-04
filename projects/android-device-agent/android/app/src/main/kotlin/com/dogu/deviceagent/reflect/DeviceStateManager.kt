package com.dogu.deviceagent.reflect

import android.hardware.devicestate.DeviceStateInfo
import android.hardware.devicestate.IDeviceStateManagerCallback
import android.os.Binder
import android.os.IBinder
import com.dogu.deviceagent.Logger
import java.lang.reflect.InvocationTargetException


class DeviceStateManager(private val obj: ReflectObject) {

    val callback =
        object : IDeviceStateManagerCallback {
            override fun asBinder(): IBinder {
                return Binder()
            }

            override fun onDeviceStateInfoChanged(info: DeviceStateInfo?) {
            }

            override fun onRequestActive(token: IBinder?) {
            }

            override fun onRequestCanceled(token: IBinder?) {
            }
        }

    fun getDeviceStateInfo(): DeviceStateInfo? {
        return try {
            obj.call(DeviceStateInfo::class, "getDeviceStateInfo")
        } catch (e: InvocationTargetException) {
            Logger.e("DeviceStateManager.getDeviceStateInfo failed ${e.targetException}")
            return null
        } catch (e: Exception) {
            Logger.e("DeviceStateManager.getDeviceStateInfo failed $e")
            return null
        }
    }

    fun requestState(state: Int, flags: Int) {
        try {
            obj.call(
                Void::class,
                "requestState",
                Pair(Class.forName("android.os.IBinder").kotlin, Binder()),
                Pair(Int::class, state),
                Pair(Int::class, flags)
            )
        } catch (e: InvocationTargetException) {
            Logger.e("DeviceStateManager.requestState failed ${e.targetException}")
        } catch (e: Exception) {
            Logger.e("DeviceStateManager.requestState failed $e")
        }
    }

    fun cancelStateRequest() {
        try {
            obj.call(Void::class, "cancelStateRequest")
        } catch (e: InvocationTargetException) {
            Logger.e("DeviceStateManager.cancelStateRequest failed ${e.targetException}")
        } catch (e: Exception) {
            Logger.e("DeviceStateManager.cancelStateRequest failed $e")
        }
    }

    init {
        try {
            obj.call(
                Void::class,
                "registerCallback",
                Pair(IDeviceStateManagerCallback::class, callback)
            )
        } catch (e: Exception) {
            Logger.e("DeviceStateManager.registerCallback failed $e")
        }
    }
}
