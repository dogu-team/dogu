enum ScrollControlError: Error {
}

enum ScrollControlPatternKey: String {
  case none = "n"
}

class ScrollControlFactory: IControlFactory {
  typealias Control = PatternControl

  required init() {}

  func create(from control: Inner_Types_DeviceControl, result: ControlResult) throws -> Control {
    switch control.action {
    case .iosActionScroll:
      return Control(patternKey: ScrollControlPatternKey.none.rawValue, control: control, result: result)
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
  public let vScroll: Int32
  public var result: ControlResult
}
