import Foundation
import GRPC
import SwiftProtobuf
import WebDriverAgentLib
import XCTest

actor ServiceProvider: Inner_Grpc_Services_IosDeviceAgentServiceAsyncProvider {

  let controlProcessor: MainControlProcessor

  init(controlProcessor: MainControlProcessor) {
    self.controlProcessor = controlProcessor
  }

  func relay(
    requestStream: GRPC.GRPCAsyncRequestStream<Inner_Params_CfGdcDaParamList>,
    responseStream: GRPC.GRPCAsyncResponseStreamWriter<Inner_Params_CfGdcDaResultList>,
    context: GRPC.GRPCAsyncServerCallContext
  ) async throws {
    do {
      let responser = RelayResponser(responseStream: responseStream)
      for try await request in requestStream {

        for param in request.params {
          let controlResult = ControlResult(seq: param.seq, responser: responser)
          switch param.value {
          case .cfGdcDaControlParam(let param):
            do {
              try await controlProcessor.push(control: param.control, result: controlResult)
              Log.shared.debug("pushed control: \(param.control)")
            } catch {
              Log.shared.debug("failed to push control: \(param.control)")
            }
          default:
            Log.shared.debug("unknown param: \(param)")
            continue
          }
        }
      }
    } catch {
      Log.shared.debug("relay failed. \(error)")
    }
  }

  func checkHealth(
    request: SwiftProtobuf.Google_Protobuf_Empty,
    context: GRPCAsyncServerCallContext
  ) async throws -> SwiftProtobuf.Google_Protobuf_Empty {
    Log.shared.debug("checkHealth")
    return Google_Protobuf_Empty()
  }

  func call(request: Inner_Params_DcIdaParam, context: GRPC.GRPCAsyncServerCallContext) async throws -> Inner_Params_DcIdaResult {
    do {
      return try await self.callInternal(request: request, context: context)
    } catch let error as GRPCStatus {
      throw error
    } catch {
      throw GRPCStatus(code: .internalError, message: "internal error: \(error)")
    }
  }

  func callInternal(request: Inner_Params_DcIdaParam, context: GRPC.GRPCAsyncServerCallContext) async throws -> Inner_Params_DcIdaResult {
    switch request.value {
    case .dcIdaRunappParam(let param):
      let result = try await self.onRunApp(param: param)
      return Inner_Params_DcIdaResult.with {
        $0.dcIdaRunappResult = result
      }
    case .dcIdaGetSystemInfoParam(let param):
      let result = try await self.onGetSystemInfo(param: param)
      return Inner_Params_DcIdaResult.with {
        $0.dcIdaGetSystemInfoResult = result
      }
    case .dcIdaIsPortListeningParam(let param):
      let result = try await self.isPortListening(param: param)
      return Inner_Params_DcIdaResult.with {
        $0.dcIdaIsPortListeningResult = result
      }
    case .dcIdaQueryProfileParam(let param):
      let result = try await queryProfile(param: param)
      return Inner_Params_DcIdaResult.with {
        $0.dcIdaQueryProfileResult = result
      }

    case .none:
      throw GRPCStatus(code: .invalidArgument, message: "unknown param: \(request.value)")

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
    do {
      let screenSize = WebDriverAgentLibUtils.screenSize()
      return Inner_Types_DcIdaGetSystemInfoResult.with {
        $0.screenWidth = UInt32(screenSize.width)
        $0.screenHeight = UInt32(screenSize.height)
      }
    } catch {
      return Inner_Types_DcIdaGetSystemInfoResult.with {
        $0.screenWidth = 0
        $0.screenHeight = 0
      }
    }
  }

  func isPortListening(param: Inner_Types_DcIdaIsPortListeningParam) async throws -> Inner_Types_DcIdaIsPortListeningResult {
    let isOpen = await isTCPPortOpen(host: "127.0.0.1", port: UInt16(param.port))
    return Inner_Types_DcIdaIsPortListeningResult.with {
      $0.isListening = isOpen
    }
  }
}
