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
  func onParam(session: ControlSession, abstractParam: Inner_Params_DcIdaParam) async throws
}

public actor ControlSession {
  public enum State {
    case started
    case closed
  }

  let sessionId: UInt32
  let eventListener: IControlSessionListener

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
          try await this.onStateUpdate(state: state)
        },
        catch: {
          Log.shared.error("ControlSession.stateUpdateHandler handle error: \($0.localizedDescription)")
        })
    }

    Log.shared.info("ControlSession.start")
    connection.start(queue: .main)
  }

  private func onStateUpdate(state: NWConnection.State) async throws {
    switch state {
    case .ready:
      Log.shared.info("ControlSession connected")
      try await self.eventListener.open(session: self)
      self.receiveData(on: connection)
    case .failed(let error):
      Log.shared.error("ControlSession failure, error: \(error.localizedDescription)")
      self.state = .closed
      try await self.eventListener.close(session: self)
    default:
      break
    }
  }

  private func receiveData(on connection: NWConnection) {
    NSLog("ControlSession.receiveData")
    connection.receive(
      minimumIncompleteLength: 1, maximumLength: 1400,
      completion: { [weak self] data, context, isComplete, error in
        if let data = data, !data.isEmpty {
          guard let this = self else {
            Log.shared.error("ControlSession.receiveData no self")
            return
          }
          Task.catchable(
            {
              try await this.onRecvData(data: data, isComplete: isComplete, error: error)
            },
            catch: {
              Log.shared.error("ControlSession.stateUpdateHandler handle error: \($0.localizedDescription)")
            })
        }
      })
  }

  private func onRecvData(data: Data, isComplete: Bool, error: NWError?) async throws {
    self.recvQueue.pushBuffer(buffer: data)
    while true {
      if !self.recvQueue.has() {
        break
      }
      let packet = self.recvQueue.pop()
      let paramList = try Inner_Params_DcIdaParamList(serializedData: packet)
      for param in paramList.params {
        try await self.eventListener.onParam(session: self, abstractParam: param)
      }
    }
    
    if let error = error {
      Log.shared.error("ControlSession.receiveData Receive data error: \(error.localizedDescription)")
      self.connection.cancel()
      return
    }


    if !isComplete {
      self.receiveData(on: connection)
    }
  }

  func send(result: Inner_Params_DcIdaResult) async throws {
    var resultList = Inner_Params_DcIdaResultList()
    resultList.results.append(result)
    do {
      try await self.send(data: try resultList.serializedData())
    } catch {
      Log.shared.error("ControlSession.send result error: \(error.localizedDescription)")
    }
  }

  private func send(data: Data) async throws {
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
      }))
  }

  func close() {
    self.connection.cancel()
    self.state = .closed
  }
}
