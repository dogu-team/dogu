import Foundation
import Network

//import UIKit

public final class IOSDeviceAgent {
  private var config = Config()
  private let controlProcessor = MainControlProcessor()
  var preventGabage: ControlSession?
  var listener: NWListener?
  var sessionIdSeed: UInt32 = 0
  private var sessions: [UInt32: ControlSession] = [:]

  public static let shared: IOSDeviceAgent = IOSDeviceAgent()

  init() {
  }

  public func open() throws {
    try openInternal()
    WebDriverAgentLibUtils.open()
  }

  public func run() {
    runInternal()
    WebDriverAgentLibUtils.run()
  }

  @MainActor
  public func addSession(session: ControlSession) {
    self.sessions[session.sessionId] = session
  }

  @MainActor
  public func removeSession(session: ControlSession) {
    self.sessions.removeValue(forKey: session.sessionId)
  }

  private func openInternal() throws {
    config = try EnvironmentParser().parse()
    let screenSize = WebDriverAgentLibUtils.screenSize()
    Task.catchable(
      {
        let webDriverClient = try WebDriverClient(url: "http://127.0.0.1:\(self.config.webDriverPort)")
        let param = ControlOpenParam(screenSize: screenSize, webDriverClient: webDriverClient, actionPerformer: ActionPerformer(webDriverClient: webDriverClient))
        try await self.controlProcessor.open(param: param)
      },
      catch: {
        Log.shared.debug("DeviceControlProcessor open failed. \($0)")
      })
  }

  private func runInternal() {
    let port = self.config.grpcPort
    let nwport: NWEndpoint.Port = NWEndpoint.Port(rawValue: UInt16(self.config.grpcPort)) ?? 50002
    do {
      listener = try NWListener(using: .tcp, on: nwport)
      listener?.stateUpdateHandler = { [weak self] state in
        switch state {
        case .ready:
          Log.shared.info("ScreenServer started on port \(port)")
        case .failed(let error):
          Log.shared.error("ScreenServer failure, error: \(error.localizedDescription)")
        default:
          break
        }
      }

      listener?.newConnectionHandler = { [weak self] connection in
        Log.shared.info("ScreenServer newConnectionHandler")
        guard let self = self else {
          Log.shared.error("ScreenServer is not initialized")
          return
        }
        self.sessionIdSeed += 1
        self.preventGabage = ControlSession(
          sessionId: self.sessionIdSeed, connection: connection, listener: ControlSessionListener(controlProcessor: self.controlProcessor, iosdeviceagent: self))
      }

      listener?.start(queue: .main)
    } catch {
      Log.shared.error("ScreenServer Failed to start server, error: \(error.localizedDescription)")
    }
  }
}
