import Foundation

public enum DataError: Error {
  case stringFailed(_ data: Data)
}

extension Data {
  public func string() throws -> String {
    guard let string = String(data: self, encoding: .utf8) else {
      throw DataError.stringFailed(self)
    }
    return string
  }
}

public enum StringError: Error {
  case dataFailed(_ string: String)
  case urlFailed(_ string: String)
}

extension String {
  public func data() throws -> Data {
    guard let data = self.data(using: .utf8) else {
      throw StringError.dataFailed(self)
    }
    return data
  }

  public func url() throws -> URL {
    guard let url = URL(string: self) else {
      throw StringError.urlFailed(self)
    }
    return url
  }
}
