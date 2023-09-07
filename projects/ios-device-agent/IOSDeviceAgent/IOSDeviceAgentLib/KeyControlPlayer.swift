import Combine

actor KeyControlPlayer: IControlPlayer {
  typealias Broker = KeyControlBroker

  enum Error: Swift.Error {
    case eventRecordOpenFailed
    case eventPathOpenFailed
    case invalidControlSpaceSize(width: UInt32, height: UInt32)
  }

  private let period: TimeInterval = 1.0 / 60
  private let defaultOffset: TimeInterval = 0
  private let defaultPressure: Double = 0

  private var timer: Cancellable? = nil
  private var broker: Broker? = nil
  private var webDriverClient: WebDriverClient? = nil
  private var actionPerformer: ActionPerformer? = nil

  func open(with param: ControlOpenParam, broker: Broker) throws {
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
            Log.shared.error("handling failed. \($0)")
          })
      }
  }

  private func play(currentTime: Date) async throws {
    let play = try await broker!.pop()
    var result = Inner_Types_CfGdcDaControlResult()
    result.error = Outer_ErrorResult()

    switch play {
    case .none:
      return
    case .control(let control):
      try await playControl(keyCode: control.code)
      control.result.set(result: result)
    case .key(let keys):
      try await playKey(keys: keys.map({ $0.str }))
      keys.forEach({ $0.result.set(result: result) })
    }
  }

  private func playControl(keyCode: Inner_Types_DeviceControlKeycode) async throws {
    switch keyCode {
    case .home:
      try await webDriverClient!.homescreen()
    case .volumeUp:
      try await webDriverClient!.pressButton("volumeup")
    case .volumeDown:
      try await webDriverClient!.pressButton("volumedown")
    default:
      Log.shared.debug("unknown keycode \(keyCode)")
    }
  }

  private func playKey(keys: [String]) async throws {
    Log.shared.debug("playKey \(keys)")

    let actions = Array(
      keys.map {
        [
          [
            "type": "keyDown",
            "value": $0,
          ],
          [
            "type": "keyUp",
            "value": $0,
          ],
        ]
      }.joined())
    try await actionPerformer!.performW3CActions([
      [
        "type": "key",
        "id": "forefinger",
        "actions": actions,
      ]
    ])
  }
}
