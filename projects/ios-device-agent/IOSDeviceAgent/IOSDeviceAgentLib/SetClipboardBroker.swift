actor SetClipboardBroker: IControlBroker {
  typealias Control = PatternControl


  func open(with param: ControlOpenParam) throws {}

  func close() throws {}

  func push(with control: Control) {
  }
}
