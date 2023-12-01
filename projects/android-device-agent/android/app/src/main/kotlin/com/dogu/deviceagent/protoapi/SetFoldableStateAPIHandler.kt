package com.dogu.deviceagent.protoapi

import com.dogu.deviceagent.AppContext
import com.dogu.deviceagent.Logger
import com.dogu.protocol.generated.outer.Errors.ErrorResult
import com.dogu.protocol.generated.inner.params.DcDa as DcDaParams
import com.dogu.protocol.generated.inner.types.DcDa as DcDaTypes
import com.dogu.protocol.generated.outer.Errors.Code as ErrorCode

class SetFoldableStateAPIHandler : IDcDaProtoAPIHandler {
    override fun process(
        appContext: AppContext,
        param: DcDaParams.DcDaParam
    ): DcDaParams.DcDaReturn.Builder {
        Logger.v("SetFoldableStateAPIHandler.process. ${param.dcDaSetFoldableStateParam.state}")
        val deviceStateManager = appContext.serviceManager.deviceStateManager
        if (null == deviceStateManager) {
            return errorState("SetFoldableStateAPIHandler.process. deviceStateManager is null.")
        }

        deviceStateManager.cancelStateRequest()
        deviceStateManager.requestState(param.dcDaSetFoldableStateParam.state, 0)

        return success()
    }

    private fun errorState(message: String): DcDaParams.DcDaReturn.Builder {
        Logger.e(message)
        val error =
            ErrorResult.newBuilder().setCode(ErrorCode.CODE_UNEXPECTED_ERROR).setMessage(message)
                .build()
        val ret = DcDaTypes.DcDaSetFoldableStateReturn.newBuilder().setError(error).build()
        return DcDaParams.DcDaReturn.newBuilder().setDcDaSetFoldableStateReturn(ret)
    }

    private fun success(): DcDaParams.DcDaReturn.Builder {
        val error =
            ErrorResult.newBuilder().setCode(ErrorCode.CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED)
                .build()
        val ret = DcDaTypes.DcDaSetFoldableStateReturn.newBuilder().setError(error).build()
        return DcDaParams.DcDaReturn.newBuilder().setDcDaSetFoldableStateReturn(ret)
    }
}
