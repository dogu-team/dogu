//package com.dogu.deviceagent
// https://logback.qos.ch/manual/configuration.html#auto_configuration
//
//import ch.qos.logback.classic.Logger
//import ch.qos.logback.classic.LoggerContext
//import ch.qos.logback.classic.layout.TTLLLayout
//import ch.qos.logback.classic.spi.Configurator
//import ch.qos.logback.classic.spi.ILoggingEvent
//import ch.qos.logback.core.ConsoleAppender
//import ch.qos.logback.core.encoder.LayoutWrappingEncoder
//import ch.qos.logback.core.spi.ContextAwareBase
//
//
//class LogbackConfiturator() : ContextAwareBase(), Configurator {
//    override fun configure(lc: LoggerContext?) {
//        addInfo("Setting up default configuration.")
//        if(lc == null) {
//            addError("LoggerContext is null")
//            return
//        }
//
//        val ca = ConsoleAppender<ILoggingEvent>()
//        ca.context = lc
//        ca.name = "console"
//        val encoder = LayoutWrappingEncoder<ILoggingEvent>()
//        encoder.context = lc
//
//        val layout = TTLLLayout()
//
//        layout.context = lc
//        layout.start()
//        encoder.setLayout(layout)
//
//        ca.setEncoder(encoder)
//        ca.start()
//
//        val rootLogger: Logger = lc.getLogger(Logger.ROOT_LOGGER_NAME)
//        rootLogger.addAppender(ca)
//
//        return ExecutionStatus.NEUTRAL
//    }
//}
