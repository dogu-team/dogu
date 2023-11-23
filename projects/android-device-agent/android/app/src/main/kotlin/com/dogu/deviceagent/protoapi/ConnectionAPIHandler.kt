package com.dogu.deviceagent.protoapi

import com.dogu.deviceagent.AppContext
import com.dogu.deviceagent.Logger
import com.dogu.protocol.generated.inner.params.DcDa as DcDaParams
import com.dogu.protocol.generated.inner.types.DcDa as DcDaTypes

class ConnectionAPIHandler : IDcDaProtoAPIHandler {
    override fun process(appContext: AppContext, param: DcDaParams.DcDaParam): DcDaParams.DcDaReturn.Builder {
        Logger.v( "ConnectionAPIHandler.process. ${param.dcDaConnectionParam.version}")
        Logger.setDeviceNickName(param.dcDaConnectionParam.nickname)
        val connectionRet = DcDaTypes.DcDaConnectionReturn.newBuilder().build()
        return DcDaParams.DcDaReturn.newBuilder().setDcDaConnectionReturn(connectionRet)
    }
}
