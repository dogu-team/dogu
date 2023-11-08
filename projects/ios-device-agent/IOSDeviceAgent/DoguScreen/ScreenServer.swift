import Foundation
import Network

class ScreenServer {
  public enum SessionState {
    case none
    case steady
    case new
  }

  let port: NWEndpoint.Port
  var listener: NWListener?
  var sessionIdSeed: UInt32 = 0
  var preventGabage: UnknownSession?
  var lastSession: Session?
  var liveCheckSession: LiveCheckSession?

  init(port: NWEndpoint.Port) {
    self.port = port
  }

  func start() throws {
    do {
      let options = NWProtocolTCP.Options()
      options.persistTimeout = 0 // this one reduces waiting time significantly when there is no open connections
      options.enableKeepalive = true // this one reduces the number of open connections by reusing existing ones
      options.connectionDropTime = 5
      options.connectionTimeout = 5
      options.noDelay = true
      let params = NWParameters(tls:nil, tcp: options)
      params.allowLocalEndpointReuse = true
      
      listener = try NWListener(using: params, on: port)
      listener?.stateUpdateHandler = { [weak self] state in
        switch state {
        case .ready:
          NSLog("ScreenServer started on port \(self?.port ?? 0)")
        case .failed(let error):
          NSLog("ScreenServer failure, error: \(error.localizedDescription)")
        default:
          break
        }
      }

      listener?.newConnectionHandler = { [weak self] connection in
        NSLog("ScreenServer newConnectionHandler")

        guard let self = self else {
          NSLog("ScreenServer is not initialized")
          return
        }

        self.preventGabage = UnknownSession(connection: connection) { (connection: NWConnection, type: String, param: Data, error: NWError?) in
          NSLog("ScreenServer on param \(type), \(String(data: param, encoding: .utf8))")

          if type == String("screen") {
            NSLog("ScreenServer screen connection")
            self.lastSession?.close()
            self.sessionIdSeed += 1
            self.lastSession = Session(sessionId: self.sessionIdSeed, connection: connection, param: param)
          } else if type == String("livecheck") {
            NSLog("ScreenServer alive connection")
            self.liveCheckSession?.close()
            self.liveCheckSession = LiveCheckSession(connection: connection)
            self.liveCheckSession?.startTimer()
          } else if type == String("kill") {
            NSLog("ScreenServer kill connection")
            self.stop()
            exit(0)
          }
        }
      }

      listener?.start(queue: .main)
    } catch {
      NSLog("ScreenServer Failed to start server, error: \(error.localizedDescription)")
      throw error
    }
  }

  func querySession(sessionId: UInt32) -> (state: SessionState, session: Session?) {
    guard let session = lastSession else {
      return (state: SessionState.none, session: nil)
    }
    if session.state != .started {
      return (state: SessionState.none, session: nil)
    }

    if sessionId == session.sessionId {
      return (state: SessionState.steady, session: session)
    }
    return (state: SessionState.new, session: session)
  }

  func stop() {
    NSLog("ScreenServer stop")
    self.lastSession?.connection.cancel()
    self.liveCheckSession?.close()
    listener?.cancel()
  }
}
