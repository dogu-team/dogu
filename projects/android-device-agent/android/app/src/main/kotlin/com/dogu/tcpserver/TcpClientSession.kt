package com.dogu.tcpserver


import java.io.BufferedInputStream
import java.io.IOException
import java.net.Socket
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

interface TcpClientSessionListener {
    fun onData(client: TcpClientSession, data: ByteArray)
    fun onClose(e: Exception?)
    fun onError(e: Exception)
}

class TcpClientSession(
    private val listener: TcpClientSessionListener,
    private val socket: Socket
) {
    private val listenExecutor: ExecutorService = Executors.newSingleThreadExecutor()
    private val writeExecutor: ExecutorService = Executors.newSingleThreadExecutor()
    private var receiverTask: TcpReceiverTask? = null
    private var closed = true


    suspend fun write(data: ByteArray?) {
        writeExecutor.execute {
            try {
                socket.getOutputStream().write(data)
            } catch (e: IOException) {
                listener.onError(e)
            }
        }
    }

    fun destroy() {
        try {
            if (!socket.isClosed) {
                closed = true
                socket.close()
                listener.onClose(null)
            }
        } catch (e: IOException) {
            listener.onClose(e)
        }
    }

    internal fun startListening() {
        receiverTask = TcpReceiverTask(this, listener)
        listenExecutor.execute(receiverTask)
    }


    internal fun setNoDelay(noDelay: Boolean) {
        socket.tcpNoDelay = noDelay
    }

    internal fun setLinger(onoff: Boolean, linger: Int) {
        socket.setSoLinger(onoff, linger)
    }

    internal fun setKeepAlive(enable: Boolean) {
        socket.keepAlive = enable
    }

    private class TcpReceiverTask(
        private val clientSession: TcpClientSession,
        private val listener: TcpClientSessionListener
    ) : Runnable {

        override fun run() {
            val socket = clientSession.socket
            val buffer = ByteArray(16384)
            try {
                val inputStream = BufferedInputStream(socket.getInputStream())
                while (!socket.isClosed) {
                    val bufferCount = inputStream.read(buffer)
                    if (bufferCount > 0) {
                        listener.onData(
                            clientSession,
                            buffer.copyOfRange(0, bufferCount)
                        )
                    } else if (bufferCount == -1) {
                        clientSession.destroy()
                    }
                }
            } catch (ioe: IOException) {
                if (!socket.isClosed && !clientSession.closed) {
                    listener.onError(ioe)
                }
            } catch (ioe: InterruptedException) {
                if (!socket.isClosed && !clientSession.closed) {
                    listener.onError(ioe)
                }
            }
        }
    }

}
