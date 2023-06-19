package com.dogu.tcpserver


import android.util.Log
import com.dogu.deviceagent.Logger
import com.dogu.deviceagent.util.Constants
import java.net.Socket


class aTcpEventListener() {
    fun onConnection(serverId: Int, clientId: Int, socket: Socket) {
        Logger.i(

            "TcpEventListener.onSocketConnection on socket " +
                    "serverId:$serverId, clientId:$clientId," +
                    "local:${SocketExt.getLocalAddress(socket)}:${SocketExt.getLocalPort(socket)}," +
                    "remote:${SocketExt.getRemoteAddress(socket)}:${SocketExt.getRemotePort(socket)}",
        )
    }

    fun onData(id: Int, data: ByteArray) {
        Logger.i(

            "TcpEventListener.onData ${data.size}",
        )
    }

    fun onWritten(id: Int, msgId: Int, e: Exception?) {
        Logger.i(

            "TcpEventListener.onWritten",
        )
        if (e != null) {
            Logger.e( "TcpEventListener.onWritten Exception on socket $id $e")
        }
    }

    fun onClose(id: Int, e: Exception?) {
        Logger.i(

            "TcpEventListener.onClose $id",
        )
        e?.let { onError(id, it) }
    }

    fun onError(id: Int, e: Exception) {
        Logger.e( "Exception on socket $id $e")
    }
}
