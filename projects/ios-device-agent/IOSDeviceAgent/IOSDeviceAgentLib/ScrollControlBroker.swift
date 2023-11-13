actor ScrollControlBroker: IControlBroker {
  typealias Control = PatternControl

  var controls = [Control]()

  func open(with param: ControlOpenParam) throws {}

  func close() throws {}

  func push(with control: Control) {
    controls.append(control)
  }

  func pop(after lastPlayTime: UInt64) throws -> Control? {
    discard(before: lastPlayTime)
    guard !controls.isEmpty else {
      return nil
    }
    let control = controls[0]
    controls = Array(controls[1..<controls.count])

    return control
  }

  private func discard(before lastPlayTime: UInt64) {
    guard let playAfterIndex = controls.firstIndex(where: { $0.control.timeStamp > lastPlayTime }) else {
      return
    }
    Array(controls[0..<playAfterIndex]).forEach({ $0.discardNotify() })
    controls = Array(controls[playAfterIndex..<controls.count])
  }
}
