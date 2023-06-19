package com.dogu.tcpserver

import java.net.InetSocketAddress
import java.net.Socket

class SocketExt {
    companion object{
        fun getLocalAddress(socket: Socket): String {
            return socket.localAddress.hostAddress
        }

        fun getLocalPort(socket: Socket): Int {
            return socket.localPort
        }

        fun getRemoteAddress(socket: Socket): String {
            val remoteAddress = socket.remoteSocketAddress as? InetSocketAddress
            if(null == remoteAddress){
                return ""
            }
            return remoteAddress.address.hostAddress
        }

        fun getRemotePort(socket: Socket): Int {
            return socket.port
        }
    }
}
