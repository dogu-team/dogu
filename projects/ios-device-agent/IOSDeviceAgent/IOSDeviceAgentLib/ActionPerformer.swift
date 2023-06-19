import DoguTypes
import WebDriverAgentLib

actor ActionPerformer {
  enum Error: Swift.Error {
    case sessionNotFound
  }
  
  private let webDriverClient: WebDriverClient
  
  init(webDriverClient: WebDriverClient) {
    self.webDriverClient = webDriverClient
  }
  
  func performW3CActions(_ actions: [Any]) async throws {
    try await webDriverClient.setSessionIfNotSet()
    guard let session = FBSession.active() else {
      throw Error.sessionNotFound
    }
    try session.activeApplication.fb_performActions(withSynthesizerType: FBW3CActionsSynthesizer.self, actions: actions, elementCache: session.elementCache)
  }
}
