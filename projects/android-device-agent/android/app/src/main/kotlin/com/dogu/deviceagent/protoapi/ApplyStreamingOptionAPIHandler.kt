package com.dogu.deviceagent.protoapi

import com.dogu.deviceagent.AppContext
import com.dogu.deviceagent.Logger
import com.dogu.deviceagent.screen.OPTIONS_PATH
import com.dogu.deviceagent.screen.Options
import kotlinx.serialization.json.Json
import java.io.FileWriter
import com.dogu.protocol.generated.inner.params.DcDa as DcDaParams
import com.dogu.protocol.generated.inner.types.DcDa as DcDaTypes

class ApplyStreamingOptionAPIHandler : IDcDaProtoAPIHandler {
    override fun process(appContext: AppContext, param: DcDaParams.DcDaParam): DcDaParams.DcDaReturn.Builder {
        Logger.v( "ApplyStreamingOptionAPIHandler.handle")
        val option = param.dcDaApplyStreamingOptionParam.option

        val befOption = appContext.options.copy()

        appContext.options.bitRate = option.screen.bitRate.toInt()
        appContext.options.maxFps = option.screen.maxFps.toInt()
        appContext.options.frameRate = option.screen.frameRate.toInt()
        appContext.options.frameInterval = option.screen.frameInterval.toInt()
        appContext.options.repeatFrameDelay = option.screen.repeatFrameDelay.toInt()
        appContext.options.maxResolution = option.screen.maxResolution.toInt()

        FileWriter(OPTIONS_PATH).use {
            it.write(Json.encodeToString(Options.serializer(), appContext.options))
        }
        if(!befOption.equals(appContext.options)){
            appContext.streamChannel?.close(Exception("Streaming option changed"))
        }

        val applyRet = DcDaTypes.DcDaApplyStreamingOptionReturn.newBuilder().build()
        return DcDaParams.DcDaReturn.newBuilder().setDcDaApplyStreamingOptionReturn(applyRet)
    }
}
