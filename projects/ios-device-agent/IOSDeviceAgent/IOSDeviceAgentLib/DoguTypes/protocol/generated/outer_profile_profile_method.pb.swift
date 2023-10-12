// DO NOT EDIT.
// swift-format-ignore-file
//
// Generated by the Swift generator plugin for the protocol buffer compiler.
// Source: outer/profile/profile_method.proto
//
// For information on using the generated types, please see the documentation:
//   https://github.com/apple/swift-protobuf/

import Foundation
import SwiftProtobuf

// If the compiler emits an error on this type, it is because this file
// was generated by a version of the `protoc` Swift plug-in that is
// incompatible with the version of SwiftProtobuf to which you are linking.
// Please ensure that you are building against the same version of the API
// that was used to generate this file.
fileprivate struct _GeneratedWithProtocGenSwiftVersion: SwiftProtobuf.ProtobufAPIVersionCheck {
  struct _2: SwiftProtobuf.ProtobufAPIVersion_2 {}
  typealias Version = _2
}

public enum Outer_Profile_ProfileMethodKind: SwiftProtobuf.Enum {
  public typealias RawValue = Int
  case unspecified // = 0
  case desktopCpu // = 1
  case desktopCpufreq // = 10
  case desktopGpu // = 20
  case desktopMem // = 30
  case desktopFs // = 40
  case desktopNet // = 50
  case desktopDisplay // = 60
  case androidCpuShelltop // = 1001
  case androidCpufreqCat // = 1010
  case androidGpuNotyet // = 1020
  case androidMemActivitymanager // = 1030
  case androidMemProcmeminfo // = 1031
  case androidFsProcdiskstats // = 1040
  case androidNetTrafficstats // = 1050
  case androidDisplay // = 1060
  case androidProcessShelltop // = 1070
  case androidBlockDeveloperOptions // = 1080
  case iosCpuLoadInfo // = 2001
  case iosMemVmStatistics // = 2030
  case iosDisplay // = 2060
  case UNRECOGNIZED(Int)

  public init() {
    self = .unspecified
  }

  public init?(rawValue: Int) {
    switch rawValue {
    case 0: self = .unspecified
    case 1: self = .desktopCpu
    case 10: self = .desktopCpufreq
    case 20: self = .desktopGpu
    case 30: self = .desktopMem
    case 40: self = .desktopFs
    case 50: self = .desktopNet
    case 60: self = .desktopDisplay
    case 1001: self = .androidCpuShelltop
    case 1010: self = .androidCpufreqCat
    case 1020: self = .androidGpuNotyet
    case 1030: self = .androidMemActivitymanager
    case 1031: self = .androidMemProcmeminfo
    case 1040: self = .androidFsProcdiskstats
    case 1050: self = .androidNetTrafficstats
    case 1060: self = .androidDisplay
    case 1070: self = .androidProcessShelltop
    case 1080: self = .androidBlockDeveloperOptions
    case 2001: self = .iosCpuLoadInfo
    case 2030: self = .iosMemVmStatistics
    case 2060: self = .iosDisplay
    default: self = .UNRECOGNIZED(rawValue)
    }
  }

  public var rawValue: Int {
    switch self {
    case .unspecified: return 0
    case .desktopCpu: return 1
    case .desktopCpufreq: return 10
    case .desktopGpu: return 20
    case .desktopMem: return 30
    case .desktopFs: return 40
    case .desktopNet: return 50
    case .desktopDisplay: return 60
    case .androidCpuShelltop: return 1001
    case .androidCpufreqCat: return 1010
    case .androidGpuNotyet: return 1020
    case .androidMemActivitymanager: return 1030
    case .androidMemProcmeminfo: return 1031
    case .androidFsProcdiskstats: return 1040
    case .androidNetTrafficstats: return 1050
    case .androidDisplay: return 1060
    case .androidProcessShelltop: return 1070
    case .androidBlockDeveloperOptions: return 1080
    case .iosCpuLoadInfo: return 2001
    case .iosMemVmStatistics: return 2030
    case .iosDisplay: return 2060
    case .UNRECOGNIZED(let i): return i
    }
  }

}

#if swift(>=4.2)

extension Outer_Profile_ProfileMethodKind: CaseIterable {
  // The compiler won't synthesize support with the UNRECOGNIZED case.
  public static var allCases: [Outer_Profile_ProfileMethodKind] = [
    .unspecified,
    .desktopCpu,
    .desktopCpufreq,
    .desktopGpu,
    .desktopMem,
    .desktopFs,
    .desktopNet,
    .desktopDisplay,
    .androidCpuShelltop,
    .androidCpufreqCat,
    .androidGpuNotyet,
    .androidMemActivitymanager,
    .androidMemProcmeminfo,
    .androidFsProcdiskstats,
    .androidNetTrafficstats,
    .androidDisplay,
    .androidProcessShelltop,
    .androidBlockDeveloperOptions,
    .iosCpuLoadInfo,
    .iosMemVmStatistics,
    .iosDisplay,
  ]
}

#endif  // swift(>=4.2)

public struct Outer_Profile_ProfileMethod {
  // SwiftProtobuf.Message conformance is added in an extension below. See the
  // `Message` and `Message+*Additions` files in the SwiftProtobuf library for
  // methods supported on all messages.

  public var kind: Outer_Profile_ProfileMethodKind = .unspecified

  public var name: String = String()

  public var unknownFields = SwiftProtobuf.UnknownStorage()

  public init() {}
}

public struct Outer_Profile_ProfileMethodWithConfig {
  // SwiftProtobuf.Message conformance is added in an extension below. See the
  // `Message` and `Message+*Additions` files in the SwiftProtobuf library for
  // methods supported on all messages.

  public var profileMethod: Outer_Profile_ProfileMethod {
    get {return _profileMethod ?? Outer_Profile_ProfileMethod()}
    set {_profileMethod = newValue}
  }
  /// Returns true if `profileMethod` has been explicitly set.
  public var hasProfileMethod: Bool {return self._profileMethod != nil}
  /// Clears the value of `profileMethod`. Subsequent reads from it will return its default value.
  public mutating func clearProfileMethod() {self._profileMethod = nil}

  public var periodSec: UInt32 = 0

  public var unknownFields = SwiftProtobuf.UnknownStorage()

  public init() {}

  fileprivate var _profileMethod: Outer_Profile_ProfileMethod? = nil
}

public struct Outer_Profile_DeviceConfig {
  // SwiftProtobuf.Message conformance is added in an extension below. See the
  // `Message` and `Message+*Additions` files in the SwiftProtobuf library for
  // methods supported on all messages.

  public var profileMethods: [Outer_Profile_ProfileMethodWithConfig] = []

  public var unknownFields = SwiftProtobuf.UnknownStorage()

  public init() {}
}

#if swift(>=5.5) && canImport(_Concurrency)
extension Outer_Profile_ProfileMethodKind: @unchecked Sendable {}
extension Outer_Profile_ProfileMethod: @unchecked Sendable {}
extension Outer_Profile_ProfileMethodWithConfig: @unchecked Sendable {}
extension Outer_Profile_DeviceConfig: @unchecked Sendable {}
#endif  // swift(>=5.5) && canImport(_Concurrency)

// MARK: - Code below here is support for the SwiftProtobuf runtime.

fileprivate let _protobuf_package = "outer.profile"

extension Outer_Profile_ProfileMethodKind: SwiftProtobuf._ProtoNameProviding {
  public static let _protobuf_nameMap: SwiftProtobuf._NameMap = [
    0: .same(proto: "PROFILE_METHOD_KIND_UNSPECIFIED"),
    1: .same(proto: "PROFILE_METHOD_KIND_DESKTOP_CPU"),
    10: .same(proto: "PROFILE_METHOD_KIND_DESKTOP_CPUFREQ"),
    20: .same(proto: "PROFILE_METHOD_KIND_DESKTOP_GPU"),
    30: .same(proto: "PROFILE_METHOD_KIND_DESKTOP_MEM"),
    40: .same(proto: "PROFILE_METHOD_KIND_DESKTOP_FS"),
    50: .same(proto: "PROFILE_METHOD_KIND_DESKTOP_NET"),
    60: .same(proto: "PROFILE_METHOD_KIND_DESKTOP_DISPLAY"),
    1001: .same(proto: "PROFILE_METHOD_KIND_ANDROID_CPU_SHELLTOP"),
    1010: .same(proto: "PROFILE_METHOD_KIND_ANDROID_CPUFREQ_CAT"),
    1020: .same(proto: "PROFILE_METHOD_KIND_ANDROID_GPU_NOTYET"),
    1030: .same(proto: "PROFILE_METHOD_KIND_ANDROID_MEM_ACTIVITYMANAGER"),
    1031: .same(proto: "PROFILE_METHOD_KIND_ANDROID_MEM_PROCMEMINFO"),
    1040: .same(proto: "PROFILE_METHOD_KIND_ANDROID_FS_PROCDISKSTATS"),
    1050: .same(proto: "PROFILE_METHOD_KIND_ANDROID_NET_TRAFFICSTATS"),
    1060: .same(proto: "PROFILE_METHOD_KIND_ANDROID_DISPLAY"),
    1070: .same(proto: "PROFILE_METHOD_KIND_ANDROID_PROCESS_SHELLTOP"),
    1080: .same(proto: "PROFILE_METHOD_KIND_ANDROID_BLOCK_DEVELOPER_OPTIONS"),
    2001: .same(proto: "PROFILE_METHOD_KIND_IOS_CPU_LOAD_INFO"),
    2030: .same(proto: "PROFILE_METHOD_KIND_IOS_MEM_VM_STATISTICS"),
    2060: .same(proto: "PROFILE_METHOD_KIND_IOS_DISPLAY"),
  ]
}

extension Outer_Profile_ProfileMethod: SwiftProtobuf.Message, SwiftProtobuf._MessageImplementationBase, SwiftProtobuf._ProtoNameProviding {
  public static let protoMessageName: String = _protobuf_package + ".ProfileMethod"
  public static let _protobuf_nameMap: SwiftProtobuf._NameMap = [
    1: .same(proto: "kind"),
    2: .same(proto: "name"),
  ]

  public mutating func decodeMessage<D: SwiftProtobuf.Decoder>(decoder: inout D) throws {
    while let fieldNumber = try decoder.nextFieldNumber() {
      // The use of inline closures is to circumvent an issue where the compiler
      // allocates stack space for every case branch when no optimizations are
      // enabled. https://github.com/apple/swift-protobuf/issues/1034
      switch fieldNumber {
      case 1: try { try decoder.decodeSingularEnumField(value: &self.kind) }()
      case 2: try { try decoder.decodeSingularStringField(value: &self.name) }()
      default: break
      }
    }
  }

  public func traverse<V: SwiftProtobuf.Visitor>(visitor: inout V) throws {
    if self.kind != .unspecified {
      try visitor.visitSingularEnumField(value: self.kind, fieldNumber: 1)
    }
    if !self.name.isEmpty {
      try visitor.visitSingularStringField(value: self.name, fieldNumber: 2)
    }
    try unknownFields.traverse(visitor: &visitor)
  }

  public static func ==(lhs: Outer_Profile_ProfileMethod, rhs: Outer_Profile_ProfileMethod) -> Bool {
    if lhs.kind != rhs.kind {return false}
    if lhs.name != rhs.name {return false}
    if lhs.unknownFields != rhs.unknownFields {return false}
    return true
  }
}

extension Outer_Profile_ProfileMethodWithConfig: SwiftProtobuf.Message, SwiftProtobuf._MessageImplementationBase, SwiftProtobuf._ProtoNameProviding {
  public static let protoMessageName: String = _protobuf_package + ".ProfileMethodWithConfig"
  public static let _protobuf_nameMap: SwiftProtobuf._NameMap = [
    1: .standard(proto: "profile_method"),
    2: .standard(proto: "period_sec"),
  ]

  public mutating func decodeMessage<D: SwiftProtobuf.Decoder>(decoder: inout D) throws {
    while let fieldNumber = try decoder.nextFieldNumber() {
      // The use of inline closures is to circumvent an issue where the compiler
      // allocates stack space for every case branch when no optimizations are
      // enabled. https://github.com/apple/swift-protobuf/issues/1034
      switch fieldNumber {
      case 1: try { try decoder.decodeSingularMessageField(value: &self._profileMethod) }()
      case 2: try { try decoder.decodeSingularFixed32Field(value: &self.periodSec) }()
      default: break
      }
    }
  }

  public func traverse<V: SwiftProtobuf.Visitor>(visitor: inout V) throws {
    // The use of inline closures is to circumvent an issue where the compiler
    // allocates stack space for every if/case branch local when no optimizations
    // are enabled. https://github.com/apple/swift-protobuf/issues/1034 and
    // https://github.com/apple/swift-protobuf/issues/1182
    try { if let v = self._profileMethod {
      try visitor.visitSingularMessageField(value: v, fieldNumber: 1)
    } }()
    if self.periodSec != 0 {
      try visitor.visitSingularFixed32Field(value: self.periodSec, fieldNumber: 2)
    }
    try unknownFields.traverse(visitor: &visitor)
  }

  public static func ==(lhs: Outer_Profile_ProfileMethodWithConfig, rhs: Outer_Profile_ProfileMethodWithConfig) -> Bool {
    if lhs._profileMethod != rhs._profileMethod {return false}
    if lhs.periodSec != rhs.periodSec {return false}
    if lhs.unknownFields != rhs.unknownFields {return false}
    return true
  }
}

extension Outer_Profile_DeviceConfig: SwiftProtobuf.Message, SwiftProtobuf._MessageImplementationBase, SwiftProtobuf._ProtoNameProviding {
  public static let protoMessageName: String = _protobuf_package + ".DeviceConfig"
  public static let _protobuf_nameMap: SwiftProtobuf._NameMap = [
    1: .standard(proto: "profile_methods"),
  ]

  public mutating func decodeMessage<D: SwiftProtobuf.Decoder>(decoder: inout D) throws {
    while let fieldNumber = try decoder.nextFieldNumber() {
      // The use of inline closures is to circumvent an issue where the compiler
      // allocates stack space for every case branch when no optimizations are
      // enabled. https://github.com/apple/swift-protobuf/issues/1034
      switch fieldNumber {
      case 1: try { try decoder.decodeRepeatedMessageField(value: &self.profileMethods) }()
      default: break
      }
    }
  }

  public func traverse<V: SwiftProtobuf.Visitor>(visitor: inout V) throws {
    if !self.profileMethods.isEmpty {
      try visitor.visitRepeatedMessageField(value: self.profileMethods, fieldNumber: 1)
    }
    try unknownFields.traverse(visitor: &visitor)
  }

  public static func ==(lhs: Outer_Profile_DeviceConfig, rhs: Outer_Profile_DeviceConfig) -> Bool {
    if lhs.profileMethods != rhs.profileMethods {return false}
    if lhs.unknownFields != rhs.unknownFields {return false}
    return true
  }
}
