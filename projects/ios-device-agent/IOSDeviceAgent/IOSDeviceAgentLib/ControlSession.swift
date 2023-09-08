//
//  ControlSession.swift
//  IOSDeviceAgentLib
//
//  Created by jenkins on 2023/09/07.
//  Copyright © 2023 Dogu. All rights reserved.
//

import Foundation
import Network
import SwiftProtobuf

protocol IControlSessionListener {
  func open(session: ControlSession) async throws
  func close(session: ControlSession) async throws
  func onParam(session: ControlSession, param: Inner_Params_DcIdaParam) async throws
}

public class ControlSession {
  public enum State {
    case started
    case closed
  }

  let sessionId: UInt32
  let eventListener: IControlSessionListener
  let semaphore = DispatchSemaphore(value: 0)
  var connection: NWConnection
  var state: State = .started

  // option
  var recvQueue = SizePrefixedRecvQueue()

  init(sessionId: UInt32, connection: NWConnection, listener: IControlSessionListener) {
    self.sessionId = sessionId
    self.connection = connection
    self.eventListener = listener

    connection.stateUpdateHandler = { [weak self] state in
      guard let this = self else {
        Log.shared.error("ControlSession.receiveData no self")
        return
      }
      Task.catchable(
        {
          switch state {
          case .ready:
            Log.shared.info("ControlSession connected")
            try await this.eventListener.open(session: this)
          case .failed(let error):
            Log.shared.error("ControlSession failure, error: \(error.localizedDescription)")
            this.state = .closed
            try await this.eventListener.close(session: this)
          default:
            break
          }
        },
        catch: {
          Log.shared.error("ControlSession.stateUpdateHandler handle error: \($0.localizedDescription)")
        })
    }

    receiveData(on: connection)
    Log.shared.info("ControlSession.start")
    connection.start(queue: .main)
  }

  func receiveData(on connection: NWConnection) {
    NSLog("ControlSession.receiveData")
    connection.receive(
      minimumIncompleteLength: 1, maximumLength: 1400,
      completion: { [weak self] data, context, isComplete, error in
        if let data = data, !data.isEmpty {
          guard let this = self else {
            Log.shared.error("ControlSession.receiveData no self")
            return
          }

          this.recvQueue.pushBuffer(buffer: data)
          if !this.recvQueue.has() {
            return
          }
          let packet = this.recvQueue.pop()
          Task.catchable(
            {
              try await this.eventListener.onParam(session: this, param: Inner_Params_DcIdaParam(serializedData: packet))
            },
            catch: {
              Log.shared.error("ControlSession.receiveData decode error: \($0.localizedDescription)")
            })
        }

        if let error = error {
          Log.shared.error("ControlSession.receiveData Receive data error: \(error.localizedDescription)")
          guard let this = self else {
            Log.shared.error("ControlSession.receiveData no self")
            return
          }
          this.connection.cancel()
          return
        }

        if !isComplete {
          self?.receiveData(on: connection)
        }
      })
  }

  func send(data: Data) {
    if self.state == .closed {
      Log.shared.error("ControlSession.send: connection is closed. id: \(self.sessionId)")
      return
    }

    // prefix size
    var size = UInt32(data.count).littleEndian
    let sizeData = Data(bytes: &size, count: MemoryLayout<UInt32>.size)
    let dataToSend = sizeData + data

    connection.send(
      content: dataToSend,
      isComplete: true,
      completion: .contentProcessed({ error in
        if let error = error {
          Log.shared.error("ControlSession.send data error: \(error.localizedDescription)")
          self.state = .closed
        }
        self.semaphore.signal()
      }))
    let timeout = DispatchTime.now() + .seconds(5)
    let result = self.semaphore.wait(timeout: timeout)
    if result == .timedOut {
      Log.shared.error("ControlSession.send: send timeout. id: \(self.sessionId)")
      connection.cancel()
      self.state = .closed
    }
  }

  func close() {
    self.connection.cancel()
    self.state = .closed
  }
}
