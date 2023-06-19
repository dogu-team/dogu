import DoguTypes
import Foundation
import GRPC
import NIOPosix
import UIKit

public final class IOSDeviceAgent: NSObject {
  private var config = Config()
  private let controlProcessor = MainControlProcessor()

  public static let shared: IOSDeviceAgent = IOSDeviceAgent()

  public func open() throws {
    try openInternal()
    WebDriverAgentLibUtils.open()
  }

  public func run() {
    runInternal()
    WebDriverAgentLibUtils.run()
  }
  
  private func openInternal() throws {
    config = try EnvironmentParser().parse()
    let screenSize = WebDriverAgentLibUtils.screenSize()
    Task.catchable(
      {
        let webDriverClient = try WebDriverClient(url: "http://127.0.0.1:\(self.config.webDriverPort)")
        let param = ControlOpenParam(screenSize: screenSize, webDriverClient: webDriverClient, actionPerformer: ActionPerformer(webDriverClient: webDriverClient))
        try await self.controlProcessor.open(param: param)
      },
      catch: {
        Log.shared.debug("DeviceControlProcessor open failed. \($0)")
      })
  }
  
  private func runInternal() {
    Task.catchable(
      {
        let group = MultiThreadedEventLoopGroup(numberOfThreads: 1)
        defer {
          try? group.syncShutdownGracefully()
        }

        let server = try await Server.insecure(group: group)
          .withServiceProviders([
            ServiceProvider(controlProcessor: self.controlProcessor)
          ])
          .bind(host: "0.0.0.0", port: Int(self.config.grpcPort))
          .get()
        Log.shared.debug("grpc server started on \(WebDriverAgentLibUtils.ipv4()):\(self.config.grpcPort)")
        try await server.onClose.get()
      },
      catch: {
        Log.shared.debug("grpc server closed. \($0)")
      })
  }
}
