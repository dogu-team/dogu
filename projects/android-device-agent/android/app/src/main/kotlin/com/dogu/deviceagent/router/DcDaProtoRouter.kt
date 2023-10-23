package com.dogu.deviceagent

import com.dogu.deviceagent.protoapi.*
import com.dogu.protocol.generated.inner.params.DcDa
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.launch


val dcDaProtoHandlers: Map<DcDa.DcDaParam.ValueCase, IDcDaProtoAPIHandler> = mapOf(
    DcDa.DcDaParam.ValueCase.DC_DA_CONNECTION_PARAM to ConnectionAPIHandler(),
    DcDa.DcDaParam.ValueCase.DC_DA_QUERY_PROFILE_PARAM to QueryProfileAPIHandler(),
    DcDa.DcDaParam.ValueCase.DC_DA_APPLY_STREAMING_OPTION_PARAM to ApplyStreamingOptionAPIHandler(),
    DcDa.DcDaParam.ValueCase.DC_DA_CONTROL_PARAM to ControlAPIHandler(),
)

suspend fun DefaultWebSocketServerSession.routeDcDaProto(appContext: AppContext): Unit {
//    Logger.v("DefaultWebSocketServerSession.routeProto start")

    for (frame in incoming) {
        frame as? Frame.Binary ?: continue
        val bytes = frame.readBytes()

//        Logger.v("routeProto receive bytes size ${bytes.size}")

        val param = DcDa.DcDaParam.parseFrom(bytes)
        dcDaProtoHandlers[param.valueCase]?.let {

            launch {
                var ret = it.process(appContext, param)
                if (param.valueCase.number != ret.valueCase.number) {
                    throw Exception(
                        "routeProto handle proto error. implementation error req: ${param.valueCase}(${param.valueCase.number})," +
                                " ret: ${ret.valueCase}(${ret.valueCase.number})"
                    )
                }
                ret.seq = param.seq
                val sendBytes = ret.build().toByteArray()
//            Logger.v("routeProto send bytes size ${sendBytes.size}")
                send(sendBytes)
            }

        } ?: run {
            throw Exception("routeProto handle proto error. unknown param case ${param.valueCase}")
        }
    }
//    Logger.v("DefaultWebSocketServerSession.routeProto end")
}
