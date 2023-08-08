//
//  Network.swift
//  IOSDeviceAgentLib
//
//  Copyright © 2023 Dogu. All rights reserved.
//

import Foundation
import Network

func isTCPPortOpen(host: String, port: UInt16) async -> Bool {
  do {
      let endpoint = NWEndpoint.hostPort(host: NWEndpoint.Host(host), port: NWEndpoint.Port(integerLiteral: port))
      let connection = NWConnection(to: endpoint, using: .tcp)
      
      let group = DispatchGroup()
      group.enter()
      
      connection.stateUpdateHandler = { newState in
          if newState == .ready {
              group.leave()
          }
      }
      
      connection.start(queue: .global())
      
      let timeoutResult = await withTaskCancellationHandler {
          connection.cancel()
          group.leave()
      } operation: {
          group.wait(timeout: .now() + 5) // Adjust timeout duration as needed
          return connection.state == .ready
      }
      
      return timeoutResult
  } catch {
      return false
  }
}
