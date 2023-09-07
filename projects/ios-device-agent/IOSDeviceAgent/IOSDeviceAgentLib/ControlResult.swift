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
  private let responser: RelayResponser

  public init(seq: Seq, responser: RelayResponser) {
    self.seq = seq
    self.hasSet = false
    self.responser = responser
  }

  public func set(result: Inner_Types_CfGdcDaControlResult) {
    if self.hasSet {
      return
    }
    self.hasSet = true
    Task {
      var resultList = Inner_Params_CfGdcDaResultList()
      var resultUnion = Inner_Params_CfGdcDaResult()
      resultUnion.seq = self.seq
      resultUnion.cfGdcDaControlResult = result
      resultList.results.append(resultUnion)
      try await self.responser.send(resultList: resultList)
    }
  }
}
