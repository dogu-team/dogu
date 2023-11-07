import Combine
import WebDriverAgentLib

actor AlertDetector {
  enum Error: Swift.Error {
    case sessionNotFound
  }

  private let period: TimeInterval = 1.0
  private var timer: Cancellable? = nil
  private var webDriverClient: WebDriverClient?


  init() {
  }
  
  func open(webDriverClient: WebDriverClient) throws {
    self.webDriverClient = webDriverClient
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
              try await self.update()
            }
          },
          catch: {
            Log.shared.debug("handling failed. \($0)")
          })
      }
  }

  @MainActor
  func update() async throws -> Void {
    guard let webDriverClient = await self.webDriverClient else {
      return
    }
    
    try await webDriverClient.setSessionIfNotSet()
    guard let session = FBSession.active() else {
      throw Error.sessionNotFound
    }
    if 0 < session.activeApplication.alerts.count {
      Log.shared.info("Alert Show")
    }
  }
}
