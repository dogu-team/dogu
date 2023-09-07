import Foundation

/// Async Multi-Producer Single-Consumer Queue
open class AsyncMPSCQueue<Value: Sendable> {
  public typealias Queue = AsyncStream<Value>
  public typealias Producer = AsyncStream<Value>.Continuation
  public typealias Consumer = (Value) async -> Void

  private let name: String
  private let queue: Queue
  private let producer: Producer
  private var consumer: Consumer? = nil
  private var consumerTask: Task<Void, Never>? = nil
  private let barrier: DispatchQueue

  public init(name: String) {
    self.name = name
    barrier = DispatchQueue(label: name, attributes: .concurrent)

    var producer: Producer? = nil
    queue = Queue { continuation in
      producer = continuation
    }

    guard let producer else {
      fatalError("\(name) producer is nil")
    }
    self.producer = producer

    consumerTask = Task {
      for await data in queue {
        guard let consumer else {
          fatalError("\(name) consumer is nil")
        }
        await consumer(data)
      }
    }
    guard consumerTask != nil else {
      fatalError("\(name) consumerTask is nil")
    }
  }

  public convenience init(name: String, consumer: @escaping Consumer) {
    self.init(name: name)
    self.consumer = consumer
  }

  deinit {
    self.producer.finish()
    self.consumerTask?.cancel()
  }

  public func set(consumer: @escaping Consumer) {
    self.consumer = consumer
  }

  public func enqueue(_ value: Value) {
    guard consumer != nil else {
      fatalError("\(name) consumer is nil")
    }

    barrier.async(flags: .barrier) {
      self.producer.yield(value)
    }
  }
}
