enum KeyControlError: Error {
}

enum KeyControlPatternKey: String {
  case down = "d"
}

enum KeyControlPatternGroup: String {
  case down = "down"
}

class KeyControlFactory: IControlFactory {
  typealias Control = PatternControl

  required init() {}

  func create(from control: Inner_Types_DeviceControl, result: ControlResult) throws -> Control {
    switch control.action {
    case .iosActionDownUnspecified:
      return Control(patternKey: KeyControlPatternKey.down.rawValue, control: control, result: result)
    default:
      throw ControlError.unknownDeviceControlAction(control)
    }
  }
}

struct KeyControlPlayControl {
  public let code: Inner_Types_DeviceControlKeycode
  public var result: ControlResult
}

struct KeyControlPlayKey {
  public let str: String
  public var result: ControlResult
}

enum KeyControlPlay {
  case none
  case control(KeyControlPlayControl)
  case key([KeyControlPlayKey])
}
