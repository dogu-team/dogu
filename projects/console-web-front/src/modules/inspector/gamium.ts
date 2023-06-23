import { DeviceRotationDirection, GamiumRotation, GetDeviceRotationFunc, GetDeviceScreenSizeFunc, GetInspectingAreaFunc, GetNodeBoundFunc, InspectorModule } from '.';
import { GamiumNodeAttributes } from '../../types/inspector';

class GamiumInspectorModule extends InspectorModule<GamiumNodeAttributes> {
  public getNodeBound: GetNodeBoundFunc<GamiumNodeAttributes> = (node) => {
    const screenPosition = node.attributes['screen-position'];
    const screenRectSize = node.attributes['screen-rect-size'];
    const deviceScreenSize = this.getDeviceScreenSize();

    if (!screenPosition) {
      return {
        x: 0,
        y: 0,
        width: screenRectSize?.width || 0,
        height: screenRectSize?.height || 0,
      };
    }

    if (!screenRectSize) {
      return {
        x: screenPosition.x,
        y: screenPosition.y,
        width: 0,
        height: 0,
      };
    }

    /*
     * screenPosition is cetner of screenRectSize
     * screenPosition is start (0,0) from bottom left of screen
     * need to convert to start (0,0) from top left of screen
     */
    return {
      x: screenPosition.x - screenRectSize.width / 2,
      y: deviceScreenSize.height - screenPosition.y - screenRectSize.height / 2,
      width: screenRectSize.width,
      height: screenRectSize.height,
    };
  };

  public getInspectingArea: GetInspectingAreaFunc = () => {
    const deviceSize = this.getDeviceScreenSize();

    return {
      x: 0,
      y: 0,
      ...deviceSize,
    };
  };

  public getDeviceRotation: GetDeviceRotationFunc = () => {
    const orientation = this.contextAndNode.node.attributes.orientation;

    switch (orientation) {
      case GamiumRotation.PORTRAIT:
        return DeviceRotationDirection.TOP_DOWN;
      case GamiumRotation.LANDSCAPE_LEFT:
        return DeviceRotationDirection.LEFT;
      case GamiumRotation.LANDSCAPE_RIGHT:
        return DeviceRotationDirection.RIGHT;
      case GamiumRotation.PORTRAIT_UPSIDE_DOWN:
        return DeviceRotationDirection.UPSIDE_DOWN;
      case GamiumRotation.AUTO_ROTATION:
      default:
        return DeviceRotationDirection.TOP_DOWN;
    }
  };

  public getDeviceScreenSize: GetDeviceScreenSizeFunc = () => {
    const width = this.contextAndNode.node.attributes.width;
    const height = this.contextAndNode.node.attributes.height;

    return {
      width: width || this.contextAndNode.screenSize.width,
      height: height || this.contextAndNode.screenSize.height,
    };
  };
}

export default GamiumInspectorModule;
