import Combine
import DoguTypes

actor TouchControlPlayer: IControlPlayer {
  typealias Broker = TouchControlBroker

  enum Error: Swift.Error {
    case eventRecordOpenFailed
    case eventPathOpenFailed
    case invalidControlSpaceSize(width: UInt32, height: UInt32)
  }

  private let period: TimeInterval = 1.0 / 60
  private let defaultOffset: TimeInterval = 0
  private let defaultPressure: Double = 0

  private var screenSize = CGSize()
  private var timer: Cancellable? = nil
  private var broker: Broker? = nil
  private var webDriverClient: WebDriverClient? = nil
  private var actionPerformer: ActionPerformer? = nil
  private var lastPlayTime: UInt64 = 0  // client's event.timeStamp. unit: milliseconds

  func open(with param: ControlOpenParam, broker: Broker) throws {
    self.screenSize = param.screenSize
    self.webDriverClient = param.webDriverClient
    self.actionPerformer = param.actionPerformer
    self.broker = broker
    startTimer()
  }

  func close() throws {
    timer?.cancel()
  }

  private func startTimer() {
    timer = Timer.publish(every: period, on: .main, in: .default)
      .autoconnect()
      .sink { currentTime in
        Task.catchable(
          {
            try await self.play(currentTime: currentTime)
          },
          catch: {
            Log.shared.debug("handling failed. \($0)")
          })
      }
  }

  private func play(currentTime: Date) async throws {
    guard let downUp = try await broker!.popByPattern(after: lastPlayTime) else {
      return
    }
    let down = downUp.down
    let up = downUp.up

    let beginPosition = try controlSpaceToScreenSpace(controlSpacePosition: down.control.position)
    let endPosition = try controlSpaceToScreenSpace(controlSpacePosition: up.control.position)
    var duration = up.control.timeStamp - down.control.timeStamp
    if duration < 100 {
      duration = 0
    }
    let beginTime = Date().unixTimeMilliseconds
    try await actionPerformer!.performW3CActions([
      [
        "type": "pointer",
        "id": "forefinger",
        "parameters": [
          "pointerType": "touch"
        ],
        "actions": [
          [
            "type": "pointerMove",
            "duration": 0,
            "x": beginPosition.x,
            "y": beginPosition.y,
          ],
          [
            "type": "pointerDown",
            "button": 0,
          ],
          [
            "type": "pointerMove",
            "duration": duration,
            "x": endPosition.x,
            "y": endPosition.y,
          ],
          [
            "type": "pointerUp",
            "button": 0,
          ],
        ],
      ]
    ])
    let elapsedTime = Date().unixTimeMilliseconds - beginTime
    lastPlayTime = up.control.timeStamp + elapsedTime

    var result = DoguTypes.Inner_Types_CfGdcDaControlResult()
    result.error = DoguTypes.Outer_ErrorResult()
    down.result.set(result: result)
    up.result.set(result: result)
  }

  private func controlSpaceToScreenSpace(controlSpacePosition: Inner_Types_DevicePosition) throws -> CGPoint {
    guard controlSpacePosition.screenWidth != 0, controlSpacePosition.screenHeight != 0 else {
      throw Error.invalidControlSpaceSize(width: controlSpacePosition.screenWidth, height: controlSpacePosition.screenHeight)
    }
    let controlSpaceSize = CGSize(
      width: Double(controlSpacePosition.screenWidth),
      height: Double(controlSpacePosition.screenHeight))
    let controlSpacePoint = CGPoint(
      x: Double(controlSpacePosition.x),
      y: Double(controlSpacePosition.y))

    var screenWidth = screenSize.width
    var screenHeight = screenSize.height
    if controlSpacePosition.screenHeight < controlSpacePosition.screenWidth {
      screenWidth = max(screenSize.width, screenSize.height)
      screenHeight = min(screenSize.width, screenSize.height)
    }
    if controlSpacePosition.screenWidth < controlSpacePosition.screenHeight {
      screenWidth = min(screenSize.width, screenSize.height)
      screenHeight = max(screenSize.width, screenSize.height)
    }

    return CGPoint(
      x: (controlSpacePoint.x * screenWidth) / controlSpaceSize.width,
      y: (controlSpacePoint.y * screenHeight) / controlSpaceSize.height)
  }
}
