import WebDriverAgentLib

actor ActionPerformer {
  enum Error: Swift.Error {
    case sessionNotFound
  }

  private let webDriverClient: WebDriverClient

  init(webDriverClient: WebDriverClient) {
    self.webDriverClient = webDriverClient
  }

  @MainActor
  func performW3CActions(_ actions: [Any]) async throws {
    let session = try await webDriverClient.getSession()
    try session.activeApplication.fb_performActions(withSynthesizerType: FBW3CActionsSynthesizer.self, actions: actions, elementCache: session.elementCache)
  }
}
