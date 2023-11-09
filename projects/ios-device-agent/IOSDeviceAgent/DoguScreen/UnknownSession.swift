import AVFoundation
import Foundation
import Network

struct SessionType: Decodable {
  var type: String = ""
}

typealias OnConnectHandler = ((connection: NWConnection, type: String, param: Data, error: NWError?)) -> Void

class UnknownSession {
  var connection: NWConnection
  var recvQueue = SizePrefixedRecvQueue()
  var completion: OnConnectHandler

  // option
  init(connection: NWConnection, completion: @escaping OnConnectHandler) {
    self.connection = connection
    self.completion = completion

    connection.stateUpdateHandler = { [weak self] state in
      switch state {
      case .ready:
        NSLog("UnknownSession Client connected")
      case .failed(let error):
        NSLog("UnknownSession Connection failure, error: \(error.localizedDescription)")
      default:
        break
      }
    }

    receiveData(on: connection)
    NSLog("UnknownSession start")
    connection.start(queue: .main)
  }

  func receiveData(on connection: NWConnection) {
    NSLog("UnknownSession.receiveData")
    connection.receive(
      minimumIncompleteLength: 1, maximumLength: 1400,
      completion: { [weak self] data, context, isComplete, error in
        NSLog("UnknownSession.receiveData message received")
        if let data = data, !data.isEmpty {
          guard let this = self else {
            NSLog("UnknownSession.receiveData no self")
            return
          }

          this.recvQueue.pushBuffer(buffer: data)
          this.recvQueue.popLoop { packet in
            let packetString = String(data: packet, encoding: .utf8)
            NSLog("UnknownSession.receiveData packetString \(String(describing: packetString))")
            // decode packet as json
            let decoder = JSONDecoder()
            do {
              let jsonDoc = try decoder.decode(SessionType.self, from: packet)
              NSLog("UnknownSession.receiveData type: \(jsonDoc.type)")
              this.completion((connection: connection, type: jsonDoc.type, param: packet, error: nil))
            } catch {
              NSLog("UnknownSession.receiveData decode error: \(error.localizedDescription)")
            }
          }
        }

        if let error = error {
          NSLog("UnknownSession.receiveData Receive data error: \(error.localizedDescription)")
          guard let this = self else {
            NSLog("UnknownSession.receiveData no self")
            return
          }
          this.connection.cancel()
          this.completion((connection: connection, type: "", param: Data(), error: error))
          return
        }

        if !isComplete {
          self?.receiveData(on: connection)
        }
      })
  }
}
