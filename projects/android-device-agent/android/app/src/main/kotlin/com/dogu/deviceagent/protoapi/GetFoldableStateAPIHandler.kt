package com.dogu.deviceagent.protoapi

import com.dogu.deviceagent.AppContext
import com.dogu.deviceagent.Logger
import com.dogu.protocol.generated.inner.params.DcDa as DcDaParams
import com.dogu.protocol.generated.inner.types.DcDa as DcDaTypes

class GetFoldableStateAPIHandler : IDcDaProtoAPIHandler {

    val emptyState :DcDaParams.DcDaReturn.Builder = DcDaParams.DcDaReturn.newBuilder()
        .setDcDaGetFoldableStateReturn(DcDaTypes.DcDaGetFoldableStateReturn.newBuilder().setIsFoldable(false).setCurrentState(0).build())
    override fun process(
        appContext: AppContext,
        param: DcDaParams.DcDaParam
    ): DcDaParams.DcDaReturn.Builder {
        Logger.v("GetFoldableStateAPIHandler.process.")
        val deviceStateManager = appContext.serviceManager.deviceStateManager
        if (null == deviceStateManager) {
            Logger.e("GetFoldableStateAPIHandler.process. deviceStateManager is null.")
            return emptyState
        }

        val state = deviceStateManager.getDeviceStateInfo()
        if (null == state) {
            Logger.e("GetFoldableStateAPIHandler.process. state is null.")
            return emptyState
        }

        val ret = DcDaTypes.DcDaGetFoldableStateReturn.newBuilder()
            .setIsFoldable(state.supportedStates.size > 1)
            .setCurrentState(state.currentState)
            .addAllSupportedStates(state.supportedStates.toList()).build()
        return DcDaParams.DcDaReturn.newBuilder().setDcDaGetFoldableStateReturn(ret)
    }
}
