package com.dogu.deviceagent.reflect

import android.app.Application
import android.app.Instrumentation
import android.content.Context
import android.os.Looper
import com.dogu.deviceagent.Logger

class AndroidContext {
    public val context: Context
    public val application : Application

    init {
        Looper.prepareMainLooper();

        val activityThread =
            ReflectObject("android.app.ActivityThread").createInstanceHidden()
        Logger.v( "AndroidContext.activityThread $activityThread")

        context = activityThread.call(Context::class, "getSystemContext")
        application = Instrumentation.newApplication(Application::class.java, context)
//        application = activityThread.get(Application::class, "mInitialApplication")
        Logger.v( "AndroidContext.ctx $context")
        Logger.v( "AndroidContext.ctx $application")
    }
}
