import Foundation
import NIO
import NIOHTTP1
import NIOWebSocket

class WebSocketHandler: ChannelInboundHandler {
  typealias InboundIn = WebSocketFrame
  typealias OutboundOut = WebSocketFrame

  private var bufferQueue: [ByteBuffer] = []
  private let queueLock = DispatchQueue(label: "com.example.bytebuffer.queue")

  func channelRegistered(context: ChannelHandlerContext) {
    NSLog("channelRegistered")
  }

  func channelUnregistered(context: ChannelHandlerContext) {
    NSLog("channelUnregistered")
  }

  func channelActive(context: ChannelHandlerContext) {
    NSLog("channelActive")
  }

  func channelInactive(context: ChannelHandlerContext) {
    NSLog("channelInactive")

    queueLock.sync {
      bufferQueue.removeAll()
    }
  }

  func channelRead(context: ChannelHandlerContext, data: NIOAny) {
    NSLog("channelRead")
    context.eventLoop.scheduleRepeatedTask(initialDelay: .seconds(0), delay: .seconds(5)) { task in
      self.flush(context: context)
    }
  }

  func sendScreen(buffer: ByteBuffer) {
    queueLock.sync {
      bufferQueue.append(buffer)
    }
  }

  func flush(context: ChannelHandlerContext) {
    var buffersToFlush: [ByteBuffer] = []

    queueLock.sync {
      buffersToFlush = bufferQueue
      bufferQueue.removeAll()
    }

    if !context.channel.isActive {
      NSLog("Channel inactive")
    }

    for buffer in buffersToFlush {
      let responseFrame = WebSocketFrame(opcode: .text, data: buffer)
      context.writeAndFlush(self.wrapOutboundOut(responseFrame), promise: nil)
    }
  }
}

let websocketResponse = "<!DOCTYPE html><html></html>"
private final class HTTPHandler: ChannelInboundHandler, RemovableChannelHandler {
  typealias InboundIn = HTTPServerRequestPart
  typealias OutboundOut = HTTPServerResponsePart

  private var responseBody: ByteBuffer!

  func handlerAdded(context: ChannelHandlerContext) {
    self.responseBody = context.channel.allocator.buffer(string: websocketResponse)
  }

  func handlerRemoved(context: ChannelHandlerContext) {
    self.responseBody = nil
  }

  func channelRead(context: ChannelHandlerContext, data: NIOAny) {
    let reqPart = self.unwrapInboundIn(data)

    // We're not interested in request bodies here: we're just serving up GET responses
    // to get the client to initiate a websocket request.
    guard case .head(let head) = reqPart else {
      return
    }

    // GETs only.
    guard case .GET = head.method else {
      self.respond405(context: context)
      return
    }

    var headers = HTTPHeaders()
    headers.add(name: "Content-Type", value: "application/octet-stream")
    headers.add(name: "Content-Length", value: String(self.responseBody.readableBytes))
    headers.add(name: "Connection", value: "close")
    let responseHead = HTTPResponseHead(
      version: .init(major: 1, minor: 1),
      status: .ok,
      headers: headers)
    context.write(self.wrapOutboundOut(.head(responseHead)), promise: nil)
    context.write(self.wrapOutboundOut(.body(.byteBuffer(self.responseBody))), promise: nil)
    context.write(self.wrapOutboundOut(.end(nil))).whenComplete { (_: Result<Void, Error>) in
      context.close(promise: nil)
    }
    context.flush()
  }

  private func respond405(context: ChannelHandlerContext) {
    var headers = HTTPHeaders()
    headers.add(name: "Connection", value: "close")
    headers.add(name: "Content-Length", value: "0")
    let head = HTTPResponseHead(
      version: .http1_1,
      status: .methodNotAllowed,
      headers: headers)
    context.write(self.wrapOutboundOut(.head(head)), promise: nil)
    context.write(self.wrapOutboundOut(.end(nil))).whenComplete { (_: Result<Void, Error>) in
      context.close(promise: nil)
    }
    context.flush()
  }
}

class ScreenServer {
  let group = MultiThreadedEventLoopGroup(numberOfThreads: System.coreCount)
  var serverChannel: Channel?
  let handler: WebSocketHandler = WebSocketHandler()

  func start() throws {
    Task {
      do {
        let upgrader = NIOWebSocketServerUpgrader(
          shouldUpgrade: { (channel, _) in
            return channel.eventLoop.makeSucceededFuture(HTTPHeaders())
          },
          upgradePipelineHandler: { (channel, req) in
            channel.pipeline.addHandler(self.handler)
          }
        )
        let serverBootstrap = ServerBootstrap(group: group)
          .serverChannelOption(ChannelOptions.backlog, value: 256)
          .serverChannelOption(ChannelOptions.socket(SocketOptionLevel(SOL_SOCKET), SO_REUSEADDR), value: 1)

          .childChannelInitializer { channel in
            let httpHandler = HTTPHandler()
            let config: NIOHTTPServerUpgradeConfiguration = (
              upgraders: [upgrader],
              completionHandler: { _ in
                channel.pipeline.removeHandler(httpHandler, promise: nil)
              }
            )
            return channel.pipeline.configureHTTPServerPipeline(withServerUpgrade: config).flatMap {
              channel.pipeline.addHandler(httpHandler)
            }

          }
          .childChannelOption(ChannelOptions.socket(IPPROTO_TCP, TCP_NODELAY), value: 1)
          .childChannelOption(ChannelOptions.socket(SocketOptionLevel(SOL_SOCKET), SO_REUSEADDR), value: 1)

        serverChannel = try serverBootstrap.bind(host: "0.0.0.0", port: 50001).wait()
        defer {
          do {
            try self.stop()
          } catch {
            NSLog("ScreenServer.start Failed to stop server: \(error)")
          }
        }

        NSLog("ScreenServer.start WebSocket server started on port 50001")
        try serverChannel?.closeFuture.wait()
      } catch {
        NSLog("ScreenServer.start Failed to start server: \(error)")
      }
    }
  }

  func sendScreen(buffer: ByteBuffer) {
    self.handler.sendScreen(buffer: buffer)
  }

  private func stop() throws {
    try serverChannel?.close().wait()
    try group.syncShutdownGracefully()
    NSLog("ScreenServer.stop WebSocket server stopped")
  }
}
