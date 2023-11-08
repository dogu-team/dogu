import WebDriverAgentLib

actor AlertDetector {
  enum Error: Swift.Error {
    case sessionNotFound
    case webDriverClientNotFound
  }

  private var webDriverClient: WebDriverClient?

  init() {
  }
  
  func open(webDriverClient: WebDriverClient) throws {
    self.webDriverClient = webDriverClient
  }


  @MainActor
  func query() async throws -> Inner_Types_DcIdaQueryAlertResult {
    guard let webDriverClient = await self.webDriverClient else {
      throw Error.webDriverClientNotFound
    }
    let app = try await webDriverClient.getApplication()
    let alert = app.alerts.firstMatch
    if !alert.exists {
      return Inner_Types_DcIdaQueryAlertResult.with {
        $0.isShow = false
        $0.title = ""
      }
    }
    
    return Inner_Types_DcIdaQueryAlertResult.with {
      $0.isShow = true
      $0.title = alert.label
    }
  }
}
