package com.dogu.deviceagent

import com.dogu.deviceagent.screen.ScreenEncoder
import com.dogu.deviceagent.util.Strings
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.launch
import java.util.*

suspend fun DefaultWebSocketServerSession.routeStream(appContext: AppContext): Unit {
    val randomId = UUID.randomUUID().toString()
    Logger.i("DefaultWebSocketServerSession.routeStream $randomId start")

    val streamChannel = Channel<ByteArray>()
    appContext.streamChannel = streamChannel
    GlobalScope.launch {
        try {
            val device = Device(appContext.options);
            val size = device.getDeviceSize()
            var newOptions = appContext.options.copy()
            var resolutionRatio =  size.height.toFloat() / (size.width.toFloat() + 1.0f)
            if(resolutionRatio < 1.5f){
                newOptions.maxResolution = (newOptions.maxResolution * 1.5f).toInt()
            }

            Logger.v("DefaultWebSocketServerSession.routeStream $randomId create screenEncoder")
            val encoder = ScreenEncoder(
                newOptions,
                emptyList(),
                newOptions.encoderName ?: "",
                newOptions.downsizeOnError
            )

            Logger.v("DefaultWebSocketServerSession.routeStream $randomId start stream")
            encoder.streamScreen(device, streamChannel)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    var diff = StreamMonitor()
    for (array in streamChannel) {
        try {
            diff.update(array.size)
            send(array)

        } catch (e: java.util.concurrent.CancellationException) {
            Logger.e(
                "DefaultWebSocketServerSession.routeStream $randomId error ${e.javaClass}, ${e.message}, ${
                    Strings.stringify(
                        e.stackTrace
                    )
                }"
            )
            break
        } catch (e: Exception) {
            Logger.e(
                "DefaultWebSocketServerSession.routeStream $randomId error ${e.javaClass}, ${e.message}, ${
                    Strings.stringify(
                        e.stackTrace
                    )
                }"
            )
        }
    }
    Logger.i("DefaultWebSocketServerSession.routeStream $randomId close call")
    streamChannel.close()

    Logger.i("DefaultWebSocketServerSession.routeStream $randomId end")
}

class StreamMonitor {
    var count = 0
    var sent = 0
    var befTime = Date()

    fun update(sentSize: Int) {
        count += 1
        sent += sentSize
        if (300 < count) {
            val now = Date()
            var mbPerSec = 0.0
            var countPerSec = 0.0
            val diffTime = (now.time - befTime.time).toFloat() / 1000.0
            if( diffTime <0 ) return
            mbPerSec = sent.toFloat() / 1024.0 / 1024.0 / diffTime
            countPerSec = count.toFloat() / diffTime
            Logger.i("DefaultWebSocketServerSession.routeStream sent: ${"%.2f".format(mbPerSec)} mb/s, count: ${"%.2f".format(countPerSec)} n/s")

            count = 0
            sent = 0
            befTime = now
        }
    }
}

