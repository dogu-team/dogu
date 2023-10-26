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
    let nwport: NWEndpoint.Port = NWEndpoint.Port(rawValue: UInt16(self.config.grpcPort)) ?? 35002
    yellAlivePeriodically()
    do {
      let options = NWProtocolTCP.Options()
      options.persistTimeout = 0 // this one reduces waiting time significantly when there is no open connections
      options.enableKeepalive = true // this one reduces the number of open connections by reusing existing ones
      options.connectionDropTime = 5
      options.connectionTimeout = 5
      options.noDelay = true
      let params = NWParameters(tls:nil, tcp: options)
      params.allowLocalEndpointReuse = true
      listener = try NWListener(using: params, on: nwport)
      listener?.stateUpdateHandler = { [weak self] state in
        switch state {
        case .ready:
          Log.shared.info("IOSDeviceAgent started on port \(port)")
        case .failed(let error):
          Log.shared.error("IOSDeviceAgent failure, error: \(error.localizedDescription)")
        default:
          break
        }
      }

      listener?.newConnectionHandler = { [weak self] connection in
        Log.shared.info("IOSDeviceAgent newConnectionHandler")
        guard let self = self else {
          Log.shared.error("IOSDeviceAgent is not initialized")
          return
        }
        self.sessionIdSeed += 1
        self.preventGabage = ControlSession(
          sessionId: self.sessionIdSeed, connection: connection, listener: ControlSessionListener(controlProcessor: self.controlProcessor, iosdeviceagent: self))
      }

      listener?.start(queue: .main)
    } catch {
      Log.shared.error("IOSDeviceAgent Failed to start server, error: \(error.localizedDescription)")
    }
  }

  private func yellAlivePeriodically() {
    let timer = Timer(timeInterval: 30, repeats: true) { [weak self] _ in
      Log.shared.info("IOSDeviceAgent is alive")
    }
    RunLoop.main.add(timer, forMode: .common)
  }
}
