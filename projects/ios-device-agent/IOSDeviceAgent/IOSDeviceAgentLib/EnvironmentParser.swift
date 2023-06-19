import Foundation

struct Config {
  var webDriverPort: Int32 = 0
  var grpcPort: Int32 = 0
}

final class EnvironmentParser {
  enum Error: Swift.Error {
    case invalidWebDriverPort(String?)
    case invalidGrpcPort(String?)
  }

  func parse() throws -> Config {
    let webDriverPort = ProcessInfo.processInfo.environment["DOGU_IOS_DEVICE_AGENT_WEB_DRIVER_PORT"]
    guard let webDriverPortString = webDriverPort,
      !webDriverPortString.isEmpty,
      let webDriverPortNumber = Int32(webDriverPortString)
    else {
      throw Error.invalidWebDriverPort(webDriverPort)
    }

    let grpcPort = ProcessInfo.processInfo.environment["DOGU_IOS_DEVICE_AGENT_GRPC_PORT"]
    guard let grpcPortString = grpcPort,
      !grpcPortString.isEmpty,
      let grpcPortNumber = Int32(grpcPortString)
    else {
      throw Error.invalidGrpcPort(grpcPort)
    }

    return Config(webDriverPort: webDriverPortNumber, grpcPort: grpcPortNumber)
  }
}
