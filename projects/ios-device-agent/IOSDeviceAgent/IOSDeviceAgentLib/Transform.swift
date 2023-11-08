struct Transform {
  enum Error: Swift.Error {
    case invalidControlSpaceSize(width: UInt32, height: UInt32)
  }
  static func controlSpaceToScreenSpace(controlSpacePosition: Inner_Types_DevicePosition, screenSize: CGSize)throws -> CGPoint {
    guard controlSpacePosition.screenWidth != 0, controlSpacePosition.screenHeight != 0 else {
      throw Error.invalidControlSpaceSize(width: controlSpacePosition.screenWidth, height: controlSpacePosition.screenHeight)
    }
    let controlSpaceSize = CGSize(
      width: Double(controlSpacePosition.screenWidth),
      height: Double(controlSpacePosition.screenHeight))
    let controlSpacePoint = CGPoint(
      x: Double(controlSpacePosition.x),
      y: Double(controlSpacePosition.y))

    var screenWidth = screenSize.width
    var screenHeight = screenSize.height
    if controlSpacePosition.screenHeight < controlSpacePosition.screenWidth {
      screenWidth = max(screenSize.width, screenSize.height)
      screenHeight = min(screenSize.width, screenSize.height)
    }
    if controlSpacePosition.screenWidth < controlSpacePosition.screenHeight {
      screenWidth = min(screenSize.width, screenSize.height)
      screenHeight = max(screenSize.width, screenSize.height)
    }

    return CGPoint(
      x: (controlSpacePoint.x * screenWidth) / controlSpaceSize.width,
      y: (controlSpacePoint.y * screenHeight) / controlSpaceSize.height)
  }}
