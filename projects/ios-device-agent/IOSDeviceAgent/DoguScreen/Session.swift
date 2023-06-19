//
//  Session.swift
//  DoguScreen
//
//  Created by jenkins on 2023/06/02.
//  Copyright © 2023 Dogu. All rights reserved.
//

import AVFoundation
import Foundation
import Network

class Session {
  public enum State {
    case started
    case closed
  }
  let sessionId: UInt32
  var connection: NWConnection
  let semaphore = DispatchSemaphore(value: 0)
  var state: State = .started
  var frameCount = 0
  var orientation: CGImagePropertyOrientation = .up

  var lastFrameTimeMs = 0.0

  // option
  var recvQueue = SizePrefixedRecvQueue()
  var streamingOption = StreamingOption()
  var frameDurationMs = 0.033
  var encodeError: String = ""

  init(sessionId: UInt32, connection: NWConnection, param: Data) {
    self.sessionId = sessionId
    self.connection = connection

    connection.stateUpdateHandler = { [weak self] state in
      switch state {
      case .ready:
        NSLog("Client connected")
      case .failed(let error):
        NSLog("Connection failure, error: \(error.localizedDescription)")
        self?.state = .closed
      default:
        break
      }
    }

    let decoder = JSONDecoder()
    do {
      let jsonDoc = try decoder.decode(StreamingOption.self, from: param)
      self.streamingOption = jsonDoc
      if self.streamingOption.maxFps <= 0 {
        self.streamingOption.maxFps = 30
      }
      self.frameDurationMs = Double(1) / Double(self.streamingOption.maxFps)
      self.state = .started
      NSLog("Session.receiveData fps: \(self.streamingOption.maxFps), res: \(self.streamingOption.maxResolution), frameDuration: \(self.frameDurationMs)")
    } catch {
      NSLog("Session.receiveData decode error: \(error.localizedDescription)")
    }
  }

  func send(data: Data) {
    if self.state == .closed {
      NSLog("Session.send: connection is closed. id: \(self.sessionId)")
      return
    }

    // prefix h264 startcode
    let startCode = Data(bytes: [0x00, 0x00, 0x00, 0x01])
    var size = UInt32(data.count + startCode.count).littleEndian
    let sizeData = Data(bytes: &size, count: MemoryLayout<UInt32>.size)
    let dataToSend = sizeData + startCode + data

    connection.send(
      content: dataToSend,
      isComplete: true,
      completion: .contentProcessed({ error in
        if let error = error {
          NSLog("Send data error: \(error.localizedDescription)")
          self.state = .closed
        }
        self.semaphore.signal()
      }))
    let timeout = DispatchTime.now() + .seconds(5)
    let result = self.semaphore.wait(timeout: timeout)
    if result == .timedOut {
      NSLog("Session.send: send timeout. id: \(self.sessionId)")
      connection.cancel()
      self.state = .closed
    }
  }

  func close() {
    self.connection.cancel()
    self.state = .closed
  }

  func setEncodeError(_ error: String) {
    NSLog("Session.setEncodeError: \(error)")
    self.encodeError = error
  }
}
