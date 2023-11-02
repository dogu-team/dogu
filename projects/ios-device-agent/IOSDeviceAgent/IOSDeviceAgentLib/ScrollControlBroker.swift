actor ScrollControlBroker: IControlBroker {
  typealias Control = PatternControl

  var controls = [Control]()

  func open(with param: ControlOpenParam) throws {}

  func close() throws {}

  func push(with control: Control) {
    controls.append(control)
  }
}
