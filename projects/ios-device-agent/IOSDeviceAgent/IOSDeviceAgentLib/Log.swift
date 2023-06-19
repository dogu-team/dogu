import DoguTypes

enum Log {
  static var shared = DoguTypes.Log(subsystem: "com.dogu.iosdeviceagent", category: "common").add(from: {
    DoguTypes.Log.JSONMapHandler(subsystem: $0.subsystem, category: $0.category)
      .add(from: {
        DoguTypes.Log.OSLogStringHandler(subsystem: $0.subsystem, category: $0.category)
      })
      .add(handler: DoguTypes.Log.PrintStringHandler())
  })
}
