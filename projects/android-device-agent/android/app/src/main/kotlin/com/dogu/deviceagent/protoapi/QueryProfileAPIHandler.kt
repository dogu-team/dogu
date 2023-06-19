package com.dogu.deviceagent.protoapi

import android.net.TrafficStats
import com.dogu.deviceagent.AppContext
import com.dogu.deviceagent.Logger
import com.dogu.protocol.generated.inner.params.DcDa as DcDaParams
import com.dogu.protocol.generated.inner.types.DcDa as DcDaTypes
import com.dogu.protocol.generated.outer.profile.RuntimeInfoOuterClass
import com.dogu.protocol.generated.outer.profile.ProfileMethodOuterClass
import java.io.BufferedReader
import java.io.FileInputStream
import java.io.InputStreamReader

class QueryProfileAPIHandler : IDcDaProtoAPIHandler {
    override fun process(
        appContext: AppContext,
        param: DcDaParams.DcDaParam
    ): DcDaParams.DcDaReturn.Builder {
//        Logger.v("QueryProfileAPIHandler.handle")
        val methods = param.dcDaQueryProfileParam.profileMethodsList
        val runtimeInfoBuilder = RuntimeInfoOuterClass.RuntimeInfo.newBuilder()

        for (method in methods) {
            when (method.kind) {
                ProfileMethodOuterClass.ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_CPUFREQ_CAT -> {
                    runtimeInfoBuilder.addAllCpufreqs(readCpuFreq())
                }
                ProfileMethodOuterClass.ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_MEM_ACTIVITYMANAGER -> {
                    runtimeInfoBuilder.addMems(readMem(appContext))
                }
                ProfileMethodOuterClass.ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_NET_TRAFFICSTATS -> {
                    runtimeInfoBuilder.addNets(readNet())
                }
            }
        }
        val profileRet = DcDaTypes.DcDaQueryProfileReturn.newBuilder().setInfo(runtimeInfoBuilder)
        return DcDaParams.DcDaReturn.newBuilder().setDcDaQueryProfileReturn(profileRet)
    }

    fun readCpuFreq(): List<RuntimeInfoOuterClass.RuntimeInfoCpuFreq> {
        val ret = mutableListOf<RuntimeInfoOuterClass.RuntimeInfoCpuFreq>();
        val coreCount = Runtime.getRuntime().availableProcessors()
        try {
            for (i in 0..coreCount) {
                val idxMap = mutableMapOf<String, Any>();
                val curFreq =
                    readIntegerFile("/sys/devices/system/cpu/cpu${i}/cpufreq/scaling_cur_freq")
                val minFreq =
                    readIntegerFile("/sys/devices/system/cpu/cpu${i}/cpufreq/cpuinfo_min_freq")
                val maxFreq =
                    readIntegerFile("/sys/devices/system/cpu/cpu${i}/cpufreq/cpuinfo_max_freq")
                val bulider = RuntimeInfoOuterClass.RuntimeInfoCpuFreq.newBuilder()
                bulider.idx = i
                bulider.cur = curFreq.toLong()
                bulider.min = minFreq.toLong()
                bulider.max = maxFreq.toLong()
                ret.add(bulider.build())
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return ret;
    }

    fun readMem(appContext: AppContext): RuntimeInfoOuterClass.RuntimeInfoMem {
        val bulider = RuntimeInfoOuterClass.RuntimeInfoMem.newBuilder()

        try {
            val mi = appContext.serviceManager.activityManager.getMemoryInfo()
            bulider.name = "activityManager"
            bulider.total = mi.getTotalMem()
            bulider.free = mi.getAvailMem()
            bulider.isLow = mi.isLowMemory()
        } catch (e: Exception) {
            Logger.w("readMem failed ${e}")

            bulider.name = "activityManager"
            bulider.total = 0
            bulider.free = 0
            bulider.isLow = false
        }
        return bulider.build()
    }

    fun readNet(): RuntimeInfoOuterClass.RuntimeInfoNet {
        val bulider = RuntimeInfoOuterClass.RuntimeInfoNet.newBuilder()

        try {
            bulider.name = "trafficStats"
            bulider.mobileRxbytes = TrafficStats.getMobileRxBytes()
            bulider.mobileTxbytes = TrafficStats.getMobileTxBytes()
            bulider.wifiRxbytes =
                TrafficStats.getTotalRxBytes() - TrafficStats.getMobileRxBytes()
            bulider.wifiTxbytes =
                TrafficStats.getTotalTxBytes() - TrafficStats.getMobileTxBytes()
            bulider.totalRxbytes = TrafficStats.getTotalRxBytes()
            bulider.totalTxbytes = TrafficStats.getTotalTxBytes()
        } catch (e: Exception) {
            Logger.w("readNet failed ${e}")
            bulider.name = "trafficStats"
            bulider.mobileRxbytes = 0
            bulider.mobileTxbytes = 0
            bulider.wifiRxbytes = 0
            bulider.wifiTxbytes = 0
            bulider.totalRxbytes = 0
            bulider.totalTxbytes = 0
        }
        return bulider.build()
    }

    private fun readIntegerFile(filePath: String): Int {
        try {
            BufferedReader(
                InputStreamReader(FileInputStream(filePath)), 1000
            ).use { reader ->
                val line = reader.readLine()
                return Integer.parseInt(line)
            }

        } catch (e: Exception) {
            return 0
        }
    }
}
