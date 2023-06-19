//
//  SizePrefixedRecvQueue.swift
//  DoguScreen
//
//  Created by jenkins on 2023/06/07.
//  Copyright © 2023 Dogu. All rights reserved.
//

import Foundation

class SizePrefixedRecvQueue {
  private var buffer: Data

  init() {
    buffer = Data()
  }

  func pushBuffer(buffer: Data) {
    var newBuffer = Data(count: self.buffer.count + buffer.count)
    newBuffer[0..<self.buffer.count] = self.buffer
    newBuffer[self.buffer.count..<newBuffer.count] = buffer
    self.buffer = newBuffer
  }

  func has() -> Bool {
    if buffer.count < 4 {
      return false
    }
    let packetSize = readUInt32(data: buffer, offset: 0)
    if buffer.count < packetSize + 4 {
      return false
    }
    return true
  }

  func pop() -> Data {
    assert(has(), "PacketQueue no package to pop")

    let packetSize = readUInt32(data: buffer, offset: 0)
    let ret = buffer.subdata(in: 4..<4 + Int(packetSize))
    buffer = buffer.subdata(in: 4 + Int(packetSize)..<buffer.count)
    return ret
  }

  private func readUInt32(data: Data, offset: Int) -> UInt32 {
    let subdata = data.subdata(in: offset..<offset + MemoryLayout<UInt32>.size)
    return subdata.withUnsafeBytes { $0.load(as: UInt32.self) }
  }
}
