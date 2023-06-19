import DoguTypes

actor KeyControlBroker: IControlBroker {
  typealias Control = PatternControl
  typealias PatternKey = KeyControlPatternKey
  typealias PatternGroup = KeyControlPatternGroup

  var controls = [Control]()

  func open(with param: ControlOpenParam) throws {}

  func close() throws {}

  func push(with control: Control) {
    controls.append(control)
  }

  func pop() throws -> KeyControlPlay {
    guard !controls.isEmpty else {
      return .none
    }

    if let controlIndex = controls.firstIndex(where: { Function.isControl(keyCode: $0.control.keycode) }) {
      let control = controls[controlIndex]
      var discardeds: [Control] = []
      if controlIndex + 1 < controls.count {
        Array(controls[0..<controlIndex]).forEach({ $0.discardNotify() })
        controls = Array(controls[controlIndex + 1..<controls.count])
      } else {
        Array(controls[0..<controlIndex]).forEach({ $0.discardNotify() })
        controls = []
      }

      return .control(KeyControlPlayControl(code: control.control.keycode, result: control.result))
    }

    let keys =
      controls
      .map {
        let trasformed = Function.transform(key: $0.control.key)
        if nil == trasformed {
          $0.discardNotify()
          return KeyControlPlayKey(str: String(), result: $0.result)
        }
        return KeyControlPlayKey(str: trasformed!, result: $0.result)
      }
      .filter { (value: KeyControlPlayKey) -> Bool in
        return value.str.count != 0
      }
      .map({ $0 })
    controls = []
    return .key(keys)
  }

  private enum Function {
    static func isControl(keyCode: Inner_Types_DeviceControlKeycode) -> Bool {
      switch keyCode {
      case .home, .volumeUp, .volumeDown:
        return true
      default:
        return false
      }
    }

    // https://www.w3.org/TR/webdriver/#keyboard-actions
    static func transform(key: String) -> String? {
      switch key {
      case "Unidentified":
        return nil
      case "Cancel":
        return nil
      case "Help":
        return nil
      case "Backspace":
        return "\u{0008}"
      case "Tab":
        return "\u{0009}"
      case "Clear":
        return nil
      case "Return":
        return "\u{000A}"
      case "Enter":
        return "\u{000A}"
      case "Shift":
        return nil
      case "Control":
        return nil
      case "Alt":
        return nil
      case "Pause":
        return nil
      case "Escape":
        return "\u{001B}"
      case "Space":
        return "\u{0020}"
      case "PageUp":
        return nil
      case "PageDown":
        return nil
      case "End":
        return nil
      case "Home":
        return nil
      case "ArrowLeft":
        return nil
      case "ArrowUp":
        return nil
      case "ArrowRight":
        return nil
      case "ArrowDown":
        return nil
      case "Insert":
        return nil
      case "Delete":
        return nil
      case "Semicolon":
        return "\u{003B}"
      case "Equal":
        return "\u{003D}"
      case "Numpad0":
        return "\u{0030}"
      case "Numpad1":
        return "\u{0031}"
      case "Numpad2":
        return "\u{0032}"
      case "Numpad3":
        return "\u{0033}"
      case "Numpad4":
        return "\u{0034}"
      case "Numpad5":
        return "\u{0035}"
      case "Numpad6":
        return "\u{0036}"
      case "Numpad7":
        return "\u{0037}"
      case "Numpad8":
        return "\u{0038}"
      case "Numpad9":
        return "\u{0039}"
      case "NumpadMultiply":
        return "\u{002A}"
      case "NumpadAdd":
        return "\u{002B}"
      case "NumpadSeparator":
        return "\u{002C}"
      case "NumpadSubtract":
        return "\u{002D}"
      case "NumpadDecimal":
        return "\u{002E}"
      case "NumpadDivide":
        return "\u{002F}"
      case "F1":
        return nil
      case "F2":
        return nil
      case "F3":
        return nil
      case "F4":
        return nil
      case "F5":
        return nil
      case "F6":
        return nil
      case "F7":
        return nil
      case "F8":
        return nil
      case "F9":
        return nil
      case "F10":
        return nil
      case "F11":
        return nil
      case "F12":
        return nil
      case "Meta":
        return nil
      case "ZenkakuHankaku":
        return nil
      default:
        return key
      }
    }
  }
}
