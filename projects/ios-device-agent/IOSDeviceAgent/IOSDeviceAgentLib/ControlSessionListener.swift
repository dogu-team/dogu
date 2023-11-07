import Foundation

actor ControlSessionListener: IControlSessionListener {

  private let controlProcessor: MainControlProcessor
  private let iosdeviceagent: IOSDeviceAgent

  init(controlProcessor: MainControlProcessor, iosdeviceagent: IOSDeviceAgent) {
    self.controlProcessor = controlProcessor
    self.iosdeviceagent = iosdeviceagent
  }

  func open(session: ControlSession) async throws {
    await self.iosdeviceagent.addSession(session: session)
  }

  func close(session: ControlSession) async throws {
    await self.iosdeviceagent.removeSession(session: session)
  }

  func onParam(session: ControlSession, abstractParam: Inner_Params_DcIdaParam) async throws {
    switch abstractParam.value {
    case .dcIdaRunappParam(let param):
      let result = try await self.onRunApp(param: param)
      let resultToSend = Inner_Params_DcIdaResult.with {
        $0.seq = abstractParam.seq
        $0.dcIdaRunappResult = result
      }
      try await session.send(result: resultToSend)
      break
    case .dcIdaGetSystemInfoParam(let param):
      let result = try await self.onGetSystemInfo(param: param)
      let resultToSend = Inner_Params_DcIdaResult.with {
        $0.seq = abstractParam.seq
        $0.dcIdaGetSystemInfoResult = result
      }
      try await session.send(result: resultToSend)
      break
    case .dcIdaIsPortListeningParam(let param):
      let result = try await self.isPortListening(param: param)
      let resultToSend = Inner_Params_DcIdaResult.with {
        $0.seq = abstractParam.seq
        $0.dcIdaIsPortListeningResult = result
      }
      try await session.send(result: resultToSend)
      break
    case .dcIdaQueryProfileParam(let param):
      let result = try await queryProfile(param: param)
      let resultToSend = Inner_Params_DcIdaResult.with {
        $0.seq = abstractParam.seq
        $0.dcIdaQueryProfileResult = result
      }
      try await session.send(result: resultToSend)
      break
    case .dcGdcDaControlParam(let param):
      let controlResult = ControlResult(seq: abstractParam.seq, session: session)
      Task.catchable(
        {
          Log.shared.debug("ControlSessionListener.onParam pushed seq: \(abstractParam.seq), control: \(param.control)")
          try await self.controlProcessor.push(control: param.control, result: controlResult)
        },
        catch: {
          Log.shared.debug("ControlSessionListener.onParam failed to push control: \(param.control), \($0.localizedDescription)")
          var errorControlResult = Inner_Types_CfGdcDaControlResult()
          errorControlResult.error = Outer_ErrorResult()
          errorControlResult.error.code = Outer_Code.inputUnknown
          errorControlResult.error.message = $0.localizedDescription
          controlResult.set(result: errorControlResult)
        })
      break
    case .dcIdaSwitchInputBlockParam(let param):
      GlobalVariable.IsInputBlockAvailable = param.isBlock
      break
    case .dcIdaSubscribeAlertParam(let param):

      break
    default:
      Log.shared.debug("ControlSessionListener.onParam  unknown param: \(abstractParam)")
      break
    }
  }

  func onRunApp(param: Inner_Types_DcIdaRunAppParam) async throws -> Inner_Types_DcIdaRunAppResult {
    let filtered = param.installedAppNames.filter { element in element == param.bundleID }
    guard filtered.count != 0 else {
      return Inner_Types_DcIdaRunAppResult.with {
        $0.error = Outer_ErrorResult.with {
          $0.code = Outer_Code.processExecFailed
          $0.message = "The package name must be in the package list"
        }
      }
    }

    do {
      try await WebDriverAgentLibUtils.runApp(appPath: param.appPath, bundleId: param.bundleID)
      return Inner_Types_DcIdaRunAppResult.with {
        $0.error = Outer_ErrorResult.with {
          $0.code = Outer_Code.successCommonBeginUnspecified
          $0.message = "Succeeded"
        }
      }
    } catch {
      return Inner_Types_DcIdaRunAppResult.with {
        $0.error = Outer_ErrorResult.with {
          $0.code = Outer_Code.processExecFailed
          $0.message = "Failed to execute app. param: \(param) error: \(error)"
        }
      }
    }
  }

  @MainActor
  func onGetSystemInfo(param: Inner_Types_DcIdaGetSystemInfoParam) async throws -> Inner_Types_DcIdaGetSystemInfoResult {
    let screenSize = WebDriverAgentLibUtils.screenSize()
    return Inner_Types_DcIdaGetSystemInfoResult.with {
      $0.screenWidth = UInt32(screenSize.width)
      $0.screenHeight = UInt32(screenSize.height)
    }
  }

  func isPortListening(param: Inner_Types_DcIdaIsPortListeningParam) async throws -> Inner_Types_DcIdaIsPortListeningResult {
    let isOpen = await isTCPPortOpen(host: "127.0.0.1", port: UInt16(param.port))
    return Inner_Types_DcIdaIsPortListeningResult.with {
      $0.isListening = isOpen
    }
  }
}
