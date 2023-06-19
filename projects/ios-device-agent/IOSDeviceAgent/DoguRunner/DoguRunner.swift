import IOSDeviceAgentLib
import UIKit
import XCTest

final class DoguRunner: XCTestCase {
  override func setUpWithError() throws {

    XCTestUtils.disableWaitingIdle(testcase: self)
    try IOSDeviceAgent.shared.open()
    try super.setUpWithError()
  }

  func testRunner() throws {
    let app = XCUIApplication()
    app.launch()

    Task {
      try await RecordUtils.clickStartBroadcast(app: app, testCase: self)
    }

    IOSDeviceAgent.shared.run()
  }
}
