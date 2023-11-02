import Combine

actor ScrollControlPlayer: IControlPlayer {
  typealias Broker = ScrollControlBroker

  enum Error: Swift.Error {

  }

  private var broker: Broker? = nil
  private let period: TimeInterval = 1.0 / 30
  private var timer: Cancellable? = nil


  func open(with param: ControlOpenParam, broker: Broker) throws {
    self.broker = broker
    startTimer()
  }

  func close() throws {
    timer?.cancel()
  }

  private func startTimer() {
  }
}
