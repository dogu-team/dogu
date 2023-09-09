//
//  SampleHandler.swift
//  DoguScreen
//
//  Copyright © 2023 Dogu. All rights reserved.
//

import AVFoundation
import Accelerate
import ReplayKit
import VideoToolbox

class SampleHandler: RPBroadcastSampleHandler {

  var compressionSession: VTCompressionSession?
  static var sessionId: UInt32 = 0
  static var screenServer: ScreenServer?

  override func broadcastStarted(withSetupInfo setupInfo: [String: NSObject]?) {
    SampleHandler.screenServer = ScreenServer(port: 35001)
    guard let screenServer = SampleHandler.screenServer else {
      NSLog("SampleHandler screenSaver create failed")
      return
    }
    do {
      try screenServer.start()
    } catch {
      NSLog("SampleHandler. Failed to start server: \(error)")
      finishBroadcastWithError(error)
    }

    super.broadcastStarted(withSetupInfo: setupInfo)
  }

  override func broadcastPaused() {
    // User has requested to pause the broadcast. Samples will stop being delivered.
  }

  override func broadcastResumed() {
    // User has requested to resume the broadcast. Samples delivery will resume.
  }

  override func broadcastFinished() {
    NSLog("broadcastFinished")
    if let screenServer = SampleHandler.screenServer {
      screenServer.stop()
      SampleHandler.screenServer = nil
    }

    self.quitCompression()

    super.broadcastFinished()
  }

  override func processSampleBuffer(_ sampleBuffer: CMSampleBuffer, with sampleBufferType: RPSampleBufferType) {
    if sampleBufferType != RPSampleBufferType.video {
      return
    }
    guard let screenServer = SampleHandler.screenServer else { return }
    let queryRet = screenServer.querySession(sessionId: SampleHandler.sessionId)
    if queryRet.state == ScreenServer.SessionState.none {
      return
    }
    guard let session = queryRet.session else {
      NSLog("SampleHandler.processSampleBuffer. Failed to get session")
      return
    }
    let currentTimeMs = Date().timeIntervalSince1970
    let deltaMs = currentTimeMs - session.lastFrameTimeMs
    let reaminMs = session.frameDurationMs - deltaMs
    if 0.005 < reaminMs {
      return
    }
    session.lastFrameTimeMs = currentTimeMs

    guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
    let orientation = getVideoOrientation(from: sampleBuffer)
    let rotatedPixelBuffer = rotate(sampleBuffer, orientation: orientation) ?? pixelBuffer
    if queryRet.state == ScreenServer.SessionState.new
      || orientation != session.orientation
        || !session.encodeError.isEmpty
    {
      SampleHandler.sessionId = session.sessionId
      session.orientation = orientation
      self.quitCompression()
      self.prepareCompression(imageBuffer: rotatedPixelBuffer, session: session)
      session.frameCount = 0
      session.encodeError = ""
    }

    var properties: [String: Any]?

    if (session.frameCount & 60) == 0 {
      properties = [
        kVTEncodeFrameOptionKey_ForceKeyFrame as String: true
      ]
    }
    session.frameCount += 1

    let sessionId = NSNumber(value: session.sessionId)
    let sessionIdRef = UnsafeMutableRawPointer(Unmanaged.passRetained(sessionId).toOpaque())

    let status = VTCompressionSessionEncodeFrame(
      compressionSession!, imageBuffer: rotatedPixelBuffer, presentationTimeStamp: CMSampleBufferGetPresentationTimeStamp(sampleBuffer),
      duration: CMSampleBufferGetDuration(sampleBuffer), frameProperties: properties as NSDictionary?, sourceFrameRefcon: sessionIdRef, infoFlagsOut: nil)

    if status != noErr {
      let errorDescription = getErrorDescription(status: status)
      session.setEncodeError("SampleHandler.prepareCompression. Failed to encode frame: \(errorDescription)")
      return
    }
  }

  func prepareCompression(imageBuffer: CVImageBuffer, session: Session) {
    if compressionSession != nil {
      return
    }

    let originWidth = CVPixelBufferGetWidth(imageBuffer)
    let originHeight = CVPixelBufferGetHeight(imageBuffer)
    let originShorter = min(originWidth, originHeight)
    let originLonger = max(originWidth, originHeight)

    let shorter = Int32(session.streamingOption.maxResolution)
    var longer = Int32(Double(originLonger) / Double(originShorter) * Double(shorter))
    longer = longer % 2 == 0 ? longer : longer + 1

    var width = shorter
    var height = longer
    if originWidth < originHeight {
      width = shorter
      height = longer
    } else {
      width = longer
      height = shorter
    }

    let pixelBufferAttributes: [NSString: AnyObject] = [
      kCVPixelBufferPixelFormatTypeKey: NSNumber(value: kCVPixelFormatType_32BGRA),
      kCVPixelBufferWidthKey: NSNumber(value: width),
      kCVPixelBufferHeightKey: NSNumber(value: height),
    ]
    NSLog("SampleHandler.prepareCompression. originWidth: \(originWidth), originHeight: \(originHeight), width: \(width), height: \(height)")

    var status = VTCompressionSessionCreate(
      allocator: kCFAllocatorDefault,
      width: width,
      height: height,
      codecType: kCMVideoCodecType_H264,
      encoderSpecification: nil,
      imageBufferAttributes: pixelBufferAttributes as CFDictionary,
      compressedDataAllocator: nil,
      outputCallback: outputCallback,
      refcon: nil,
      compressionSessionOut: &compressionSession
    )
    if status != noErr {
      let errorDescription = getErrorDescription(status: status)
      session.setEncodeError("SampleHandler.prepareCompression. Failed to create compression session: \(errorDescription)")
      return
    }

    status = VTSessionSetProperty(compressionSession!, key: kVTCompressionPropertyKey_RealTime, value: kCFBooleanTrue)
    if status != noErr {
      let errorDescription = getErrorDescription(status: status)
      session.setEncodeError("SampleHandler.prepareCompression. Failed to set real time property: \(errorDescription)")
      return

    }
    if #available(iOSApplicationExtension 15.0, *) {
      status = VTSessionSetProperty(compressionSession!, key: kVTCompressionPropertyKey_ProfileLevel, value: kVTProfileLevel_H264_ConstrainedBaseline_AutoLevel)
      if status != noErr {
        let errorDescription = getErrorDescription(status: status)
        session.setEncodeError("SampleHandler.prepareCompression. Failed to set profile level property: \(errorDescription)")
        return

      }
    } else {
      // Fallback on earlier versions
    }
    status = VTSessionSetProperty(compressionSession!, key: kVTCompressionPropertyKey_AllowFrameReordering, value: kCFBooleanTrue)
    if status != noErr {
      let errorDescription = getErrorDescription(status: status)
      session.setEncodeError("SampleHandler.prepareCompression. Failed to set allow frame reordering property: \(errorDescription)")
      return
    }

    status = VTCompressionSessionPrepareToEncodeFrames(compressionSession!)
    if status != noErr {
      let errorDescription = getErrorDescription(status: status)
      session.setEncodeError("SampleHandler.prepareCompression. Failed to prepare to encode frames: \(errorDescription)")
      return
    }
  }

  func quitCompression() {
    guard let compressionSession = compressionSession else {
      return
    }

    VTCompressionSessionCompleteFrames(compressionSession, untilPresentationTimeStamp: CMTime.invalid)
    VTCompressionSessionInvalidate(compressionSession)
    self.compressionSession = nil
  }
}

func outputCallback(
  outputCallbackRefCon: UnsafeMutableRawPointer?, sourceFrameRefCon: UnsafeMutableRawPointer?, status: OSStatus, infoFlags: VTEncodeInfoFlags, sampleBuffer: CMSampleBuffer?
) {
  guard let sampleBuffer = sampleBuffer else {
    NSLog("outputCallback no sample buffer")
    return
  }
  guard let screenServer = SampleHandler.screenServer else {
    NSLog("outputCallback no screen server")
    return
  }

  let queryRet = screenServer.querySession(sessionId: SampleHandler.sessionId)
  if queryRet.state != ScreenServer.SessionState.steady {
    NSLog("outputCallback. session state isn't steady")
    return
  }
  guard let session = queryRet.session else {
    NSLog("outputCallback. Failed to get session")
    return
  }

  let sessionId = Unmanaged<NSNumber>.fromOpaque(sourceFrameRefCon!).takeUnretainedValue()
  if sessionId.uint32Value != session.sessionId {
    NSLog("outputCallback. old session frame")
    return
  }

  guard let attachments = CMSampleBufferGetSampleAttachmentsArray(sampleBuffer, createIfNecessary: true) as? NSArray else { return }

  guard let attachment = attachments[0] as? NSDictionary else {
    return
  }

  let isKeyframe = !(attachment[kCMSampleAttachmentKey_DependsOnOthers] as? Bool ?? true)

  //  if isKeyframe && (session.sps == nil || session.pps == nil) {
  if isKeyframe {
    getSps(sampleBuffer: sampleBuffer, session: session)
  }

  getFrame(sampleBuffer: sampleBuffer, isKeyFrame: isKeyframe, session: session)
}

func getFrame(sampleBuffer: CMSampleBuffer, isKeyFrame: Bool, session: Session) {
  guard let dataBuffer = CMSampleBufferGetDataBuffer(sampleBuffer) else {
    NSLog("Receive databuffer error!!")
    return
  }

  var length: size_t = 0
  var totalLength: size_t = 0
  var dataPointer: UnsafeMutablePointer<Int8>?

  let statusCodeRet = CMBlockBufferGetDataPointer(dataBuffer, atOffset: 0, lengthAtOffsetOut: &length, totalLengthOut: &totalLength, dataPointerOut: &dataPointer)

  if statusCodeRet != noErr {
    NSLog("Receive data pointer error!!")
    return
  }

  guard let ptr = dataPointer else {
    NSLog("Receive data pointer is nil!!")
    return
  }

  var bufferOffset: size_t = 0
  let AVCCHeaderLength: size_t = 4

  while bufferOffset < totalLength - AVCCHeaderLength {
    // Read the NAL unit length
    var NALUnitLength: UInt32 = 0
    memcpy(&NALUnitLength, ptr + bufferOffset, AVCCHeaderLength)

    NALUnitLength = CFSwapInt32BigToHost(NALUnitLength)

    let data = Data(bytes: ptr + bufferOffset + AVCCHeaderLength, count: Int(NALUnitLength))
    session.send(data: data)

    bufferOffset += AVCCHeaderLength + Int(NALUnitLength)
  }
}

func getSps(sampleBuffer: CMSampleBuffer, session: Session) {
  guard let format = CMSampleBufferGetFormatDescription(sampleBuffer) else { return }

  // sps
  var sparameterSetSize: size_t = 0
  var sparameterSetCount: size_t = 0

  var sps: UnsafePointer<UInt8>?

  let spsStatusCode = CMVideoFormatDescriptionGetH264ParameterSetAtIndex(
    format, parameterSetIndex: 0, parameterSetPointerOut: &sps, parameterSetSizeOut: &sparameterSetSize, parameterSetCountOut: &sparameterSetCount, nalUnitHeaderLengthOut: nil)

  if spsStatusCode != noErr {
    NSLog("Receive h264 sps error")
    return
  }

  // pps
  var pparameterSetSize: size_t = 0
  var pparameterSetCount: size_t = 0
  var pps: UnsafePointer<UInt8>?
  let ppsStatusCode = CMVideoFormatDescriptionGetH264ParameterSetAtIndex(
    format, parameterSetIndex: 1, parameterSetPointerOut: &pps, parameterSetSizeOut: &pparameterSetSize, parameterSetCountOut: &pparameterSetCount, nalUnitHeaderLengthOut: nil)

  if ppsStatusCode != noErr {
    NSLog("Receive h264 pps error")
    return
  }

  guard let spsBytes = sps, let ppsBytes = pps else {
    NSLog("Receive h264 sps,pps error")
    return
  }

  let spsData = Data(bytes: spsBytes, count: sparameterSetSize)
  let ppsData = Data(bytes: ppsBytes, count: pparameterSetSize)
  session.send(data: spsData)
  session.send(data: ppsData)
}

func getErrorDescription(status: OSStatus) -> String {
  let description = (SecCopyErrorMessageString(status, nil) as String?) ?? "Unknown error"
  return description
}
