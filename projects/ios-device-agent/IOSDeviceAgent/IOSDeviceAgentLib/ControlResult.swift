//
//  ControlResult.swift
//  IOSDeviceAgentLib
//
//  Created by jenkins on 2023/02/15.
//  Copyright © 2023 Dogu. All rights reserved.
//

import Foundation

class ControlResult {
  public let seq: Seq
  private var hasSet: Bool
  private let session: ControlSession

  public init(seq: Seq, session: ControlSession) {
    self.seq = seq
    self.hasSet = false
    self.session = session
  }

  public func set(result: Inner_Types_CfGdcDaControlResult) {
    if self.hasSet {
      return
    }
    self.hasSet = true
    Task.catchable(
      {
        let resultToSend = Inner_Params_DcIdaResult.with {
          $0.seq = self.seq
          $0.dcGdcDaControlResult = result
        }

        Log.shared.debug("ControlResult.set seq: \(self.seq), control: \(resultToSend.dcGdcDaControlResult)")
        try await self.session.send(result: resultToSend)
      },
      catch: {
        Log.shared.error("ControlResult.set handle error: \($0.localizedDescription)")
      })
  }
}
