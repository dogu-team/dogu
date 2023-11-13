import Combine

actor SetClipboardPlayer: IControlPlayer {
  typealias Broker = SetClipboardBroker

  func open(with param: ControlOpenParam, broker: Broker) throws {
  }

  func close() throws {
  }
}
