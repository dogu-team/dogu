enum Log {
  static var shared = LogClass(subsystem: "com.dogu.iosdeviceagent", category: "common").add(from: {
    LogClass.JSONMapHandler(subsystem: $0.subsystem, category: $0.category)
      .add(from: {
        LogClass.OSLogStringHandler(subsystem: $0.subsystem, category: $0.category)
      })
      .add(handler: LogClass.PrintStringHandler())
  })
}
