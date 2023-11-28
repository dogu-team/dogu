package com.dogu.deviceagent

import com.dogu.deviceagent.reflect.AndroidContext
import com.dogu.deviceagent.reflect.ServiceManager
import com.dogu.deviceagent.screen.OPTIONS_PATH
import com.dogu.deviceagent.screen.Options
import kotlinx.coroutines.channels.Channel
import kotlinx.serialization.json.Json
import java.io.FileReader

class AppContext {
    val serviceManager = ServiceManager()
    val androidContext = AndroidContext()
    val options: Options;
    var streamChannel: Channel<ByteArray>? = null

    init {
        var tmpOption = Options()
        try {
            FileReader(OPTIONS_PATH).use {
                tmpOption = Json { ignoreUnknownKeys = true }.decodeFromString(
                    Options.serializer(),
                    it.readText()
                )
            }
        } catch (Exception: Exception) {
            Logger.e("AppContext.init read options from file failed: ${Exception.message}")
        }
        options = tmpOption
        Logger.v("AppContext.init done")
    }
}
