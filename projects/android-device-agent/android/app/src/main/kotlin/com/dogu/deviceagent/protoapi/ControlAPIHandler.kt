package com.dogu.deviceagent.protoapi

import com.dogu.deviceagent.AppContext
import com.dogu.deviceagent.Device
import com.dogu.deviceagent.Logger
import com.dogu.deviceagent.control.Controller
import com.dogu.protocol.generated.inner.params.DcDa
import com.dogu.protocol.generated.inner.types.DeviceControlOuterClass
import com.dogu.protocol.generated.inner.params.CfGdcDa as CfGdcDaParams


class ControlAPIHandler() : ICfGdcDaProtoAPIHandler, IDcDaProtoAPIHandler {
    var device: Device? = null
    var controller : Controller? = null
    override fun process(
        appContext: AppContext,
        param: CfGdcDaParams.CfGdcDaParam
    ): CfGdcDaParams.CfGdcDaResult.Builder {
        val controlMessage = param.cfGdcDaControlParam.control

//        Logger.v("ControlAPIHandler.process seq:" + param.seq +  ", msg:"  + controlMessage.toString())

        var errorResult = this.processInternal(appContext, controlMessage)
        val controlRet =
            com.dogu.protocol.generated.inner.types.CfGdcDa.CfGdcDaControlResult.newBuilder()
                .setError(errorResult)
        val ret = CfGdcDaParams.CfGdcDaResult.newBuilder().setCfGdcDaControlResult(controlRet)
        return ret
    }

    override fun process(appContext: AppContext, param: DcDa.DcDaParam): DcDa.DcDaReturn.Builder {
        val controlMessage = param.dcDaControlParam.control

        var errorResult = this.processInternal(appContext, controlMessage)
        val controlRet = com.dogu.protocol.generated.inner.types.DcDa.DcDaControlReturn.newBuilder().build()
        return DcDa.DcDaReturn.newBuilder().setDcDaControlReturn(controlRet)
    }

    fun processInternal(appContext: AppContext, controlMessage: DeviceControlOuterClass.DeviceControl): com.dogu.protocol.generated.outer.Errors.ErrorResult {
        var errorResult = com.dogu.protocol.generated.outer.Errors.ErrorResult.newBuilder()
            .setCode(com.dogu.protocol.generated.outer.Errors.Code.CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED).setMessage("").build()
        try {
            if(device == null){
                device = Device(appContext.options);
            }
            if(controller == null){
                controller = Controller(device!!, false, true)
            }
            errorResult = controller!!.handleEvent(controlMessage)
        } catch (e: Exception) {
            Logger.e("ControlAPIHandler.process error: " +
                    "type: ${controlMessage.type}, " +
                    "text: ${controlMessage.text}, " +
                    "action: ${controlMessage.action},  " +
                    "key: ${controlMessage.key}, " +
                    "keycode: ${controlMessage.keycode}, " +
                    "meta: ${controlMessage.metaState}, " +
                    "error: $e, " +
                    "stack: ${e.stackTraceToString()}")
            errorResult = com.dogu.protocol.generated.outer.Errors.ErrorResult.newBuilder()
                .setCode(com.dogu.protocol.generated.outer.Errors.Code.CODE_ANDROID_DEVICE_AGENT_INPUT_UNKNOWN).setMessage("msg: "+ e.message + ", stack: " + e.stackTraceToString()).build()
        }
        return errorResult
    }
}
