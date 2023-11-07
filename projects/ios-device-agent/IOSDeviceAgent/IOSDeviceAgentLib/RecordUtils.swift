import UIKit
import Vision
import XCTest

public final class RecordUtils {
  private static let AppName = "DoguScreen"

  @MainActor
  public static func clickStartBroadcast(app: XCUIApplication, testCase: XCTestCase) async throws {

    let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
    try await waitButton(app: springboard)
    try await clickStartButton(app: springboard)
    try await goToHome()
  }

  @MainActor
  static func onDetectDone(request: VNRequest, error: Error?, app: XCUIApplication) {
    guard let observations = request.results as? [VNRectangleObservation] else {
      NSLog("RecordUtils.onDetectDone Failed to find rectangles")
      return
    }
    NSLog("RecordUtils.onDetectDone observations count: \(observations.count)")

    for observation in observations {
      let centerRect = observation.boundingBox
      let x = centerRect.origin.x + centerRect.size.width / 2
      let y = centerRect.origin.y + centerRect.size.height * 0.95

      let center3 = app.coordinate(withNormalizedOffset: CGVector(dx: x, dy: y))
      center3.tap()
    }

    Task {
      try await self.goToHome()
    }
  }

  @MainActor
  public static func clickAlert(app: XCUIApplication) async throws {

    if app.alerts.count == 0 {
      NSLog("RecordUtils.clickAlert no alert found")
      return
    }
    app.alerts.firstMatch.buttons.firstMatch.tap()
    try await Task.sleep(nanoseconds: 1_000_000_000)
  }

  @MainActor
  public static func waitButton(app: XCUIApplication) async throws {
    NSLog("RecordUtils.waitButton")

    for _ in 0..<10 {
      let doguScreenButton: XCUIElement = app.buttons[RecordUtils.AppName]
      if doguScreenButton.exists {
        NSLog("RecordUtils.clickAlert doguScreenButton found")
        return
      }
      try await Task.sleep(nanoseconds: 1_000_000_000)
    }
  }

  @MainActor
  public static func clickStartButton(app: XCUIApplication) async throws {
    NSLog("RecordUtils.clickStartButton")

    if app.buttons.count == 0 {
      NSLog("RecordUtils.clickAlert no button found")
      return
    }

    try await clickAlert(app: app)

    let doguScreenButton: XCUIElement = app.buttons[RecordUtils.AppName]
    if !doguScreenButton.exists {
      NSLog("RecordUtils.clickAlert no doguScreenButton found")
      return
    }
    doguScreenButton.tap()
    try await Task.sleep(nanoseconds: 1_000_000_000)

    try await clickAlert(app: app)

    var maxYElement: XCUIElement = doguScreenButton
    for button in app.buttons.allElementsBoundByIndex {
      if button.label == RecordUtils.AppName {
        continue
      }
      if maxYElement.frame.maxY < button.frame.maxY {
        maxYElement = button
      }
    }
    maxYElement.tap()
  }

  @MainActor
  static func goToHome() async throws {
    try await Task.sleep(nanoseconds: 4_000_000_000)
    XCUIDevice.shared.press(XCUIDevice.Button.home)
    try await Task.sleep(nanoseconds: 300_000_000)
    XCUIDevice.shared.press(XCUIDevice.Button.home)
  }

}

func toCGImagePropertyOrientation(_ orientation: UIImage.Orientation) -> CGImagePropertyOrientation {
  switch orientation {
  case .up:
    return .up
  case .upMirrored:
    return .upMirrored
  case .down:
    return .down
  case .downMirrored:
    return .downMirrored
  case .left:
    return .left
  case .leftMirrored:
    return .leftMirrored
  case .right:
    return .right
  case .rightMirrored:
    return .rightMirrored
  @unknown default:
    return .up
  }
}
