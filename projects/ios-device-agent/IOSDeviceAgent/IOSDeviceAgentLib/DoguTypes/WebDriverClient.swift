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

  public init(url: String) throws {
    _ = try url.url()
    self.url = url
  }

  public func status() async throws {
    _ = try await request(method: .get, pathQuery: "/status", body: .empty)
  }

  public func setSessionIfNotSet() async throws {
    if sessionID.isEmpty {
      sessionID = try await newSession()
    }
  }

  private func newSession() async throws -> String {
    let data = try await request(
      method: .post, pathQuery: "/session",
      body: .dict([
        "capabilities": [:]
      ]))
    let parsed = try parseWebDriverResponse(data: data)
    return try parseSessionId(response: parsed)
  }

  public func performActions(_ actions: [String: Any]) async throws {
    try await performActions(.dict(actions))
  }

  public func performActions(_ actions: Data) async throws {
    try await performActions(.data(actions))
  }

  public func performActions(_ actions: String) async throws {
    try await performActions(.string(actions))
  }

  private func performActions(_ body: HttpRequestBody) async throws {
    print("performActions: \(body)")
    try await setSessionIfNotSet()
    _ = try await request(
      method: .post,
      pathQuery: "/session/\(sessionID)/actions",
      body: body
    )
  }

  public func homescreen() async throws {
//    try XCUIDevice.shared.fb_goToHomescreen()
    try XCUIDevice.shared.fb_pressButton("home", forDuration: 100)
  }

  public func pressButton(_ button: String) async throws {
    try XCUIDevice.shared.fb_pressButton(button, forDuration: 10)
  }

  private func request(method: HttpMethod, pathQuery: String, body: HttpRequestBody, timeout: TimeInterval = WebDriverConstants.defaultTimeout) async throws -> Data {
    let url = "\(self.url)\(pathQuery)"
    var request = URLRequest(url: try url.url())
    request.httpMethod = method.rawValue
    request.timeoutInterval = timeout
    request.httpBody = try makeBody(body)

    var responseData: Data = Data()
    var cancellables: Set<AnyCancellable> = []
    let _: Void = try await withCheckedThrowingContinuation { continuation in
      URLSession.shared.dataTaskPublisher(for: request)
        .tryMap(castHTTPResponse)
        .tryMap(validateResponseCode)
        .map(takeOnlyData)
        .sink(
          receiveCompletion: completeWithContinuation(continuation),
          receiveValue: {
            responseData = $0
          }
        ).store(in: &cancellables)
    }
    return responseData
  }
}
