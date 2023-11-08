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
