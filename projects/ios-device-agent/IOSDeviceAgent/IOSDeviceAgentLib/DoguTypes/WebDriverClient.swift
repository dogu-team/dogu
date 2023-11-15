import Combine
import WebDriverAgentLib

enum WebDriverConstants {
  static let defaultTimeout: TimeInterval = 3  // seconds
}

enum WebDriverError: Swift.Error {
  case invalidResponse(_ response: URLResponse)
  case invalidResponseCode(_ responseCode: Int)
  case invalidWebDriverSessionID(_ webDriverSessionID: String)
  case parsingWebDriverResponseFailed(_ response: WebDriverResponse)
}

struct WebDriverResponse: Decodable {
  var sessionId: String?
}

private func castHTTPResponse(data: Data, response: URLResponse) throws -> (Data, HTTPURLResponse) {
  guard let httpResponse = response as? HTTPURLResponse else {
    throw WebDriverError.invalidResponse(response)
  }
  return (data, httpResponse)
}

private func validateResponseCode(data: Data, response: HTTPURLResponse) throws -> (Data, HTTPURLResponse) {
  guard 200..<300 ~= response.statusCode else {
    throw WebDriverError.invalidResponseCode(response.statusCode)
  }
  return (data, response)
}

private func takeOnlyData(data: Data, response: HTTPURLResponse) -> Data {
  return data
}

private func parseWebDriverResponse(data: Data) throws -> WebDriverResponse {
  return try JSONDecoder().decode(WebDriverResponse.self, from: data)
}

private func parseSessionId(response: WebDriverResponse) throws -> String {
  guard let sessionID = response.sessionId, sessionID.count > 0 else {
    throw WebDriverError.parsingWebDriverResponseFailed(response)
  }
  return sessionID
}

private func completeWithContinuation(_ continuation: CheckedContinuation<Void, any Error>) -> (Subscribers.Completion<any Error>) -> Void {
  return {
    switch $0 {
    case .finished:
      continuation.resume()
    case .failure(let error):
      continuation.resume(throwing: error)
    }
  }
}

private func makeBody(_ body: HttpRequestBody) throws -> Data? {
  switch body {
  case .empty:
    return nil
  case .data(let data):
    return data
  case .string(let string):
    return try string.data()
  case .dict(let dict):
    return try JSONSerialization.data(withJSONObject: dict)
  }
}

public actor WebDriverClient {
  public let url: String
  public private(set) var sessionID: String = ""

  enum Error: Swift.Error {
    case sessionNotFound
  }

  public init(url: String) throws {
    _ = try url.url()
    self.url = url
  }

  public func status() async throws {
  }

  @MainActor
  public func getSession() async throws -> FBSession {
    guard let session = FBSession.active() else {
      return FBSession.initWith(nil)
    }
    return session
  }

  @MainActor
  public func getApplication() async throws -> FBApplication {
    let session = try await getSession()
    return session.activeApplication
  }


  @MainActor
  public func homescreen() async throws {
    try XCUIDevice.shared.fb_pressButton("home", forDuration: 100)
  }

  @MainActor
  public func pressButton(_ button: String) async throws {
    try XCUIDevice.shared.fb_pressButton(button, forDuration: 10)
  }

}
