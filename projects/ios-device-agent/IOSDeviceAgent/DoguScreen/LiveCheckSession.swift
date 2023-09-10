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

class LiveCheckSession {
  public enum State {
    case started
    case closed
  }
  var connection: NWConnection
  var state: State = .started
  let dummyData: Data
  var timer: Timer?

  var lastFrameTimeMs = 0.0

  init(connection: NWConnection) {
    self.connection = connection
    self.dummyData = Data(bytes: [0x05])

    connection.stateUpdateHandler = { [weak self] state in
      switch state {
      case .ready:
        NSLog("LiveCheckSession connected")
      case .failed(let error):
        NSLog("LiveCheckSession.Connection failure, error: \(error.localizedDescription)")
        self?.state = .closed
        self?.timer?.invalidate()
      default:
        break
      }
    }
  }
  func startTimer() {
    let timer = Timer.scheduledTimer(withTimeInterval: 3.0, repeats: true) { [weak self] _ in
      self?.send()
    }
    RunLoop.main.add(timer, forMode: .common)
    self.timer = timer
  }

  func send() {
    if self.state == .closed {
      NSLog("LiveCheckSession.send: connection is closed.")
      return
    }

    connection.send(
      content: self.dummyData,
      isComplete: true,
      completion: .contentProcessed({ error in
        if let error = error {
          NSLog("LiveCheckSession.Send data error: \(error.localizedDescription)")
          self.close()
        }
      }))
  }

  func close() {
    self.connection.cancel()
    self.state = .closed
    self.timer?.invalidate()
  }
}
