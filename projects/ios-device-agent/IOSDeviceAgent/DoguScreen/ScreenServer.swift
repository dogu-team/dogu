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
  var aliveConnection: NWConnection?
  var sessionIdSeed: UInt32 = 0
  var preventGabage: UnknownSession?
  var lastSession: Session?

  init(port: NWEndpoint.Port) {
    self.port = port
  }

  func start() throws {
    do {
      let parameters = NWParameters.tcp
      parameters.allowLocalEndpointReuse = true
      listener = try NWListener(using: parameters, on: port)
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
            self.lastSession?.close()
            self.sessionIdSeed += 1
            self.lastSession = Session(sessionId: self.sessionIdSeed, connection: connection, param: param)
          } else {
            NSLog("ScreenServer alive connection")
            self.aliveConnection = connection
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
    self.aliveConnection?.cancel()
    self.lastSession?.connection.cancel()
    listener?.cancel()
  }
}
