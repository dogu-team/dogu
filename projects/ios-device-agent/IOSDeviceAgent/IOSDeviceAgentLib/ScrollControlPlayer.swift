import Combine

actor ScrollControlPlayer: IControlPlayer {
  typealias Broker = ScrollControlBroker
  typealias Control = PatternControl

  enum Error: Swift.Error {

  }

  private var broker: Broker? = nil
  private var actionPerformer: ActionPerformer? = nil
  private let period: TimeInterval = 1.0 / 30
  private var timer: Cancellable? = nil
  private var screenSize = CGSize()
  private var lastPlayTime: UInt64 = 0  // client's event.timeStamp. unit: milliseconds

  func open(with param: ControlOpenParam, broker: Broker) throws {
    self.actionPerformer = param.actionPerformer
    self.screenSize = param.screenSize
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
            Log.shared.error("handling failed. \($0)")
          })
      }
  }

  private func play(currentTime: Date) async throws {
    guard let control = try await broker!.pop(after: lastPlayTime) else {
      return
    }
    var result = Inner_Types_CfGdcDaControlResult()
    result.error = Outer_ErrorResult()

    let vScrollSign = control.control.vScroll > 0 ? 1 : -1

    let beginPosition = try Transform.controlSpaceToScreenSpace(controlSpacePosition: control.control.position, screenSize: screenSize)
    let endPosition = CGPoint(x: beginPosition.x, y: beginPosition.y + CGFloat(vScrollSign) * screenSize.height * 0.2)
    
    let now = Date().unixTimeMilliseconds
    if control.control.timeStamp > now {
      self.notifyTimeMismatch(now:now, control: control)
      return
    }
    let latencyMs = now - control.control.timeStamp
    if 900 < latencyMs {
      self.notifyTimeMismatch(now:now, control: control)
      return
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
            "duration": 300,
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

    let deltaTime = Date().unixTimeMilliseconds - beginTime
    lastPlayTime = control.control.timeStamp + deltaTime
    control.result.set(result: result)
  }
  
  private func notifyTimeMismatch(now: UInt64, control: Control) {
    var result = Inner_Types_CfGdcDaControlResult()
    result.error = Outer_ErrorResult.with {
      $0.message = "Time mismatch. now: \(now), control: \(control.control.timeStamp)"
    }
    control.result.set(result: result)
  }
}
