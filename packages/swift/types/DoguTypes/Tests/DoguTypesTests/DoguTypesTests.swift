import XCTest

@testable import DoguTypes

final class DoguTypesTests: XCTestCase {
  func testOSLgger() {
    let log = Log(subsystem: "com.dogu.types", category: "testOSLgger").add(from: {
      Log.JSONMapHandler(subsystem: $0.subsystem, category: $0.category)
        .add(from: {
          Log.OSLogStringHandler(subsystem: $0.subsystem, category: $0.category)
        })
    })
    log.verbose("verbose", data: ["key": "value"])
    log.debug("debug", data: ["key": "value"])
    log.info("info", data: ["key": "value"])
    log.warning("warn", data: ["key": "value"])
    log.error("error", data: ["key": "value"])
  }

  func testPrintLogger() {
    let log = Log(subsystem: "com.dogu.types", category: "testOSLgger").add(from: {
      Log.JSONMapHandler(subsystem: $0.subsystem, category: $0.category)
        .add(handler: Log.PrintStringHandler())
    })
    log.verbose("verbose", data: ["key": "value"])
    log.debug("debug", data: ["key": "value"])
    log.info("info", data: ["key": "value"])
    log.warning("warn", data: ["key": "value"])
    log.error("error", data: ["key": "value"])
  }
}
