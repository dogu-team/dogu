import Foundation

public enum HttpMethod: String {
  case get = "GET"
  case head = "HEAD"
  case delete = "DELETE"
  case post = "POST"
  case put = "PUT"
  case patch = "PATCH"
}

public enum HttpRequestBody {
  case empty
  case data(Data)
  case string(String)
  case dict([String: Any])
}
