//
//  DuplicateCallGuarder.swift
//  IOSDeviceAgentLib
//
//  Created by jenkins on 2023/11/02.
//  Copyright © 2023 Dogu. All rights reserved.
//

class DuplicatedCallGuarder {
  private var isInProgress = false

  func guardCall(onCall: @escaping () async throws -> Void) async rethrows {
    if isInProgress { return }

    isInProgress = true
    defer {
      isInProgress = false
    }

    try await onCall()
  }
}
