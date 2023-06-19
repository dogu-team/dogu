package com.dogu.deviceagent.screen

import android.system.ErrnoException
import android.system.Os
import android.system.OsConstants
import com.dogu.deviceagent.BuildConfig
import io.ktor.util.*
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.channels.SendChannel
import kotlinx.coroutines.channels.sendBlocking
import kotlinx.coroutines.channels.trySendBlocking
import kotlinx.coroutines.launch
import java.io.FileDescriptor
import java.io.IOException
import java.nio.ByteBuffer


object IO {
    fun writeFully(channel : SendChannel<ByteArray>, from: ByteBuffer) {
        val arr = from.moveToByteArray()
        channel.trySendBlocking(arr)
    }

        @Throws(IOException::class)
    fun writeFully(fd: FileDescriptor?, from: ByteBuffer) {
        // ByteBuffer position is not updated as expected by Os.write() on old Android versions, so
        // count the remaining bytes manually.
        // See <https://github.com/Genymobile/scrcpy/issues/291>.
        var remaining = from.remaining()
        while (remaining > 0) {
            try {
                val w = Os.write(fd, from)
                if (BuildConfig.DEBUG && w < 0) {
                    // w should not be negative, since an exception is thrown on error
                    throw AssertionError("Os.write() returned a negative value ($w)")
                }
                remaining -= w
            } catch (e: ErrnoException) {
                if (e.errno != OsConstants.EINTR) {
                    throw IOException(e)
                }
            }
        }
    }

    @Throws(IOException::class)
    fun writeFully(fd: FileDescriptor?, buffer: ByteArray?, offset: Int, len: Int) {
        writeFully(fd, ByteBuffer.wrap(buffer, offset, len))
    }
}
