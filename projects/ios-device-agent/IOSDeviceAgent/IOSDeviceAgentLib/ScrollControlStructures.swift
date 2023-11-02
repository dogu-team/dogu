enum ScrollControlError: Error {
}

enum ScrollControlPatternKey: String {
  case down = "d"
}

enum ScrollControlPatternGroup: String {
  case down = "down"
}

class ScrollControlFactory: IControlFactory {
  typealias Control = PatternControl

  required init() {}

  func create(from control: Inner_Types_DeviceControl, result: ControlResult) throws -> Control {
    switch control.action {
    case .iosActionScroll:
      return Control(patternKey: ScrollControlPatternKey.down.rawValue, control: control, result: result)
    default:
      throw ControlError.unknownDeviceControlAction(control)
    }
  }
}

struct ScrollControlPlayControl {
  public let code: Inner_Types_DeviceControlKeycode
  public var result: ControlResult
}

struct ScrollControlPlayKey {
  public let str: String
  public var result: ControlResult
}

enum ScrollControlPlay {
  case none
  case control(ScrollControlPlayControl)
  case key([ScrollControlPlayKey])
}
