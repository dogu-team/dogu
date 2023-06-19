package com.dogu.deviceagent.protoapi

import com.dogu.deviceagent.AppContext
import com.dogu.protocol.generated.inner.params.DcDa as DcDaParams

interface IDcDaProtoAPIHandler {
    fun process(appContext: AppContext, param: DcDaParams.DcDaParam): DcDaParams.DcDaReturn.Builder
}
