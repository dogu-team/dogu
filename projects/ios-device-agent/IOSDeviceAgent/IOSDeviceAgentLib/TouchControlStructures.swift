import DoguTypes

enum TouchControlPatternKey: String {
  case down = "d"
  case move = "m"
  case up = "u"
}

enum TouchControlPatternGroup: String {
  case down = "down"
  case up = "up"
}

class TouchControlFactory: IControlFactory {
  typealias Control = PatternControl

  required init() {}

  func create(from control: Inner_Types_DeviceControl, result: ControlResult) throws -> Control {
    switch control.action {
    case .iosActionDownUnspecified:
      return Control(patternKey: TouchControlPatternKey.down.rawValue, control: control, result: result)
    case .iosActionMove:
      return Control(patternKey: TouchControlPatternKey.move.rawValue, control: control, result: result)
    case .iosActionUp:
      return Control(patternKey: TouchControlPatternKey.up.rawValue, control: control, result: result)
    default:
      throw ControlError.unknownDeviceControlAction(control)
    }
  }
}
