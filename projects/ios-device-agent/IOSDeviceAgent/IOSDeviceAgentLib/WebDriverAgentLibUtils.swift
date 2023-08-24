import ExceptionCatcher
import Foundation
import WebDriverAgentLib
import XCTest

final class WebDriverAgentLibUtils {
  enum Error: Swift.Error {
    case invalidAppPathAndBundleID(appPath: String, bundleId: String)
  }

  static func app() -> XCUIApplication {
    return FBApplication.fb_active()
  }

  static func orientation() -> UIInterfaceOrientation {
    return app().interfaceOrientation
  }

  static func screenSize() -> CGSize {
    let app = app()
    var size = app.wdFrame.size
    return FBAdjustDimensionsForApplication(size, app.interfaceOrientation)
  }

  static func execute(event: XCSynthesizedEventRecord) throws {
    try FBXCTestDaemonsProxy.synthesizeEvent(with: event)
  }

  static func ipv4() -> String {
    return XCUIDevice.shared.fb_wifiIPAddress() ?? ""
  }

  @MainActor
  static func runApp(appPath: String, bundleId: String) throws {
    try ExceptionCatcher.catch {
      guard let app = FBApplication(privateWithPath: appPath, bundleID: bundleId) else {
        throw Error.invalidAppPathAndBundleID(appPath: appPath, bundleId: bundleId)
      }
      app.launch()
    }
  }

  static func open() {
    FBDebugLogDelegateDecorator.decorateXCTestLogger()
    FBConfiguration.disableRemoteQueryEvaluation()
    FBConfiguration.configureDefaultKeyboardPreferences()
    FBConfiguration.disableApplicationUIInterruptionsHandling()
    if ProcessInfo.processInfo.environment["ENABLE_AUTOMATIC_SCREENSHOTS"] != nil {
      FBConfiguration.enableScreenshots()
    } else {
      FBConfiguration.disableScreenshots()
    }
  }

  static func run() {
    let webServer = FBWebServer()
    webServer.startServing()
  }
}
