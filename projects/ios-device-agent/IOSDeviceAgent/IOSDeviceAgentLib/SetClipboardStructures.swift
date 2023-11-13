enum SetClipboardError: Error {
}

enum SetClipboardPatternKey: String {
  case none = "n"
}

class SetClipboardFactory: IControlFactory {
  typealias Control = PatternControl

  required init() {}

  func create(from control: Inner_Types_DeviceControl, result: ControlResult) throws -> Control {
    switch control.action {
    case .unspecified:
      return Control(patternKey: SetClipboardPatternKey.none.rawValue, control: control, result: result)
    default:
      throw ControlError.unknownDeviceControlAction(control)
    }
  }
}

