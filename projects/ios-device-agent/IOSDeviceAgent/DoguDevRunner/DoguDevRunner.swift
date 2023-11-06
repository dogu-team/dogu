import IOSDeviceAgentLib
import UIKit
import Vision
import XCTest

final class DoguRunner: XCTestCase {
  override func setUpWithError() throws {
    XCTestUtils.disableWaitingIdle(testcase: self)

    try IOSDeviceAgent.shared.open()
    try super.setUpWithError()
  }

  func testRunner() throws {

    let app = XCUIApplication()
    app.terminate()
    app.launch()
    self.addUIInterruptionMonitor(withDescription: "DoguAlertDetection") { (alertElement) -> Bool in
      let partialPermissionMessage = "to use your location?"

      return false
    }

    Task {
      try await RecordUtils.clickStartBroadcast(app: app, testCase: self)
    }

    IOSDeviceAgent.shared.run()
  }
}
