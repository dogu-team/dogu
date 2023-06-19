package com.dogu.deviceagent

import android.util.Log
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

class KotlinEntry {
    companion object {
        val appContext = AppContext()

        fun main(args: Array<String>) {
            Log.v("deviceagent", "Entry.main")
            try {
                runBlocking {
                    val job = GlobalScope.launch {
                        Log.v("deviceagent", "start stream next")
                        val server = WebsocketServer(appContext, 50001)
                        server.start()
                    }
                    job.join()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
