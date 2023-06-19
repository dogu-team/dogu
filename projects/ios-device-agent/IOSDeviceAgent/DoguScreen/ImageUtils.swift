//
//  ImageUtils.swift
//  DoguScreen
//
//  Created by jenkins on 2023/06/04.
//  Copyright © 2023 Dogu. All rights reserved.
//

import AVFoundation
import Accelerate
import ReplayKit
import VideoToolbox

func rotate(_ sampleBuffer: CMSampleBuffer, orientation: CGImagePropertyOrientation) -> CVPixelBuffer? {
  guard let imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
    return nil
  }
  if orientation == .up {
    return imageBuffer
  }
  let pixelFormatType = CVPixelBufferGetPixelFormatType(imageBuffer)
  switch pixelFormatType {
  case kCVPixelFormatType_32BGRA:
    //    NSLog("32BGRA")
    return rotateBGRA(imageBuffer: imageBuffer, orientation: orientation)
  case kCVPixelFormatType_32ARGB:
    //    NSLog("32ARGB")
    return rotateBGRA(imageBuffer: imageBuffer, orientation: orientation)
  case kCVPixelFormatType_420YpCbCr8BiPlanarFullRange:
    //    NSLog("YpCbCr8BiPlanar")
    return rotateYpCbCr8BiPlanar(imageBuffer: imageBuffer, orientation: orientation)
  default:
    return rotateBGRA(imageBuffer: imageBuffer, orientation: orientation)
  }
}

func rotateBGRA(imageBuffer: CVImageBuffer, orientation: CGImagePropertyOrientation) -> CVPixelBuffer? {
  let rotationConstant = orientationToRotationConstant(orientation)
  CVPixelBufferLockBaseAddress(imageBuffer, .init(rawValue: 0))

  let kAlignment_32BGRA: Int = 32
  let kBytesPerPixel_32BGRA: Int = 4

  let bytesPerRow = CVPixelBufferGetBytesPerRow(imageBuffer)
  let width = CVPixelBufferGetWidth(imageBuffer)
  let height = CVPixelBufferGetHeight(imageBuffer)

  let outWidth = height
  let outHeight = width

  let bytesPerRowOut = kBytesPerPixel_32BGRA * Int(ceil(CGFloat(outWidth) / CGFloat(kAlignment_32BGRA))) * kAlignment_32BGRA

  guard let srcBuff = CVPixelBufferGetBaseAddress(imageBuffer) else {
    return nil
  }

  let dstBuff = UnsafeMutableRawPointer.allocate(byteCount: bytesPerRowOut * outHeight, alignment: MemoryLayout<UInt>.size)

  var inbuff = vImage_Buffer(data: srcBuff, height: vImagePixelCount(height), width: vImagePixelCount(width), rowBytes: bytesPerRow)
  var outbuff = vImage_Buffer(data: dstBuff, height: vImagePixelCount(outHeight), width: vImagePixelCount(outWidth), rowBytes: Int(bytesPerRowOut))

  let bgColor: [UInt8] = [0, 0, 0, 0]

  let err = vImageRotate90_ARGB8888(&inbuff, &outbuff, UInt8(rotationConstant), bgColor, 0)
  if err != kvImageNoError {
    NSLog("%ld", err)
  }

  CVPixelBufferUnlockBaseAddress(imageBuffer, .init(rawValue: 0))

  let pixelBufferAttributes: [NSString: AnyObject] = [
    kCVPixelBufferPixelFormatTypeKey: NSNumber(value: kCVPixelFormatType_32BGRA),
    kCVPixelBufferWidthKey: NSNumber(value: outWidth),
    kCVPixelBufferHeightKey: NSNumber(value: outHeight),
  ]

  var rotatedBuffer: CVPixelBuffer?
  CVPixelBufferCreateWithBytes(
    nil,
    outWidth,
    outHeight,
    kCVPixelFormatType_32BGRA,
    //    kCVPixelFormatType_420YpCbCr8BiPlanarFullRange,
    outbuff.data,
    Int(bytesPerRowOut),
    freePixelBufferDataAfterRelease,
    nil,
    pixelBufferAttributes as CFDictionary,
    &rotatedBuffer)

  return rotatedBuffer
}

func rotateYpCbCr8BiPlanar(imageBuffer: CVImageBuffer, orientation: CGImagePropertyOrientation) -> CVPixelBuffer? {
  let rotationConstant = orientationToRotationConstant(orientation)

  CVPixelBufferLockBaseAddress(imageBuffer, .init(rawValue: 0))

  // Assuming pixelBuffer is of kCVPixelFormatType_420YpCbCr8BiPlanarFullRange format

  // Get the luma (Y) plane
  guard let lumaPlane = CVPixelBufferGetBaseAddressOfPlane(imageBuffer, 0) else {
    // Failed to get the luma plane
    NSLog("Failed to get the luma plane")
    return nil
  }

  let lumaWidth = CVPixelBufferGetWidthOfPlane(imageBuffer, 0)
  let lumaHeight = CVPixelBufferGetHeightOfPlane(imageBuffer, 0)
  let lumaBytesPerRow = CVPixelBufferGetBytesPerRowOfPlane(imageBuffer, 0)
//  NSLog("lumaWidth: %d, lumaHeight: %d, lumaBytesPerRow: %d", lumaWidth, lumaHeight, lumaBytesPerRow)
  // Create a vImage buffer for the luma plane
  var lumaBuffer = vImage_Buffer(data: lumaPlane, height: vImagePixelCount(lumaHeight), width: vImagePixelCount(lumaWidth), rowBytes: lumaBytesPerRow)

  // Get the chroma (CbCr) plane
  guard let chromaPlane = CVPixelBufferGetBaseAddressOfPlane(imageBuffer, 1) else {
    // Failed to get the chroma plane
    NSLog("Failed to get the chroma plane")
    return nil
  }

  let chromaWidth = CVPixelBufferGetWidthOfPlane(imageBuffer, 1)
  let chromaHeight = CVPixelBufferGetHeightOfPlane(imageBuffer, 1)
  let chromaBytesPerRow = CVPixelBufferGetBytesPerRowOfPlane(imageBuffer, 1)
//  NSLog("chromaWidth: %d, chromaHeight: %d, chromaBytesPerRow: %d", chromaWidth, chromaHeight, chromaBytesPerRow)

  // Create a vImage buffer for the chroma plane
  var chromaBuffer = vImage_Buffer(data: chromaPlane, height: vImagePixelCount(chromaHeight), width: vImagePixelCount(chromaWidth), rowBytes: chromaBytesPerRow)

  // Create a new pixel buffer to store the rotated result
  var outputPixelBuffer: CVPixelBuffer?
  let pixelBufferAttributes: [NSString: AnyObject] = [
    kCVPixelBufferPixelFormatTypeKey: NSNumber(value: kCVPixelFormatType_420YpCbCr8BiPlanarFullRange),
    kCVPixelBufferWidthKey: NSNumber(value: lumaHeight),
    kCVPixelBufferHeightKey: NSNumber(value: lumaWidth),
  ]

  let status = CVPixelBufferCreate(nil, lumaHeight, lumaWidth, kCVPixelFormatType_420YpCbCr8BiPlanarFullRange, pixelBufferAttributes as CFDictionary, &outputPixelBuffer)
  guard status == kCVReturnSuccess, let outputBuffer = outputPixelBuffer else {
    // Failed to create the output pixel buffer
    NSLog("Failed to create the output pixel buffer")
    return nil
  }

  CVPixelBufferLockBaseAddress(outputBuffer, .init(rawValue: 0))

  let outputPlaneCount = CVPixelBufferGetPlaneCount(outputBuffer)
  let outputWidth = CVPixelBufferGetWidth(outputBuffer)
  let outputHeight = CVPixelBufferGetHeight(outputBuffer)
  let outputDataSize = CVPixelBufferGetDataSize(outputBuffer)
  let outputBytesPerRow = CVPixelBufferGetBytesPerRow(outputBuffer)
//  NSLog(
//    "outputPlaneCount: %d, outputWidth: %d, outputHeight: %d, outputDataSize: %d, outputBytesPerRow: %d", outputPlaneCount, outputWidth, outputHeight, outputDataSize,
//    outputBytesPerRow
//  )

  // Get the luma (Y) plane of the output buffer
  //  guard let outputLumaPlane = CVPixelBufferGetBaseAddressOfPlane(outputBuffer, 0) else {
  guard let outputLumaPlane = CVPixelBufferGetBaseAddressOfPlane(outputBuffer, 0) else {
    // Failed to get the luma plane of the output buffer
    NSLog("Failed to get the luma plane of the output buffer")
    return nil
  }

  let outputLumaWidth = CVPixelBufferGetWidthOfPlane(outputBuffer, 0)
  let outputLumaHeight = CVPixelBufferGetHeightOfPlane(outputBuffer, 0)
  let outputLumaBytesPerRow = CVPixelBufferGetBytesPerRowOfPlane(outputBuffer, 0)
  var outputLumaBuffer = vImage_Buffer(
    data: outputLumaPlane, height: vImagePixelCount(outputLumaHeight), width: vImagePixelCount(outputLumaWidth), rowBytes: outputLumaBytesPerRow)
//  NSLog(
//    "outputLumaWidth: %d, outputLumaHeight: %d, outputLumaBytesPerRow: %d", outputLumaWidth, outputLumaHeight,
//    outputLumaBytesPerRow)

  // Get the chroma (CbCr) plane of the output buffer
  guard let outputChromaPlane = CVPixelBufferGetBaseAddressOfPlane(outputBuffer, 1) else {
    // Failed to get the chroma plane of the output buffer
    NSLog("Failed to get the chroma plane of the output buffer")
    return nil
  }

  let outputChromaWidth = CVPixelBufferGetWidthOfPlane(outputBuffer, 1)
  let outputChromaHeight = CVPixelBufferGetHeightOfPlane(outputBuffer, 1)
  let outputChromaBytesPerRow = CVPixelBufferGetBytesPerRowOfPlane(outputBuffer, 1)
  var outputChromaBuffer = vImage_Buffer(
    data: outputChromaPlane, height: vImagePixelCount(outputChromaHeight), width: vImagePixelCount(outputChromaWidth), rowBytes: outputChromaBytesPerRow)
//  NSLog(
//    "outputChromaWidth: %d, outputChromaHeight: %d, outputChromaBytesPerRow: %d", outputChromaWidth, outputChromaHeight,
//    outputChromaBytesPerRow)

  // Rotate the luma plane
  var err = vImageRotate90_Planar8(&lumaBuffer, &outputLumaBuffer, UInt8(rotationConstant), 0, vImage_Flags(kvImageNoFlags))
  if err != kvImageNoError {
    NSLog("Error rotating luma plane: %d", err)
    return nil
  }

  // Rotate the chroma plane
  err = vImageRotate90_Planar16U(&chromaBuffer, &outputChromaBuffer, UInt8(rotationConstant), 0, vImage_Flags(kvImageNoFlags))
  if err != kvImageNoError {
    NSLog("Error rotating chroma plane: %d", err)
    return nil
  }

  CVPixelBufferUnlockBaseAddress(imageBuffer, .init(rawValue: 0))
  CVPixelBufferUnlockBaseAddress(outputBuffer, .init(rawValue: 0))

  return outputPixelBuffer
}

//func rotateYpCbCr8BiPlanar(imageBuffer: CVImageBuffer, orientation: CGImagePropertyOrientation) -> CVPixelBuffer? {
//  let rotationConstant = orientationToRotationConstant(orientation)
//  CVPixelBufferLockBaseAddress(imageBuffer, .init(rawValue: 0))
//  NSLog("1")
//
//  let bytesPerRow = CVPixelBufferGetBytesPerRow(imageBuffer)
//  let width = CVPixelBufferGetWidth(imageBuffer)
//  let height = CVPixelBufferGetHeight(imageBuffer)
//  let dataSize = CVPixelBufferGetDataSize(imageBuffer)
//  let planeCount = CVPixelBufferGetPlaneCount(imageBuffer)
//  NSLog("dataSize \(dataSize)")
//  let outWidth = height
//  let outHeight = width
//  let planeBytesPerRowOut = Int(ceil(CGFloat(outWidth) / CGFloat(32))) * 32
//  let bytesPerRowOut = Int(ceil(CGFloat(outWidth) * 1.5 / CGFloat(32))) * 32
//
//  guard let lumaPlane = CVPixelBufferGetBaseAddressOfPlane(pixelBuffer, 0) else {
//      // Failed to get the luma plane
//      return nil
//  }
//
//  let lumaWidth = CVPixelBufferGetWidthOfPlane(pixelBuffer, 0)
//  let lumaHeight = CVPixelBufferGetHeightOfPlane(pixelBuffer, 0)
//  let lumaBytesPerRow = CVPixelBufferGetBytesPerRowOfPlane(pixelBuffer, 0)
//
//
//  var outputPixelBuffer: CVPixelBuffer?
//      let status = CVPixelBufferCreate(nil, lumaWidth, lumaHeight, kCVPixelFormatType_420YpCbCr8BiPlanarFullRange, nil, &outputPixelBuffer)
//  guard status == kCVReturnSuccess, let outputBuffer = outputPixelBuffer else {
//    NSLog("CVPixelBufferCreate failed \(status)")
//    return nil
//  }
//
//  let dstBuffSize = planeBytesPerRowOut * Int(ceil(CGFloat(outHeight) * 1.5))
//  let dstBuff = UnsafeMutableRawPointer.allocate(byteCount: dstBuffSize, alignment: MemoryLayout<UInt>.size)
//  var dstBuffOffest = 0
//  for i in 0..<planeCount {
//    let planeBaseAddress = CVPixelBufferGetBaseAddressOfPlane(imageBuffer, i)
//    let planeBytesPerRow = CVPixelBufferGetBytesPerRowOfPlane(imageBuffer, i)
//    let planeWidth = CVPixelBufferGetWidthOfPlane(imageBuffer, i)
//    let planeHeight = CVPixelBufferGetHeightOfPlane(imageBuffer, i)
//    let planeOutWidth = planeHeight
//    let planeOutHeight = planeWidth
//    NSLog("planeBytesPerRow \(planeBytesPerRow)")
//    NSLog("planeBytesPerRowOut \(planeBytesPerRowOut)")
//    NSLog("planeWidth \(planeWidth)")
//    NSLog("planeHeight \(planeHeight)")
//    NSLog("dstBuffOffest \(dstBuffOffest)")
//    var inbuff = vImage_Buffer(data: planeBaseAddress, height: vImagePixelCount(planeHeight), width: vImagePixelCount(planeWidth), rowBytes: planeBytesPerRow)
//    var outbuff = vImage_Buffer(data: dstBuff + dstBuffOffest, height: vImagePixelCount(planeOutHeight), width: vImagePixelCount(planeOutWidth), rowBytes: planeBytesPerRowOut)
//    let err = vImageRotate90_Planar8(&inbuff, &outbuff, UInt8(rotationConstant), 0, 0)
//    if err != kvImageNoError {
//      NSLog("%ld", err)
//      return nil
//    }
//    dstBuffOffest += planeBytesPerRowOut * planeOutHeight
//  }
//
//  CVPixelBufferUnlockBaseAddress(imageBuffer, .init(rawValue: 0))
//
//  var rotatedBuffer: CVPixelBuffer?
//  CVPixelBufferCreateWithBytes(
//    nil,
//    outWidth,
//    outHeight,
//    kCVPixelFormatType_420YpCbCr8BiPlanarFullRange,
//    dstBuff,
//    bytesPerRowOut,
//    freePixelBufferDataAfterRelease,
//    nil,
//    nil,
//    &rotatedBuffer)
//  NSLog("5")
//
//  return rotatedBuffer
//}

func freePixelBufferDataAfterRelease(_ releaseRefCon: UnsafeMutableRawPointer?, _ baseAddress: UnsafeRawPointer?) {
  guard let address = baseAddress else {
    return
  }

  // Free the memory we malloced for the vImage rotation
  free(UnsafeMutableRawPointer(mutating: address))
}

//func rotate(_ sampleBuffer: CMSampleBuffer, orientation: CGImagePropertyOrientation) -> CVPixelBuffer? {
//  guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
//    return nil
//  }
//  if orientation == .up {
//    return pixelBuffer
//  }
//  var newPixelBuffer: CVPixelBuffer?
//  let error = CVPixelBufferCreate(
//    kCFAllocatorDefault,
//    CVPixelBufferGetHeight(pixelBuffer),
//    CVPixelBufferGetWidth(pixelBuffer),
//    kCVPixelFormatType_420YpCbCr8BiPlanarFullRange,
//    nil,
//    &newPixelBuffer)
//  guard error == kCVReturnSuccess else {
//    return nil
//  }
//  let ciImage = CIImage(cvPixelBuffer: pixelBuffer).oriented(reverseOrientation(orientation))
//  let context = CIContext(options: nil)
//  context.render(ciImage, to: newPixelBuffer!)
//  return newPixelBuffer
//}

func getVideoOrientation(from sampleBuffer: CMSampleBuffer) -> CGImagePropertyOrientation {
  guard let orientationAttachment = CMGetAttachment(sampleBuffer, key: RPVideoSampleOrientationKey as CFString, attachmentModeOut: nil) as? NSNumber else {
    return .up
  }

  let orientation = CGImagePropertyOrientation(rawValue: orientationAttachment.uint32Value)
  guard let orientation = orientation else { return .up }
  return orientation
}

func reverseOrientation(_ orientation: CGImagePropertyOrientation) -> CGImagePropertyOrientation {
  switch orientation {
  case .up:
    return .down
  case .down:
    return .up
  case .left:
    return .right
  case .right:
    return .left
  case .upMirrored:
    return .downMirrored
  case .downMirrored:
    return .upMirrored
  case .leftMirrored:
    return .rightMirrored
  case .rightMirrored:
    return .leftMirrored
  @unknown default:
    return orientation
  }
}

func orientationToRotationConstant(_ orientation: CGImagePropertyOrientation) -> Int {
  switch orientation {
  case .up:
    return kRotate0DegreesClockwise
  case .down:
    return kRotate180DegreesClockwise
  case .left:
    return kRotate90DegreesClockwise
  case .right:
    return kRotate90DegreesCounterClockwise
  default:
    return 0
  }
}
