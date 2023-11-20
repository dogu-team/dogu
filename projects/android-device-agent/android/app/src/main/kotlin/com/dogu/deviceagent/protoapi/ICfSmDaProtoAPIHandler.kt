package com.dogu.deviceagent.protoapi

import com.dogu.deviceagent.AppContext
import com.dogu.protocol.generated.inner.params.CfGdcDa as CfGdcDaParams

interface ICfGdcDaProtoAPIHandler {
    fun onOpen(appContext: AppContext)
    fun process(appContext: AppContext, param: CfGdcDaParams.CfGdcDaParam): CfGdcDaParams.CfGdcDaResult.Builder
}
