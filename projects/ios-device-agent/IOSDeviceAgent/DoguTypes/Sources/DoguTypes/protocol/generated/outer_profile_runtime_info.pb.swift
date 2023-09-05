// DO NOT EDIT.
// swift-format-ignore-file
//
// Generated by the Swift generator plugin for the protocol buffer compiler.
// Source: outer/profile/runtime_info.proto
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

public struct Outer_Profile_RuntimeInfoCpu {
  // SwiftProtobuf.Message conformance is added in an extension below. See the
  // `Message` and `Message+*Additions` files in the SwiftProtobuf library for
  // methods supported on all messages.

  public var name: String = String()

  public var currentLoad: UInt64 = 0

  public var currentLoadUser: UInt64 = 0

  public var currentLoadSystem: UInt64 = 0

  public var currentLoadNice: UInt64 = 0

  public var currentLoadIdle: UInt64 = 0

  public var currentLoadIrq: UInt64 = 0

  public var currentLoadCpu: UInt64 = 0

  public var unknownFields = SwiftProtobuf.UnknownStorage()

  public init() {}
}

public struct Outer_Profile_RuntimeInfoCpuFreq {
  // SwiftProtobuf.Message conformance is added in an extension below. See the
  // `Message` and `Message+*Additions` files in the SwiftProtobuf library for
  // methods supported on all messages.

  public var idx: UInt32 = 0

  public var min: UInt64 = 0

  public var cur: UInt64 = 0

  public var max: UInt64 = 0

  public var unknownFields = SwiftProtobuf.UnknownStorage()

  public init() {}
}

public struct Outer_Profile_RuntimeInfoGpu {
  // SwiftProtobuf.Message conformance is added in an extension below. See the
  // `Message` and `Message+*Additions` files in the SwiftProtobuf library for
  // methods supported on all messages.

  public var desc: String = String()

  public var unknownFields = SwiftProtobuf.UnknownStorage()

  public init() {}
}

public struct Outer_Profile_RuntimeInfoMem {
  // SwiftProtobuf.Message conformance is added in an extension below. See the
  // `Message` and `Message+*Additions` files in the SwiftProtobuf library for
  // methods supported on all messages.

  public var name: String = String()

  public var total: UInt64 = 0

  public var free: UInt64 = 0

  public var used: UInt64 = 0

  public var active: UInt64 = 0

  public var available: UInt64 = 0

  public var swaptotal: UInt64 = 0

  public var swapused: UInt64 = 0

  public var swapfree: UInt64 = 0

  public var isLow: Bool = false

  public var unknownFields = SwiftProtobuf.UnknownStorage()

  public init() {}
}

public struct Outer_Profile_RuntimeInfoFs {
  // SwiftProtobuf.Message conformance is added in an extension below. See the
  // `Message` and `Message+*Additions` files in the SwiftProtobuf library for
  // methods supported on all messages.

  public var name: String = String()

  public var type: String = String()

  public var mount: String = String()

  public var size: UInt64 = 0

  public var used: UInt64 = 0

  public var available: UInt64 = 0

  public var use: UInt64 = 0

  public var readsCompleted: UInt64 = 0

  public var timeSpentReadMs: UInt64 = 0

  public var writesCompleted: UInt64 = 0

  public var timeSpentWriteMs: UInt64 = 0

  public var unknownFields = SwiftProtobuf.UnknownStorage()

  public init() {}
}

public struct Outer_Profile_RuntimeInfoNet {
  // SwiftProtobuf.Message conformance is added in an extension below. See the
  // `Message` and `Message+*Additions` files in the SwiftProtobuf library for
  // methods supported on all messages.

  public var name: String = String()

  public var mobileRxbytes: UInt64 = 0

  public var mobileTxbytes: UInt64 = 0

  public var wifiRxbytes: UInt64 = 0

  public var wifiTxbytes: UInt64 = 0

  public var totalRxbytes: UInt64 = 0

  public var totalTxbytes: UInt64 = 0

  public var unknownFields = SwiftProtobuf.UnknownStorage()

  public init() {}
}

public struct Outer_Profile_RuntimeInfoDisplay {
  // SwiftProtobuf.Message conformance is added in an extension below. See the
  // `Message` and `Message+*Additions` files in the SwiftProtobuf library for
  // methods supported on all messages.

  public var name: String = String()

  public var isScreenOn: Bool = false

  public var error: String = String()

  public var unknownFields = SwiftProtobuf.UnknownStorage()

  public init() {}
}

public struct Outer_Profile_RuntimeInfoBattery {
  // SwiftProtobuf.Message conformance is added in an extension below. See the
  // `Message` and `Message+*Additions` files in the SwiftProtobuf library for
  // methods supported on all messages.

  public var name: String = String()

  public var percent: Float = 0

  public var unknownFields = SwiftProtobuf.UnknownStorage()

  public init() {}
}

public struct Outer_Profile_RuntimeInfo {
  // SwiftProtobuf.Message conformance is added in an extension below. See the
  // `Message` and `Message+*Additions` files in the SwiftProtobuf library for
  // methods supported on all messages.

  public var platform: Outer_Platform {
    get {return _platform ?? .unspecified}
    set {_platform = newValue}
  }
  /// Returns true if `platform` has been explicitly set.
  public var hasPlatform: Bool {return self._platform != nil}
  /// Clears the value of `platform`. Subsequent reads from it will return its default value.
  public mutating func clearPlatform() {self._platform = nil}

  public var localTimeStamp: SwiftProtobuf.Google_Protobuf_Timestamp {
    get {return _localTimeStamp ?? SwiftProtobuf.Google_Protobuf_Timestamp()}
    set {_localTimeStamp = newValue}
  }
  /// Returns true if `localTimeStamp` has been explicitly set.
  public var hasLocalTimeStamp: Bool {return self._localTimeStamp != nil}
  /// Clears the value of `localTimeStamp`. Subsequent reads from it will return its default value.
  public mutating func clearLocalTimeStamp() {self._localTimeStamp = nil}

  public var cpues: [Outer_Profile_RuntimeInfoCpu] = []

  public var cpufreqs: [Outer_Profile_RuntimeInfoCpuFreq] = []

  public var gpues: [Outer_Profile_RuntimeInfoGpu] = []

  public var mems: [Outer_Profile_RuntimeInfoMem] = []

  public var fses: [Outer_Profile_RuntimeInfoFs] = []

  public var nets: [Outer_Profile_RuntimeInfoNet] = []

  public var displays: [Outer_Profile_RuntimeInfoDisplay] = []

  public var batteries: [Outer_Profile_RuntimeInfoBattery] = []

  public var processes: [Outer_Profile_RuntimeProcessInfo] = []

  public var unknownFields = SwiftProtobuf.UnknownStorage()

  public init() {}

  fileprivate var _platform: Outer_Platform? = nil
  fileprivate var _localTimeStamp: SwiftProtobuf.Google_Protobuf_Timestamp? = nil
}

#if swift(>=5.5) && canImport(_Concurrency)
extension Outer_Profile_RuntimeInfoCpu: @unchecked Sendable {}
extension Outer_Profile_RuntimeInfoCpuFreq: @unchecked Sendable {}
extension Outer_Profile_RuntimeInfoGpu: @unchecked Sendable {}
extension Outer_Profile_RuntimeInfoMem: @unchecked Sendable {}
extension Outer_Profile_RuntimeInfoFs: @unchecked Sendable {}
extension Outer_Profile_RuntimeInfoNet: @unchecked Sendable {}
extension Outer_Profile_RuntimeInfoDisplay: @unchecked Sendable {}
extension Outer_Profile_RuntimeInfoBattery: @unchecked Sendable {}
extension Outer_Profile_RuntimeInfo: @unchecked Sendable {}
#endif  // swift(>=5.5) && canImport(_Concurrency)

// MARK: - Code below here is support for the SwiftProtobuf runtime.

fileprivate let _protobuf_package = "outer.profile"

extension Outer_Profile_RuntimeInfoCpu: SwiftProtobuf.Message, SwiftProtobuf._MessageImplementationBase, SwiftProtobuf._ProtoNameProviding {
  public static let protoMessageName: String = _protobuf_package + ".RuntimeInfoCpu"
  public static let _protobuf_nameMap: SwiftProtobuf._NameMap = [
    1: .same(proto: "name"),
    2: .standard(proto: "current_load"),
    3: .standard(proto: "current_load_user"),
    4: .standard(proto: "current_load_system"),
    5: .standard(proto: "current_load_nice"),
    6: .standard(proto: "current_load_idle"),
    7: .standard(proto: "current_load_irq"),
    8: .standard(proto: "current_load_cpu"),
  ]

  public mutating func decodeMessage<D: SwiftProtobuf.Decoder>(decoder: inout D) throws {
    while let fieldNumber = try decoder.nextFieldNumber() {
      // The use of inline closures is to circumvent an issue where the compiler
      // allocates stack space for every case branch when no optimizations are
      // enabled. https://github.com/apple/swift-protobuf/issues/1034
      switch fieldNumber {
      case 1: try { try decoder.decodeSingularStringField(value: &self.name) }()
      case 2: try { try decoder.decodeSingularFixed64Field(value: &self.currentLoad) }()
      case 3: try { try decoder.decodeSingularFixed64Field(value: &self.currentLoadUser) }()
      case 4: try { try decoder.decodeSingularFixed64Field(value: &self.currentLoadSystem) }()
      case 5: try { try decoder.decodeSingularFixed64Field(value: &self.currentLoadNice) }()
      case 6: try { try decoder.decodeSingularFixed64Field(value: &self.currentLoadIdle) }()
      case 7: try { try decoder.decodeSingularFixed64Field(value: &self.currentLoadIrq) }()
      case 8: try { try decoder.decodeSingularFixed64Field(value: &self.currentLoadCpu) }()
      default: break
      }
    }
  }

  public func traverse<V: SwiftProtobuf.Visitor>(visitor: inout V) throws {
    if !self.name.isEmpty {
      try visitor.visitSingularStringField(value: self.name, fieldNumber: 1)
    }
    if self.currentLoad != 0 {
      try visitor.visitSingularFixed64Field(value: self.currentLoad, fieldNumber: 2)
    }
    if self.currentLoadUser != 0 {
      try visitor.visitSingularFixed64Field(value: self.currentLoadUser, fieldNumber: 3)
    }
    if self.currentLoadSystem != 0 {
      try visitor.visitSingularFixed64Field(value: self.currentLoadSystem, fieldNumber: 4)
    }
    if self.currentLoadNice != 0 {
      try visitor.visitSingularFixed64Field(value: self.currentLoadNice, fieldNumber: 5)
    }
    if self.currentLoadIdle != 0 {
      try visitor.visitSingularFixed64Field(value: self.currentLoadIdle, fieldNumber: 6)
    }
    if self.currentLoadIrq != 0 {
      try visitor.visitSingularFixed64Field(value: self.currentLoadIrq, fieldNumber: 7)
    }
    if self.currentLoadCpu != 0 {
      try visitor.visitSingularFixed64Field(value: self.currentLoadCpu, fieldNumber: 8)
    }
    try unknownFields.traverse(visitor: &visitor)
  }

  public static func ==(lhs: Outer_Profile_RuntimeInfoCpu, rhs: Outer_Profile_RuntimeInfoCpu) -> Bool {
    if lhs.name != rhs.name {return false}
    if lhs.currentLoad != rhs.currentLoad {return false}
    if lhs.currentLoadUser != rhs.currentLoadUser {return false}
    if lhs.currentLoadSystem != rhs.currentLoadSystem {return false}
    if lhs.currentLoadNice != rhs.currentLoadNice {return false}
    if lhs.currentLoadIdle != rhs.currentLoadIdle {return false}
    if lhs.currentLoadIrq != rhs.currentLoadIrq {return false}
    if lhs.currentLoadCpu != rhs.currentLoadCpu {return false}
    if lhs.unknownFields != rhs.unknownFields {return false}
    return true
  }
}

extension Outer_Profile_RuntimeInfoCpuFreq: SwiftProtobuf.Message, SwiftProtobuf._MessageImplementationBase, SwiftProtobuf._ProtoNameProviding {
  public static let protoMessageName: String = _protobuf_package + ".RuntimeInfoCpuFreq"
  public static let _protobuf_nameMap: SwiftProtobuf._NameMap = [
    1: .same(proto: "idx"),
    2: .same(proto: "min"),
    3: .same(proto: "cur"),
    4: .same(proto: "max"),
  ]

  public mutating func decodeMessage<D: SwiftProtobuf.Decoder>(decoder: inout D) throws {
    while let fieldNumber = try decoder.nextFieldNumber() {
      // The use of inline closures is to circumvent an issue where the compiler
      // allocates stack space for every case branch when no optimizations are
      // enabled. https://github.com/apple/swift-protobuf/issues/1034
      switch fieldNumber {
      case 1: try { try decoder.decodeSingularFixed32Field(value: &self.idx) }()
      case 2: try { try decoder.decodeSingularFixed64Field(value: &self.min) }()
      case 3: try { try decoder.decodeSingularFixed64Field(value: &self.cur) }()
      case 4: try { try decoder.decodeSingularFixed64Field(value: &self.max) }()
      default: break
      }
    }
  }

  public func traverse<V: SwiftProtobuf.Visitor>(visitor: inout V) throws {
    if self.idx != 0 {
      try visitor.visitSingularFixed32Field(value: self.idx, fieldNumber: 1)
    }
    if self.min != 0 {
      try visitor.visitSingularFixed64Field(value: self.min, fieldNumber: 2)
    }
    if self.cur != 0 {
      try visitor.visitSingularFixed64Field(value: self.cur, fieldNumber: 3)
    }
    if self.max != 0 {
      try visitor.visitSingularFixed64Field(value: self.max, fieldNumber: 4)
    }
    try unknownFields.traverse(visitor: &visitor)
  }

  public static func ==(lhs: Outer_Profile_RuntimeInfoCpuFreq, rhs: Outer_Profile_RuntimeInfoCpuFreq) -> Bool {
    if lhs.idx != rhs.idx {return false}
    if lhs.min != rhs.min {return false}
    if lhs.cur != rhs.cur {return false}
    if lhs.max != rhs.max {return false}
    if lhs.unknownFields != rhs.unknownFields {return false}
    return true
  }
}

extension Outer_Profile_RuntimeInfoGpu: SwiftProtobuf.Message, SwiftProtobuf._MessageImplementationBase, SwiftProtobuf._ProtoNameProviding {
  public static let protoMessageName: String = _protobuf_package + ".RuntimeInfoGpu"
  public static let _protobuf_nameMap: SwiftProtobuf._NameMap = [
    1: .same(proto: "desc"),
  ]

  public mutating func decodeMessage<D: SwiftProtobuf.Decoder>(decoder: inout D) throws {
    while let fieldNumber = try decoder.nextFieldNumber() {
      // The use of inline closures is to circumvent an issue where the compiler
      // allocates stack space for every case branch when no optimizations are
      // enabled. https://github.com/apple/swift-protobuf/issues/1034
      switch fieldNumber {
      case 1: try { try decoder.decodeSingularStringField(value: &self.desc) }()
      default: break
      }
    }
  }

  public func traverse<V: SwiftProtobuf.Visitor>(visitor: inout V) throws {
    if !self.desc.isEmpty {
      try visitor.visitSingularStringField(value: self.desc, fieldNumber: 1)
    }
    try unknownFields.traverse(visitor: &visitor)
  }

  public static func ==(lhs: Outer_Profile_RuntimeInfoGpu, rhs: Outer_Profile_RuntimeInfoGpu) -> Bool {
    if lhs.desc != rhs.desc {return false}
    if lhs.unknownFields != rhs.unknownFields {return false}
    return true
  }
}

extension Outer_Profile_RuntimeInfoMem: SwiftProtobuf.Message, SwiftProtobuf._MessageImplementationBase, SwiftProtobuf._ProtoNameProviding {
  public static let protoMessageName: String = _protobuf_package + ".RuntimeInfoMem"
  public static let _protobuf_nameMap: SwiftProtobuf._NameMap = [
    1: .same(proto: "name"),
    2: .same(proto: "total"),
    3: .same(proto: "free"),
    4: .same(proto: "used"),
    5: .same(proto: "active"),
    6: .same(proto: "available"),
    7: .same(proto: "swaptotal"),
    8: .same(proto: "swapused"),
    9: .same(proto: "swapfree"),
    10: .standard(proto: "is_low"),
  ]

  public mutating func decodeMessage<D: SwiftProtobuf.Decoder>(decoder: inout D) throws {
    while let fieldNumber = try decoder.nextFieldNumber() {
      // The use of inline closures is to circumvent an issue where the compiler
      // allocates stack space for every case branch when no optimizations are
      // enabled. https://github.com/apple/swift-protobuf/issues/1034
      switch fieldNumber {
      case 1: try { try decoder.decodeSingularStringField(value: &self.name) }()
      case 2: try { try decoder.decodeSingularFixed64Field(value: &self.total) }()
      case 3: try { try decoder.decodeSingularFixed64Field(value: &self.free) }()
      case 4: try { try decoder.decodeSingularFixed64Field(value: &self.used) }()
      case 5: try { try decoder.decodeSingularFixed64Field(value: &self.active) }()
      case 6: try { try decoder.decodeSingularFixed64Field(value: &self.available) }()
      case 7: try { try decoder.decodeSingularFixed64Field(value: &self.swaptotal) }()
      case 8: try { try decoder.decodeSingularFixed64Field(value: &self.swapused) }()
      case 9: try { try decoder.decodeSingularFixed64Field(value: &self.swapfree) }()
      case 10: try { try decoder.decodeSingularBoolField(value: &self.isLow) }()
      default: break
      }
    }
  }

  public func traverse<V: SwiftProtobuf.Visitor>(visitor: inout V) throws {
    if !self.name.isEmpty {
      try visitor.visitSingularStringField(value: self.name, fieldNumber: 1)
    }
    if self.total != 0 {
      try visitor.visitSingularFixed64Field(value: self.total, fieldNumber: 2)
    }
    if self.free != 0 {
      try visitor.visitSingularFixed64Field(value: self.free, fieldNumber: 3)
    }
    if self.used != 0 {
      try visitor.visitSingularFixed64Field(value: self.used, fieldNumber: 4)
    }
    if self.active != 0 {
      try visitor.visitSingularFixed64Field(value: self.active, fieldNumber: 5)
    }
    if self.available != 0 {
      try visitor.visitSingularFixed64Field(value: self.available, fieldNumber: 6)
    }
    if self.swaptotal != 0 {
      try visitor.visitSingularFixed64Field(value: self.swaptotal, fieldNumber: 7)
    }
    if self.swapused != 0 {
      try visitor.visitSingularFixed64Field(value: self.swapused, fieldNumber: 8)
    }
    if self.swapfree != 0 {
      try visitor.visitSingularFixed64Field(value: self.swapfree, fieldNumber: 9)
    }
    if self.isLow != false {
      try visitor.visitSingularBoolField(value: self.isLow, fieldNumber: 10)
    }
    try unknownFields.traverse(visitor: &visitor)
  }

  public static func ==(lhs: Outer_Profile_RuntimeInfoMem, rhs: Outer_Profile_RuntimeInfoMem) -> Bool {
    if lhs.name != rhs.name {return false}
    if lhs.total != rhs.total {return false}
    if lhs.free != rhs.free {return false}
    if lhs.used != rhs.used {return false}
    if lhs.active != rhs.active {return false}
    if lhs.available != rhs.available {return false}
    if lhs.swaptotal != rhs.swaptotal {return false}
    if lhs.swapused != rhs.swapused {return false}
    if lhs.swapfree != rhs.swapfree {return false}
    if lhs.isLow != rhs.isLow {return false}
    if lhs.unknownFields != rhs.unknownFields {return false}
    return true
  }
}

extension Outer_Profile_RuntimeInfoFs: SwiftProtobuf.Message, SwiftProtobuf._MessageImplementationBase, SwiftProtobuf._ProtoNameProviding {
  public static let protoMessageName: String = _protobuf_package + ".RuntimeInfoFs"
  public static let _protobuf_nameMap: SwiftProtobuf._NameMap = [
    1: .same(proto: "name"),
    2: .same(proto: "type"),
    3: .same(proto: "mount"),
    4: .same(proto: "size"),
    5: .same(proto: "used"),
    6: .same(proto: "available"),
    7: .same(proto: "use"),
    8: .standard(proto: "reads_completed"),
    9: .standard(proto: "time_spent_read_ms"),
    10: .standard(proto: "writes_completed"),
    11: .standard(proto: "time_spent_write_ms"),
  ]

  public mutating func decodeMessage<D: SwiftProtobuf.Decoder>(decoder: inout D) throws {
    while let fieldNumber = try decoder.nextFieldNumber() {
      // The use of inline closures is to circumvent an issue where the compiler
      // allocates stack space for every case branch when no optimizations are
      // enabled. https://github.com/apple/swift-protobuf/issues/1034
      switch fieldNumber {
      case 1: try { try decoder.decodeSingularStringField(value: &self.name) }()
      case 2: try { try decoder.decodeSingularStringField(value: &self.type) }()
      case 3: try { try decoder.decodeSingularStringField(value: &self.mount) }()
      case 4: try { try decoder.decodeSingularFixed64Field(value: &self.size) }()
      case 5: try { try decoder.decodeSingularFixed64Field(value: &self.used) }()
      case 6: try { try decoder.decodeSingularFixed64Field(value: &self.available) }()
      case 7: try { try decoder.decodeSingularFixed64Field(value: &self.use) }()
      case 8: try { try decoder.decodeSingularFixed64Field(value: &self.readsCompleted) }()
      case 9: try { try decoder.decodeSingularFixed64Field(value: &self.timeSpentReadMs) }()
      case 10: try { try decoder.decodeSingularFixed64Field(value: &self.writesCompleted) }()
      case 11: try { try decoder.decodeSingularFixed64Field(value: &self.timeSpentWriteMs) }()
      default: break
      }
    }
  }

  public func traverse<V: SwiftProtobuf.Visitor>(visitor: inout V) throws {
    if !self.name.isEmpty {
      try visitor.visitSingularStringField(value: self.name, fieldNumber: 1)
    }
    if !self.type.isEmpty {
      try visitor.visitSingularStringField(value: self.type, fieldNumber: 2)
    }
    if !self.mount.isEmpty {
      try visitor.visitSingularStringField(value: self.mount, fieldNumber: 3)
    }
    if self.size != 0 {
      try visitor.visitSingularFixed64Field(value: self.size, fieldNumber: 4)
    }
    if self.used != 0 {
      try visitor.visitSingularFixed64Field(value: self.used, fieldNumber: 5)
    }
    if self.available != 0 {
      try visitor.visitSingularFixed64Field(value: self.available, fieldNumber: 6)
    }
    if self.use != 0 {
      try visitor.visitSingularFixed64Field(value: self.use, fieldNumber: 7)
    }
    if self.readsCompleted != 0 {
      try visitor.visitSingularFixed64Field(value: self.readsCompleted, fieldNumber: 8)
    }
    if self.timeSpentReadMs != 0 {
      try visitor.visitSingularFixed64Field(value: self.timeSpentReadMs, fieldNumber: 9)
    }
    if self.writesCompleted != 0 {
      try visitor.visitSingularFixed64Field(value: self.writesCompleted, fieldNumber: 10)
    }
    if self.timeSpentWriteMs != 0 {
      try visitor.visitSingularFixed64Field(value: self.timeSpentWriteMs, fieldNumber: 11)
    }
    try unknownFields.traverse(visitor: &visitor)
  }

  public static func ==(lhs: Outer_Profile_RuntimeInfoFs, rhs: Outer_Profile_RuntimeInfoFs) -> Bool {
    if lhs.name != rhs.name {return false}
    if lhs.type != rhs.type {return false}
    if lhs.mount != rhs.mount {return false}
    if lhs.size != rhs.size {return false}
    if lhs.used != rhs.used {return false}
    if lhs.available != rhs.available {return false}
    if lhs.use != rhs.use {return false}
    if lhs.readsCompleted != rhs.readsCompleted {return false}
    if lhs.timeSpentReadMs != rhs.timeSpentReadMs {return false}
    if lhs.writesCompleted != rhs.writesCompleted {return false}
    if lhs.timeSpentWriteMs != rhs.timeSpentWriteMs {return false}
    if lhs.unknownFields != rhs.unknownFields {return false}
    return true
  }
}

extension Outer_Profile_RuntimeInfoNet: SwiftProtobuf.Message, SwiftProtobuf._MessageImplementationBase, SwiftProtobuf._ProtoNameProviding {
  public static let protoMessageName: String = _protobuf_package + ".RuntimeInfoNet"
  public static let _protobuf_nameMap: SwiftProtobuf._NameMap = [
    1: .same(proto: "name"),
    2: .standard(proto: "mobile_rxbytes"),
    3: .standard(proto: "mobile_txbytes"),
    4: .standard(proto: "wifi_rxbytes"),
    5: .standard(proto: "wifi_txbytes"),
    6: .standard(proto: "total_rxbytes"),
    7: .standard(proto: "total_txbytes"),
  ]

  public mutating func decodeMessage<D: SwiftProtobuf.Decoder>(decoder: inout D) throws {
    while let fieldNumber = try decoder.nextFieldNumber() {
      // The use of inline closures is to circumvent an issue where the compiler
      // allocates stack space for every case branch when no optimizations are
      // enabled. https://github.com/apple/swift-protobuf/issues/1034
      switch fieldNumber {
      case 1: try { try decoder.decodeSingularStringField(value: &self.name) }()
      case 2: try { try decoder.decodeSingularFixed64Field(value: &self.mobileRxbytes) }()
      case 3: try { try decoder.decodeSingularFixed64Field(value: &self.mobileTxbytes) }()
      case 4: try { try decoder.decodeSingularFixed64Field(value: &self.wifiRxbytes) }()
      case 5: try { try decoder.decodeSingularFixed64Field(value: &self.wifiTxbytes) }()
      case 6: try { try decoder.decodeSingularFixed64Field(value: &self.totalRxbytes) }()
      case 7: try { try decoder.decodeSingularFixed64Field(value: &self.totalTxbytes) }()
      default: break
      }
    }
  }

  public func traverse<V: SwiftProtobuf.Visitor>(visitor: inout V) throws {
    if !self.name.isEmpty {
      try visitor.visitSingularStringField(value: self.name, fieldNumber: 1)
    }
    if self.mobileRxbytes != 0 {
      try visitor.visitSingularFixed64Field(value: self.mobileRxbytes, fieldNumber: 2)
    }
    if self.mobileTxbytes != 0 {
      try visitor.visitSingularFixed64Field(value: self.mobileTxbytes, fieldNumber: 3)
    }
    if self.wifiRxbytes != 0 {
      try visitor.visitSingularFixed64Field(value: self.wifiRxbytes, fieldNumber: 4)
    }
    if self.wifiTxbytes != 0 {
      try visitor.visitSingularFixed64Field(value: self.wifiTxbytes, fieldNumber: 5)
    }
    if self.totalRxbytes != 0 {
      try visitor.visitSingularFixed64Field(value: self.totalRxbytes, fieldNumber: 6)
    }
    if self.totalTxbytes != 0 {
      try visitor.visitSingularFixed64Field(value: self.totalTxbytes, fieldNumber: 7)
    }
    try unknownFields.traverse(visitor: &visitor)
  }

  public static func ==(lhs: Outer_Profile_RuntimeInfoNet, rhs: Outer_Profile_RuntimeInfoNet) -> Bool {
    if lhs.name != rhs.name {return false}
    if lhs.mobileRxbytes != rhs.mobileRxbytes {return false}
    if lhs.mobileTxbytes != rhs.mobileTxbytes {return false}
    if lhs.wifiRxbytes != rhs.wifiRxbytes {return false}
    if lhs.wifiTxbytes != rhs.wifiTxbytes {return false}
    if lhs.totalRxbytes != rhs.totalRxbytes {return false}
    if lhs.totalTxbytes != rhs.totalTxbytes {return false}
    if lhs.unknownFields != rhs.unknownFields {return false}
    return true
  }
}

extension Outer_Profile_RuntimeInfoDisplay: SwiftProtobuf.Message, SwiftProtobuf._MessageImplementationBase, SwiftProtobuf._ProtoNameProviding {
  public static let protoMessageName: String = _protobuf_package + ".RuntimeInfoDisplay"
  public static let _protobuf_nameMap: SwiftProtobuf._NameMap = [
    1: .same(proto: "name"),
    2: .standard(proto: "is_screen_on"),
    3: .same(proto: "error"),
  ]

  public mutating func decodeMessage<D: SwiftProtobuf.Decoder>(decoder: inout D) throws {
    while let fieldNumber = try decoder.nextFieldNumber() {
      // The use of inline closures is to circumvent an issue where the compiler
      // allocates stack space for every case branch when no optimizations are
      // enabled. https://github.com/apple/swift-protobuf/issues/1034
      switch fieldNumber {
      case 1: try { try decoder.decodeSingularStringField(value: &self.name) }()
      case 2: try { try decoder.decodeSingularBoolField(value: &self.isScreenOn) }()
      case 3: try { try decoder.decodeSingularStringField(value: &self.error) }()
      default: break
      }
    }
  }

  public func traverse<V: SwiftProtobuf.Visitor>(visitor: inout V) throws {
    if !self.name.isEmpty {
      try visitor.visitSingularStringField(value: self.name, fieldNumber: 1)
    }
    if self.isScreenOn != false {
      try visitor.visitSingularBoolField(value: self.isScreenOn, fieldNumber: 2)
    }
    if !self.error.isEmpty {
      try visitor.visitSingularStringField(value: self.error, fieldNumber: 3)
    }
    try unknownFields.traverse(visitor: &visitor)
  }

  public static func ==(lhs: Outer_Profile_RuntimeInfoDisplay, rhs: Outer_Profile_RuntimeInfoDisplay) -> Bool {
    if lhs.name != rhs.name {return false}
    if lhs.isScreenOn != rhs.isScreenOn {return false}
    if lhs.error != rhs.error {return false}
    if lhs.unknownFields != rhs.unknownFields {return false}
    return true
  }
}

extension Outer_Profile_RuntimeInfoBattery: SwiftProtobuf.Message, SwiftProtobuf._MessageImplementationBase, SwiftProtobuf._ProtoNameProviding {
  public static let protoMessageName: String = _protobuf_package + ".RuntimeInfoBattery"
  public static let _protobuf_nameMap: SwiftProtobuf._NameMap = [
    1: .same(proto: "name"),
    2: .same(proto: "percent"),
  ]

  public mutating func decodeMessage<D: SwiftProtobuf.Decoder>(decoder: inout D) throws {
    while let fieldNumber = try decoder.nextFieldNumber() {
      // The use of inline closures is to circumvent an issue where the compiler
      // allocates stack space for every case branch when no optimizations are
      // enabled. https://github.com/apple/swift-protobuf/issues/1034
      switch fieldNumber {
      case 1: try { try decoder.decodeSingularStringField(value: &self.name) }()
      case 2: try { try decoder.decodeSingularFloatField(value: &self.percent) }()
      default: break
      }
    }
  }

  public func traverse<V: SwiftProtobuf.Visitor>(visitor: inout V) throws {
    if !self.name.isEmpty {
      try visitor.visitSingularStringField(value: self.name, fieldNumber: 1)
    }
    if self.percent != 0 {
      try visitor.visitSingularFloatField(value: self.percent, fieldNumber: 2)
    }
    try unknownFields.traverse(visitor: &visitor)
  }

  public static func ==(lhs: Outer_Profile_RuntimeInfoBattery, rhs: Outer_Profile_RuntimeInfoBattery) -> Bool {
    if lhs.name != rhs.name {return false}
    if lhs.percent != rhs.percent {return false}
    if lhs.unknownFields != rhs.unknownFields {return false}
    return true
  }
}

extension Outer_Profile_RuntimeInfo: SwiftProtobuf.Message, SwiftProtobuf._MessageImplementationBase, SwiftProtobuf._ProtoNameProviding {
  public static let protoMessageName: String = _protobuf_package + ".RuntimeInfo"
  public static let _protobuf_nameMap: SwiftProtobuf._NameMap = [
    1: .same(proto: "platform"),
    10: .standard(proto: "local_time_stamp"),
    2: .same(proto: "cpues"),
    3: .same(proto: "cpufreqs"),
    4: .same(proto: "gpues"),
    5: .same(proto: "mems"),
    6: .same(proto: "fses"),
    7: .same(proto: "nets"),
    8: .same(proto: "displays"),
    9: .same(proto: "batteries"),
    11: .same(proto: "processes"),
  ]

  public mutating func decodeMessage<D: SwiftProtobuf.Decoder>(decoder: inout D) throws {
    while let fieldNumber = try decoder.nextFieldNumber() {
      // The use of inline closures is to circumvent an issue where the compiler
      // allocates stack space for every case branch when no optimizations are
      // enabled. https://github.com/apple/swift-protobuf/issues/1034
      switch fieldNumber {
      case 1: try { try decoder.decodeSingularEnumField(value: &self._platform) }()
      case 2: try { try decoder.decodeRepeatedMessageField(value: &self.cpues) }()
      case 3: try { try decoder.decodeRepeatedMessageField(value: &self.cpufreqs) }()
      case 4: try { try decoder.decodeRepeatedMessageField(value: &self.gpues) }()
      case 5: try { try decoder.decodeRepeatedMessageField(value: &self.mems) }()
      case 6: try { try decoder.decodeRepeatedMessageField(value: &self.fses) }()
      case 7: try { try decoder.decodeRepeatedMessageField(value: &self.nets) }()
      case 8: try { try decoder.decodeRepeatedMessageField(value: &self.displays) }()
      case 9: try { try decoder.decodeRepeatedMessageField(value: &self.batteries) }()
      case 10: try { try decoder.decodeSingularMessageField(value: &self._localTimeStamp) }()
      case 11: try { try decoder.decodeRepeatedMessageField(value: &self.processes) }()
      default: break
      }
    }
  }

  public func traverse<V: SwiftProtobuf.Visitor>(visitor: inout V) throws {
    // The use of inline closures is to circumvent an issue where the compiler
    // allocates stack space for every if/case branch local when no optimizations
    // are enabled. https://github.com/apple/swift-protobuf/issues/1034 and
    // https://github.com/apple/swift-protobuf/issues/1182
    try { if let v = self._platform {
      try visitor.visitSingularEnumField(value: v, fieldNumber: 1)
    } }()
    if !self.cpues.isEmpty {
      try visitor.visitRepeatedMessageField(value: self.cpues, fieldNumber: 2)
    }
    if !self.cpufreqs.isEmpty {
      try visitor.visitRepeatedMessageField(value: self.cpufreqs, fieldNumber: 3)
    }
    if !self.gpues.isEmpty {
      try visitor.visitRepeatedMessageField(value: self.gpues, fieldNumber: 4)
    }
    if !self.mems.isEmpty {
      try visitor.visitRepeatedMessageField(value: self.mems, fieldNumber: 5)
    }
    if !self.fses.isEmpty {
      try visitor.visitRepeatedMessageField(value: self.fses, fieldNumber: 6)
    }
    if !self.nets.isEmpty {
      try visitor.visitRepeatedMessageField(value: self.nets, fieldNumber: 7)
    }
    if !self.displays.isEmpty {
      try visitor.visitRepeatedMessageField(value: self.displays, fieldNumber: 8)
    }
    if !self.batteries.isEmpty {
      try visitor.visitRepeatedMessageField(value: self.batteries, fieldNumber: 9)
    }
    try { if let v = self._localTimeStamp {
      try visitor.visitSingularMessageField(value: v, fieldNumber: 10)
    } }()
    if !self.processes.isEmpty {
      try visitor.visitRepeatedMessageField(value: self.processes, fieldNumber: 11)
    }
    try unknownFields.traverse(visitor: &visitor)
  }

  public static func ==(lhs: Outer_Profile_RuntimeInfo, rhs: Outer_Profile_RuntimeInfo) -> Bool {
    if lhs._platform != rhs._platform {return false}
    if lhs._localTimeStamp != rhs._localTimeStamp {return false}
    if lhs.cpues != rhs.cpues {return false}
    if lhs.cpufreqs != rhs.cpufreqs {return false}
    if lhs.gpues != rhs.gpues {return false}
    if lhs.mems != rhs.mems {return false}
    if lhs.fses != rhs.fses {return false}
    if lhs.nets != rhs.nets {return false}
    if lhs.displays != rhs.displays {return false}
    if lhs.batteries != rhs.batteries {return false}
    if lhs.processes != rhs.processes {return false}
    if lhs.unknownFields != rhs.unknownFields {return false}
    return true
  }
}
