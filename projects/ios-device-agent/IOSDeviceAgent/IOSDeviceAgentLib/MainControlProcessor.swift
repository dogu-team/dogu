import DoguTypes

actor MainControlProcessor {
  enum Error: Swift.Error {
    case unknownDeviceControlType(Inner_Types_DeviceControl)
  }

  var processors = [Inner_Types_DeviceControlType: IControlProcessor]()

  func open(param: ControlOpenParam) async throws {
    let touchControlProcessor = ControlProcessor<TouchControlFactory, TouchControlBroker, TouchControlPlayer>()
    try await touchControlProcessor.open(with: param)
    processors[.iosInjectTouchEvent] = touchControlProcessor

    let keyControlProcessor = ControlProcessor<KeyControlFactory, KeyControlBroker, KeyControlPlayer>()
    try await keyControlProcessor.open(with: param)
    processors[.iosInjectKeycode] = keyControlProcessor
  }

  func close() async throws {}

  func push(control: Inner_Types_DeviceControl, result: ControlResult) async throws {
    Log.shared.debug("main \(result.seq) \(control.type) \(control.action) \(control.keycode) \(control.key) \(control.position.x) \(control.position.y) \(control.position.screenWidth) \(control.position.screenHeight) \(control.timeStamp)")
    guard let processor = processors[control.type] else {
      var controlResult = DoguTypes.Inner_Types_CfGdcDaControlResult()
      controlResult.error = DoguTypes.Outer_ErrorResult()
      controlResult.error.code = Outer_Code.inputUnknown
      controlResult.error.message = "input unknown"
      result.set(result: controlResult)
      throw Error.unknownDeviceControlType(control)
    }
    try await processor.push(with: control, result: result)
  }
}
