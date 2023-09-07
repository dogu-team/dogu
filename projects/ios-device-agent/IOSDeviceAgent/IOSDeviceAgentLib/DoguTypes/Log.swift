import Foundation
import os

public protocol LevelLogger {
  func error(_ message: Any, data: [String: Any], file: String, line: Int, function: String)
  func warning(_ message: Any, data: [String: Any], file: String, line: Int, function: String)
  func info(_ message: Any, data: [String: Any], file: String, line: Int, function: String)
  func debug(_ message: Any, data: [String: Any], file: String, line: Int, function: String)
  func verbose(_ message: Any, data: [String: Any], file: String, line: Int, function: String)
}

public protocol LogFormatter {
  func format(_ data: [String: Any]) -> String
}

public protocol LogStringHandler {
  func error(_ message: String) async
  func warning(_ message: String) async
  func info(_ message: String) async
  func debug(_ message: String) async
  func verbose(_ message: String) async
}

public protocol LogMapHandler {
  func error(_ data: [String: Any]) async
  func warning(_ data: [String: Any]) async
  func info(_ data: [String: Any]) async
  func debug(_ data: [String: Any]) async
  func verbose(_ data: [String: Any]) async
}

public class LogClass {
  public enum Level: Int32 {
    case error = 10
    case warning = 20
    case info = 30
    case debug = 40
    case verbose = 50

    public func string() -> String {
      switch self {
      case .error:
        return "error"
      case .warning:
        return "warning"
      case .info:
        return "info"
      case .debug:
        return "debug"
      case .verbose:
        return "verbose"
      }
    }
    }

  class CriticalLogger {
    let osLog = OSLog(subsystem: "com.dogu.common", category: "critical")
    static let `default` = CriticalLogger()

    func log(_ message: Any) {
      os_log("%{public}@", log: osLog, type: .error, "\(message)")
    }
  }

  enum Updater {
    static func update(_ data: [String: Any], key: String, value: Any) -> [String: Any] {
      if let value = data[key] {
        CriticalLogger.default.log("overwrite key: \(key) value: \(value)")
      }
      var data = data
      data[key] = value
      return data
    }

    static func update(_ data: [String: Any], subsystem: String, category: String, level: Level, message: Any, file: String, line: Int, function: String) -> [String: Any] {
      var data = data
      data = update(data, key: "subsystem", value: subsystem)
      data = update(data, key: "category", value: category)
      data = update(data, key: "level", value: level.string())
      data = update(data, key: "message", value: "\(message)")
      data = update(data, key: "file", value: file)
      data = update(data, key: "line", value: line)
      data = update(data, key: "function", value: function)
      return data
    }
  }

  public class JSONFormatter: LogFormatter {
    public func format(_ data: [String: Any]) -> String {
      var serialized = Data()
      do {
        serialized = try JSONSerialization.data(withJSONObject: data, options: .sortedKeys)
      } catch {
        LogClass.CriticalLogger.default.log("serialization failed. error: \(error) data: \(data)")
        return ""
      }

      guard let string = String(data: serialized, encoding: .utf8) else {
        LogClass.CriticalLogger.default.log("conversion failed. data: \(serialized)")
        return ""
      }
      return string
    }
  }

  public class JSONMapHandler: LogMapHandler {
    public let subsystem: String
    public let category: String
    public let formatter = JSONFormatter()
    public var handlers = [LogStringHandler]()

    public init(subsystem: String, category: String) {
      self.subsystem = subsystem
      self.category = category
    }

    @discardableResult
    public func add(handler: LogStringHandler) -> Self {
      handlers.append(handler)
      return self
    }

    @discardableResult
    public func add(from factory: ((subsystem: String, category: String)) -> LogStringHandler) -> Self {
      add(handler: factory((subsystem: subsystem, category: category)))
    }

    public func error(_ data: [String: Any]) async {
      let formatted = formatter.format(data)
      handlers.forEach { handler in
        Task {
          await handler.error(formatted)
        }
      }
    }

    public func warning(_ data: [String: Any]) async {
      let formatted = formatter.format(data)
      handlers.forEach { handler in
        Task {
          await handler.warning(formatted)
        }
      }
    }

    public func info(_ data: [String: Any]) async {
      let formatted = formatter.format(data)
      handlers.forEach { handler in
        Task {
          await handler.info(formatted)
        }
      }
    }

    public func debug(_ data: [String: Any]) async {
      let formatted = formatter.format(data)
      handlers.forEach { handler in
        Task {
          await handler.debug(formatted)
        }
      }
    }

    public func verbose(_ data: [String: Any]) async {
      let formatted = formatter.format(data)
      handlers.forEach { handler in
        Task {
          await handler.verbose(formatted)
        }
      }
    }
  }

  public class OSLogStringHandler: LogStringHandler {
    public let osLog: OSLog

    public init(subsystem: String, category: String) {
      osLog = OSLog(subsystem: subsystem, category: category)
    }

    public func error(_ message: String) {
      os_log("%{public}@", log: osLog, type: .fault, message)
    }

    public func warning(_ message: String) {
      os_log("%{public}@", log: osLog, type: .error, message)
    }

    public func info(_ message: String) {
      os_log("%{public}@", log: osLog, type: .default, message)
    }

    public func debug(_ message: String) {
      os_log("%{public}@", log: osLog, type: .debug, message)
    }

    public func verbose(_ message: String) {
      os_log("%{public}@", log: osLog, type: .info, message)
    }
  }

  public class PrintStringHandler: LogStringHandler {
    public init() {}

    public func error(_ message: String) {
      fputs("\(message)\n", stderr)
      fflush(stderr)
    }

    public func warning(_ message: String) {
      print(message)
      fflush(stdout)
    }

    public func info(_ message: String) {
      print(message)
      fflush(stdout)
    }

    public func debug(_ message: String) {
      print(message)
      fflush(stdout)
    }

    public func verbose(_ message: String) {
      print(message)
      fflush(stdout)
    }
  }

  let subsystem: String
  let category: String
  var handlers = [LogMapHandler]()

  public init(subsystem: String, category: String) {
    self.subsystem = subsystem
    self.category = category
  }

  @discardableResult
  public func add(handler: LogMapHandler) -> Self {
    handlers.append(handler)
    return self
  }

  @discardableResult
  public func add(from factory: ((subsystem: String, category: String)) -> LogMapHandler) -> Self {
    add(handler: factory((subsystem: subsystem, category: category)))
  }

  public func log(_ level: Level, _ message: Any, data: [String: Any] = [:], file: String = #fileID, line: Int = #line, function: String = #function) {
    let data = Updater.update(data, subsystem: subsystem, category: category, level: level, message: message, file: file, line: line, function: function)
    handlers.forEach { handler in
      Task {
        switch level {
        case .error:
          await handler.error(data)
        case .warning:
          await handler.warning(data)
        case .info:
          await handler.info(data)
        case .debug:
          await handler.debug(data)
        case .verbose:
          await handler.verbose(data)
        }
      }
    }
  }

  public func error(_ message: Any, data: [String: Any] = [:], file: String = #fileID, line: Int = #line, function: String = #function) {
    log(.error, message, data: data, file: file, line: line, function: function)
  }

  public func warning(_ message: Any, data: [String: Any] = [:], file: String = #fileID, line: Int = #line, function: String = #function) {
    log(.warning, message, data: data, file: file, line: line, function: function)
  }

  public func info(_ message: Any, data: [String: Any] = [:], file: String = #fileID, line: Int = #line, function: String = #function) {
    log(.info, message, data: data, file: file, line: line, function: function)
  }

  public func debug(_ message: Any, data: [String: Any] = [:], file: String = #fileID, line: Int = #line, function: String = #function) {
    log(.debug, message, data: data, file: file, line: line, function: function)
  }

  public func verbose(_ message: Any, data: [String: Any] = [:], file: String = #fileID, line: Int = #line, function: String = #function) {
    log(.verbose, message, data: data, file: file, line: line, function: function)
  }
}
