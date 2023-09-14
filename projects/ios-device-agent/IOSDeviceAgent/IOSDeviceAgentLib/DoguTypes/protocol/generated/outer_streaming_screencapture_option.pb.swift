// DO NOT EDIT.
// swift-format-ignore-file
//
// Generated by the Swift generator plugin for the protocol buffer compiler.
// Source: outer/streaming/screencapture_option.proto
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

public struct Outer_Streaming_ScreenCaptureOption {
  // SwiftProtobuf.Message conformance is added in an extension below. See the
  // `Message` and `Message+*Additions` files in the SwiftProtobuf library for
  // methods supported on all messages.

  /// (android): available
  /// (ios): ignored
  public var bitRate: UInt64 {
    get {return _bitRate ?? 0}
    set {_bitRate = newValue}
  }
  /// Returns true if `bitRate` has been explicitly set.
  public var hasBitRate: Bool {return self._bitRate != nil}
  /// Clears the value of `bitRate`. Subsequent reads from it will return its default value.
  public mutating func clearBitRate() {self._bitRate = nil}

  /// (android): available
  /// https://developer.android.com/reference/android/media/MediaFormat#KEY_MAX_FPS_TO_ENCODER
  ///
  /// (ios): ignored
  public var maxFps: UInt64 {
    get {return _maxFps ?? 0}
    set {_maxFps = newValue}
  }
  /// Returns true if `maxFps` has been explicitly set.
  public var hasMaxFps: Bool {return self._maxFps != nil}
  /// Clears the value of `maxFps`. Subsequent reads from it will return its default value.
  public mutating func clearMaxFps() {self._maxFps = nil}

  /// (android): available
  /// https://developer.android.com/reference/android/media/MediaFormat#KEY_FRAME_RATE
  ///
  /// (ios): ignored
  public var frameRate: UInt64 {
    get {return _frameRate ?? 0}
    set {_frameRate = newValue}
  }
  /// Returns true if `frameRate` has been explicitly set.
  public var hasFrameRate: Bool {return self._frameRate != nil}
  /// Clears the value of `frameRate`. Subsequent reads from it will return its default value.
  public mutating func clearFrameRate() {self._frameRate = nil}

  /// (android): available
  /// https://developer.android.com/reference/android/media/MediaFormat#KEY_I_FRAME_INTERVAL
  ///
  /// (ios): ignored
  public var frameInterval: UInt64 {
    get {return _frameInterval ?? 0}
    set {_frameInterval = newValue}
  }
  /// Returns true if `frameInterval` has been explicitly set.
  public var hasFrameInterval: Bool {return self._frameInterval != nil}
  /// Clears the value of `frameInterval`. Subsequent reads from it will return its default value.
  public mutating func clearFrameInterval() {self._frameInterval = nil}

  /// (android): available
  /// https://developer.android.com/reference/android/media/MediaFormat#KEY_REPEAT_PREVIOUS_FRAME_AFTER
  ///
  /// (ios): ignored
  public var repeatFrameDelay: UInt64 {
    get {return _repeatFrameDelay ?? 0}
    set {_repeatFrameDelay = newValue}
  }
  /// Returns true if `repeatFrameDelay` has been explicitly set.
  public var hasRepeatFrameDelay: Bool {return self._repeatFrameDelay != nil}
  /// Clears the value of `repeatFrameDelay`. Subsequent reads from it will return its default value.
  public mutating func clearRepeatFrameDelay() {self._repeatFrameDelay = nil}

  /// (android): available
  /// Currently processed as height value among width x height
  /// ex) 1920, 1600, 1280, 1024, 800, 640, 320
  ///
  /// (ios): available
  /// In the case of iOS, the device changes to the available resolution preset
  /// according to the input value. 2160 <= max_resolution        -> 3840x2160
  /// 1080 <= max_resolution < 2160 -> 1920x1080
  ///  720 <= max_resolution < 1080 -> 1280x720
  /// ...                           -> 960x540
  /// ...                           -> 640x480
  /// ...                           -> 352x288
  /// ...                           -> 320x240
  public var maxResolution: UInt32 {
    get {return _maxResolution ?? 0}
    set {_maxResolution = newValue}
  }
  /// Returns true if `maxResolution` has been explicitly set.
  public var hasMaxResolution: Bool {return self._maxResolution != nil}
  /// Clears the value of `maxResolution`. Subsequent reads from it will return its default value.
  public mutating func clearMaxResolution() {self._maxResolution = nil}

  /// Used for desktop platform
  /// If pid paaed. capture pid's window
  public var pid: Int32 {
    get {return _pid ?? 0}
    set {_pid = newValue}
  }
  /// Returns true if `pid` has been explicitly set.
  public var hasPid: Bool {return self._pid != nil}
  /// Clears the value of `pid`. Subsequent reads from it will return its default value.
  public mutating func clearPid() {self._pid = nil}

  public var unknownFields = SwiftProtobuf.UnknownStorage()

  public init() {}

  fileprivate var _bitRate: UInt64? = nil
  fileprivate var _maxFps: UInt64? = nil
  fileprivate var _frameRate: UInt64? = nil
  fileprivate var _frameInterval: UInt64? = nil
  fileprivate var _repeatFrameDelay: UInt64? = nil
  fileprivate var _maxResolution: UInt32? = nil
  fileprivate var _pid: Int32? = nil
}

#if swift(>=5.5) && canImport(_Concurrency)
extension Outer_Streaming_ScreenCaptureOption: @unchecked Sendable {}
#endif  // swift(>=5.5) && canImport(_Concurrency)

// MARK: - Code below here is support for the SwiftProtobuf runtime.

fileprivate let _protobuf_package = "outer.streaming"

extension Outer_Streaming_ScreenCaptureOption: SwiftProtobuf.Message, SwiftProtobuf._MessageImplementationBase, SwiftProtobuf._ProtoNameProviding {
  public static let protoMessageName: String = _protobuf_package + ".ScreenCaptureOption"
  public static let _protobuf_nameMap: SwiftProtobuf._NameMap = [
    1: .standard(proto: "bit_rate"),
    2: .standard(proto: "max_fps"),
    3: .standard(proto: "frame_rate"),
    4: .standard(proto: "frame_interval"),
    5: .standard(proto: "repeat_frame_delay"),
    6: .standard(proto: "max_resolution"),
    7: .same(proto: "pid"),
  ]

  public mutating func decodeMessage<D: SwiftProtobuf.Decoder>(decoder: inout D) throws {
    while let fieldNumber = try decoder.nextFieldNumber() {
      // The use of inline closures is to circumvent an issue where the compiler
      // allocates stack space for every case branch when no optimizations are
      // enabled. https://github.com/apple/swift-protobuf/issues/1034
      switch fieldNumber {
      case 1: try { try decoder.decodeSingularFixed64Field(value: &self._bitRate) }()
      case 2: try { try decoder.decodeSingularFixed64Field(value: &self._maxFps) }()
      case 3: try { try decoder.decodeSingularFixed64Field(value: &self._frameRate) }()
      case 4: try { try decoder.decodeSingularFixed64Field(value: &self._frameInterval) }()
      case 5: try { try decoder.decodeSingularFixed64Field(value: &self._repeatFrameDelay) }()
      case 6: try { try decoder.decodeSingularFixed32Field(value: &self._maxResolution) }()
      case 7: try { try decoder.decodeSingularInt32Field(value: &self._pid) }()
      default: break
      }
    }
  }

  public func traverse<V: SwiftProtobuf.Visitor>(visitor: inout V) throws {
    // The use of inline closures is to circumvent an issue where the compiler
    // allocates stack space for every if/case branch local when no optimizations
    // are enabled. https://github.com/apple/swift-protobuf/issues/1034 and
    // https://github.com/apple/swift-protobuf/issues/1182
    try { if let v = self._bitRate {
      try visitor.visitSingularFixed64Field(value: v, fieldNumber: 1)
    } }()
    try { if let v = self._maxFps {
      try visitor.visitSingularFixed64Field(value: v, fieldNumber: 2)
    } }()
    try { if let v = self._frameRate {
      try visitor.visitSingularFixed64Field(value: v, fieldNumber: 3)
    } }()
    try { if let v = self._frameInterval {
      try visitor.visitSingularFixed64Field(value: v, fieldNumber: 4)
    } }()
    try { if let v = self._repeatFrameDelay {
      try visitor.visitSingularFixed64Field(value: v, fieldNumber: 5)
    } }()
    try { if let v = self._maxResolution {
      try visitor.visitSingularFixed32Field(value: v, fieldNumber: 6)
    } }()
    try { if let v = self._pid {
      try visitor.visitSingularInt32Field(value: v, fieldNumber: 7)
    } }()
    try unknownFields.traverse(visitor: &visitor)
  }

  public static func ==(lhs: Outer_Streaming_ScreenCaptureOption, rhs: Outer_Streaming_ScreenCaptureOption) -> Bool {
    if lhs._bitRate != rhs._bitRate {return false}
    if lhs._maxFps != rhs._maxFps {return false}
    if lhs._frameRate != rhs._frameRate {return false}
    if lhs._frameInterval != rhs._frameInterval {return false}
    if lhs._repeatFrameDelay != rhs._repeatFrameDelay {return false}
    if lhs._maxResolution != rhs._maxResolution {return false}
    if lhs._pid != rhs._pid {return false}
    if lhs.unknownFields != rhs.unknownFields {return false}
    return true
  }
}
