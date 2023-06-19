import DoguTypes

actor ControlProcessor<Factory, Broker, Player>: IControlProcessor
  where
  Factory: IControlFactory,
  Broker: IControlBroker,
  Player: IControlPlayer,
  Player.Broker == Broker,
  Factory.Control  == Broker.Control {

  private var broker: Broker? = nil
  private var player: Player? = nil
  private var factory: Factory? = nil

  func open(with param: ControlOpenParam) async throws {
    broker = Broker()
    try await broker!.open(with: param)
    player = Player()
    try await player!.open(with: param, broker: broker!)
    factory = Factory()
  }

  func close() async throws {
    try await player?.close()
    try await broker?.close()
  }

  func push( with source: Inner_Types_DeviceControl, result: ControlResult) async throws {
    let control = try factory!.create(from: source, result: result)
    await broker!.push(with: control)
  }
}
