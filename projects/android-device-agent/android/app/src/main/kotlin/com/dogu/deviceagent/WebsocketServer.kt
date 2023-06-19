package com.dogu.deviceagent

import com.dogu.deviceagent.runtimetest.ReflectionTest
import io.ktor.server.application.*
import io.ktor.server.cio.*
import io.ktor.server.engine.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*


class WebsocketServer(
    private val appContext: AppContext,
    private val port: Int
) {

    fun start() {
        Logger.i("Server.start")
        ReflectionTest.test()

        embeddedServer(CIO, port = 50001) {
            Logger.i("Server.embeddedServer in")

            install(WebSockets) {
//                pingPeriod = Duration.ofSeconds(15)
//                timeout = Duration.ofSeconds(15)
                maxFrameSize = Long.MAX_VALUE
                masking = false
            }
            routing {
                webSocket("/echo") {
                    routeEcho()
                }
                webSocket("/proto") {
                    routeDcDaProto(appContext)
                }
                webSocket("/cf_gdc_da_proto") {
                    routeCfGdcDaProto(appContext)
                }
                webSocket("/stream") {
                    routeStream(appContext)
                }
            }
            Logger.i("Server.embeddedServer in2")
        }.start(wait = true)
    }
}


