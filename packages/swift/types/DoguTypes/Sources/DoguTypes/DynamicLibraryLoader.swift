import Foundation

@MainActor
public final class DynamicLibraryLoader: Sendable {
  enum Error: Swift.Error {
    case notOpened(bundlePath: String)
    case bundleNotLoaded(bundlePath: String)
    case executablePathNotFound(bundlePath: String)
    case dlOpenFailed(bundlePath: String, exePath: String, errorMessage: String)
    case dlSymFailed(bundlePath: String, exePath: String, symbolName: String, errorMessage: String)
  }

  private let bundlePath: String
  private var exePath: String?
  private var handle: UnsafeMutableRawPointer?

  public init(bundlePath: String) {
    self.bundlePath = bundlePath
  }

  public func open() throws {
    guard let bundle = Bundle(path: bundlePath),
      bundle.load()
    else {
      throw Error.bundleNotLoaded(bundlePath: bundlePath)
    }

    guard let exePath = bundle.executablePath else {
      throw Error.executablePathNotFound(bundlePath: bundlePath)
    }
    self.exePath = exePath

    guard let handle = dlopen(exePath.cString(using: .utf8), RTLD_NOW) else {
      throw Error.dlOpenFailed(bundlePath: bundlePath, exePath: exePath, errorMessage: dlError())
    }
    self.handle = handle
  }

  public func find<T>(_ symbolName: String, as: T.Type) throws -> T {
    guard
      let handle,
      let exePath
    else {
      throw Error.notOpened(bundlePath: bundlePath)
    }

    guard let pointer = dlsym(handle, symbolName) else {
      throw Error.dlSymFailed(
        bundlePath: self.bundlePath, exePath: exePath, symbolName: symbolName,
        errorMessage: dlError())
    }

    return unsafeBitCast(pointer, to: T.self)
  }

  private func dlError() -> String {
    if let errorMessageCStr = dlerror() {
      return String(cString: errorMessageCStr)
    } else {
      return "dlerror returned nil"
    }
  }
}
