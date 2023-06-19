package com.dogu.tcpserver

import java.io.Closeable
import java.io.IOException
import java.net.InetAddress
import java.net.ServerSocket
import java.net.Socket
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

interface TcpServerListener{
    fun onConnection(socket: Socket) : TcpClientSessionListener
    fun onClose(e: Exception?)
    fun onError(e: Exception)
}

class TcpServer(
    host: String,
    port: Int,
    reuseAddress: Boolean,
    private val listener: TcpServerListener,
) : Closeable {

    private val listenExecutor: ExecutorService = Executors.newSingleThreadExecutor()
    private val serverSocket: ServerSocket
    private var clientSocketIdSeed: Int = 1
    private val nextClientId: Int
        private get() = clientSocketIdSeed++

    private fun listen() {
        val tcpListenTask = TcpListenTask(this, listener)
        listenExecutor.execute(tcpListenTask)
    }

    private fun addClient(socket: Socket) {
        val clientId = nextClientId
        val clientSessionListener = listener.onConnection(socket)
        val socketClient = TcpClientSession(clientSessionListener, socket)
        socketClient.setKeepAlive(true)
        socketClient.setNoDelay(true)
        socketClient.setLinger(false, 0)
        socketClient.startListening()
    }

    override fun close() {
        try {
            if (!serverSocket.isClosed) {
                serverSocket.close()
                listener.onClose(null)
            }
        } catch (e: IOException) {
            listener.onClose(e)
        }
    }

    private class TcpListenTask constructor(
        private val server: TcpServer,
        private val listener: TcpServerListener
    ) : Runnable {
        override fun run() {
            val serverSocket = server.serverSocket
            try {
                while (!serverSocket.isClosed) {
                    val socket = serverSocket.accept()
                    server.addClient(socket)
                }
            } catch (e: IOException) {
                if (!serverSocket.isClosed) {
                    listener.onError(e)
                }
            }
        }
    }

    init {
        val localInetAddress = InetAddress.getByName(host)

        serverSocket = ServerSocket(port, 50, localInetAddress)
        serverSocket.reuseAddress = reuseAddress
        listen()
    }
}
