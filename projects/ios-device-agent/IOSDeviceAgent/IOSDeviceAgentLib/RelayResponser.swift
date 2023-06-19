//
//  RelayResponser.swift
//  IOSDeviceAgentLib
//
//  Created by jenkins on 2023/02/15.
//  Copyright © 2023 Dogu. All rights reserved.
//

import DoguTypes
import Foundation
import GRPC

class RelayResponser {
  private let responseStream: GRPC.GRPCAsyncResponseStreamWriter<DoguTypes.Inner_Params_CfGdcDaResultList>

  public init(responseStream: GRPC.GRPCAsyncResponseStreamWriter<DoguTypes.Inner_Params_CfGdcDaResultList>) {
    self.responseStream = responseStream
  }

  public func send(resultList: DoguTypes.Inner_Params_CfGdcDaResultList) async throws {
    try await responseStream.send(resultList)
  }
}
