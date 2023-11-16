import Combine

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
  private var inputBlocker: InputBlocker? = nil
  private var lastPlayTime: UInt64 = 0  // client's event.timeStamp. unit: milliseconds

  func open(with param: ControlOpenParam, broker: Broker) throws {
    self.screenSize = param.screenSize
    self.webDriverClient = param.webDriverClient
    self.actionPerformer = param.actionPerformer
    self.inputBlocker = param.inputBlocker
    self.broker = broker
    startTimer()
  }

  func close() throws {
    timer?.cancel()
  }

  private func startTimer() {
    let callGuard = DuplicatedCallGuarder()

    timer = Timer.publish(every: period, on: .main, in: .default)
      .autoconnect()
      .sink { currentTime in
        Task.catchable(
          {
            try await callGuard.guardCall {
              try await self.play(currentTime: currentTime)
            }
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
    if inputBlocker!.isAppBlocked {
      self.notifyBlock(downUp: downUp)
      return
    }

    let down = downUp.down
    let up = downUp.up

    let beginPosition = try Transform.controlSpaceToScreenSpace(controlSpacePosition: down.control.position, screenSize: screenSize)
    if try await inputBlocker!.blockTap(position: beginPosition) {
      self.notifyBlock(downUp: downUp)
      return
    }

    let endPosition = try Transform.controlSpaceToScreenSpace(controlSpacePosition: up.control.position, screenSize: screenSize)
    let now = Date().unixTimeMilliseconds
    if down.control.timeStamp > now {
      self.notifyTimeMismatch(downUp: downUp)
      return
    }
    let latencyMs = now - down.control.timeStamp
    if 3000 < latencyMs {
      self.notifyTimeMismatch(downUp: downUp)
      return
    }

    if down.control.timeStamp > up.control.timeStamp {
      self.notifyTimeMismatch(downUp: downUp)
      return
    }
    var duration = up.control.timeStamp - down.control.timeStamp
    if duration < 100 {
      duration = 5
    }
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
    lastPlayTime = up.control.timeStamp

    var result = Inner_Types_CfGdcDaControlResult()
    result.error = Outer_ErrorResult()
    down.result.set(result: result)
    up.result.set(result: result)
  }

  private func notifyBlock(downUp: DownUp) {
    var result = Inner_Types_CfGdcDaControlResult()
    result.error = Outer_ErrorResult.with {
      $0.message = "The input is blocked by the system."
    }
    downUp.down.result.set(result: result)
    downUp.up.result.set(result: result)
  }
  
  private func notifyTimeMismatch(downUp: DownUp) {
    var result = Inner_Types_CfGdcDaControlResult()
    result.error = Outer_ErrorResult.with {
      $0.message = "Time mismatch."
    }
    downUp.down.result.set(result: result)
    downUp.up.result.set(result: result)
  }
}
