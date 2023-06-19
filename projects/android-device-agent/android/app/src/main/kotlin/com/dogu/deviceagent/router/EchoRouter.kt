package com.dogu.deviceagent

import io.ktor.server.websocket.*
import io.ktor.websocket.*


suspend fun DefaultWebSocketServerSession.routeEcho() : Unit{
    Logger.i("DefaultWebSocketServerSession.routeEcho start")

    send("Please enter your name")
    for (frame in incoming) {
        frame as? Frame.Text ?: continue
        val receivedText = frame.readText()
        if (receivedText.equals("bye", ignoreCase = true)) {
            close(CloseReason(CloseReason.Codes.NORMAL, "Client said BYE"))
        } else {
            send(Frame.Text("Hi, $receivedText!"))
        }
    }

    Logger.i("DefaultWebSocketServerSession.routeEcho end")
}
