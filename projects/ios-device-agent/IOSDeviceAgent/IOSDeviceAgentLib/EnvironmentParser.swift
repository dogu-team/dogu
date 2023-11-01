import Foundation

struct Config {
  var webDriverPort: Int32 = 0
  var grpcPort: Int32 = 0
  var isDeviceShare: Bool = false
}

final class EnvironmentParser {
  enum Error: Swift.Error {
    case invalidWebDriverPort(String?)
    case invalidGrpcPort(String?)
    case invalidIsDeviceShare(String?)
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

    let isDeviceShare = ProcessInfo.processInfo.environment["DOGU_IOS_DEVICE_AGENT_IS_DEVICE_SHARE"]
    guard let isDeviceShareString = isDeviceShare,
      !isDeviceShareString.isEmpty,
      let isDeviceShareBool = Int32(isDeviceShareString) == 1 ? true : false
    else {
      throw Error.invalidIsDeviceShare(isDeviceShare)
    }

    return Config(webDriverPort: webDriverPortNumber, grpcPort: grpcPortNumber, isDeviceShare: isDeviceShareBool)
  }
}
