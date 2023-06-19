import Foundation
import Network

public typealias OnClosedHandler = () -> Void

public final class TcpClient {
  var closeHandler: OnClosedHandler
  private var connection: NWConnection?

  public init(closeHandler: @escaping OnClosedHandler) {
    self.closeHandler = closeHandler
  }

  public func connectToServer(host: String, port: Int) {
    NSLog("TcpClient.connectToServer ")

    let endpoint = NWEndpoint.hostPort(host: NWEndpoint.Host(host), port: NWEndpoint.Port(rawValue: UInt16(port))!)
    connection = NWConnection(to: endpoint, using: .tcp)
    guard let connection = connection else {
      NSLog("TcpClient.connectToServer Failed to create connection")
      return
    }

    connection.stateUpdateHandler = { [weak self] newState in
      NSLog("TcpClient.connectToServer stateUpdateHandler \(newState)")
      guard let this = self else {
        NSLog("TcpClient.connectToServer No self")
        return
      }
      switch newState {
      case .ready:
        NSLog("TcpClient.connectToServer Connection established")
      case .failed(let error):
        NSLog("TcpClient.connectToServer error \(error)")
        this.closeHandler()
      case .cancelled:
        this.closeHandler()
      default:
        break
      }
    }

    connection.start(queue: .global())
  }

  public func send(data: Data) {
    NSLog("TcpClient.send ")

    guard let connection = connection else {
      NSLog("TcpClient.send Failed to create connection")
      return
    }
    var size = UInt32(data.count).littleEndian
    let sizeData = Data(bytes: &size, count: MemoryLayout<UInt32>.size)
    let dataToSend = sizeData + data

    connection.send(
      content: dataToSend,
      isComplete: true,
      completion: .contentProcessed({ error in
        if let error = error {
          NSLog("Send data error: \(error.localizedDescription)")
          self.closeHandler()
        }
        NSLog("TcpClient.send done")
      }))
  }
}
