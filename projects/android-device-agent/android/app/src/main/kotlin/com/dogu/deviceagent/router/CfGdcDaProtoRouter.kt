package com.dogu.deviceagent

import com.dogu.deviceagent.protoapi.*
import com.dogu.protocol.generated.inner.params.CfGdcDa
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.launch


val cfGdcDaProtoHandlers: Map<CfGdcDa.CfGdcDaParam.ValueCase, ICfGdcDaProtoAPIHandler> = mapOf(
    CfGdcDa.CfGdcDaParam.ValueCase.CF_GDC_DA_CONTROL_PARAM to ControlAPIHandler(),
)

suspend fun DefaultWebSocketServerSession.routeCfGdcDaProto(appContext: AppContext): Unit {

    for (frame in incoming) {
        frame as? Frame.Binary ?: continue
        val bytes = frame.readBytes()

//        Logger.v("routeCfGdcDaProto receive bytes size ${bytes.size}")
        val param = CfGdcDa.CfGdcDaParam.parseFrom(bytes)
        var result = CfGdcDa.CfGdcDaResult.newBuilder()
//            if (paramList.paramsCount > 0) {
//                val paramSeqs =
//                    paramList.paramsList.map { it.seq.toString() }.reduce { a, b -> "$a, $b" }
//                Logger.i("routeCfGdcDaProto receive seqs: $paramSeqs")
//            }

        cfGdcDaProtoHandlers[param.valueCase]?.let {
            var ret = it.process(appContext, param)
            if (param.valueCase.number != ret.valueCase.number) {
                val message =
                    "routeProto handle proto error. implementation error req: ${param.valueCase}(${param.valueCase.number})," +
                            " ret: ${ret.valueCase}(${ret.valueCase.number})"
                Logger.e(message)
                throw Exception(message)
            }
            ret.seq = param.seq
            result = ret

        } ?: run {
            val message =
                "routeCfGdcDaProto handle proto error. unknown param case ${param.valueCase}"
            Logger.e(message)
            throw Exception(message)
        }
//          Logger.v("routeCfGdcDaProto send bytes size ${sendBytes.size}")
        val sendBytes = result.build().toByteArray()
        send(sendBytes)
    }
}
