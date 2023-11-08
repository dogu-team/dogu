import Foundation

typealias Seq = UInt32

enum ControlError: Error {
  case unknownDeviceControlAction(Inner_Types_DeviceControl)
  case outOfRange(Int)
  case downNotFound
  case upNotFound
}

protocol IControlFactory {
  associatedtype Control
  init()
  func create(from control: Inner_Types_DeviceControl, result: ControlResult) throws -> Control
}

protocol IControlBroker {
  associatedtype Control
  init()
  func open(with param: ControlOpenParam) async throws
  func close() async throws
  func push(with control: Control) async
}

protocol IControlPlayer {
  associatedtype Broker
  init()
  func open(with param: ControlOpenParam, broker: Broker) async throws
  func close() async throws
}

protocol IControlProcessor {
  init()
  func open(with param: ControlOpenParam) async throws
  func close() async throws
  func push(with deviceControl: Inner_Types_DeviceControl, result: ControlResult) async throws
}

struct ControlOpenParam {
  var screenSize: CGSize
  var webDriverClient: WebDriverClient
  var actionPerformer: ActionPerformer
  var inputBlocker: InputBlocker
}

struct PatternControl {
  var patternKey: String
  var control: Inner_Types_DeviceControl
  var result: ControlResult

  init(patternKey: String, control: Inner_Types_DeviceControl, result: ControlResult) {
    self.patternKey = patternKey
    self.control = control
    self.result = result
  }

  func discardNotify() {
    var controlResult = Inner_Types_CfGdcDaControlResult()
    controlResult.error = Outer_ErrorResult()
    controlResult.error.code = Outer_Code.inputDiscarded
    controlResult.error.message = "input discarded"
    result.set(result: controlResult)
  }

  func error(code: Outer_Code, message: String) {
    var controlResult = Inner_Types_CfGdcDaControlResult()
    controlResult.error = Outer_ErrorResult()
    controlResult.error.code = code
    controlResult.error.message = message
    result.set(result: controlResult)
  }
}

struct DownUp {
  var down: PatternControl
  var up: PatternControl
}
