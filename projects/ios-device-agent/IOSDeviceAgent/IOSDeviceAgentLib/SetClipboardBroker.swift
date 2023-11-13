import WebDriverAgentLib

actor SetClipboardBroker: IControlBroker {
  typealias Control = PatternControl

  private var webDriverClient: WebDriverClient? = nil

  func open(with param: ControlOpenParam) throws {
    self.webDriverClient = param.webDriverClient
  }

  func close() throws {}

  func push(with control: Control) {
    Task.catchable(
      {
        try await self.setTextClipboard(text: control.control.text)
      },
      catch: {
        Log.shared.error("Failed to set clipboard: \($0)")
      })
  }

  @MainActor
  private func setTextClipboard(text: String) async throws {
    let app = try await webDriverClient!.getApplication()
    let field = app.textFields.firstMatch
    if !field.exists {
      return
    }
    try field.fb_typeText(text, shouldClear: false)
  }
}
