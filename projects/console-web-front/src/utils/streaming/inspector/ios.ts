import { IosNodeAttributes } from 'src/types/inspector';
import { DeviceRotationDirection, GetDeviceRotationFunc, GetDeviceScreenSizeFunc, GetInspectingAreaFunc, GetNodeBoundFunc, InspectorModule } from '.';

class IosInspectorModule extends InspectorModule<IosNodeAttributes> {
  public getNodeBound: GetNodeBoundFunc<IosNodeAttributes> = (node) => {
    const { x, y, width, height } = node.attributes;

    return {
      x: x || 0,
      y: y || 0,
      width: width || 0,
      height: height || 0,
    };
  };

  public getInspectingArea: GetInspectingAreaFunc = () => {
    const android = this.contextAndNode.android;

    if (!android) {
      return {
        x: 0,
        y: 0,
        ...this.contextAndNode.screenSize,
      };
    }

    const rotation = this.getDeviceRotation();
    const screenSize = this.getDeviceScreenSize();

    const isStatusBarVisible = android.statusBar.visible;
    const isNavigationBarVisible = android.navigationBar.visible;

    switch (rotation) {
      case DeviceRotationDirection.TOP_DOWN:
        return {
          x: 0,
          y: isStatusBarVisible ? android.statusBar.height : 0,
          width: this.contextAndNode.node.attributes.width || screenSize.width,
          height: isNavigationBarVisible ? screenSize.height - android.statusBar.height - android.navigationBar.height : screenSize.height - android.statusBar.height,
        };
      case DeviceRotationDirection.LEFT:
        return {
          x: 0,
          y: isStatusBarVisible ? android.statusBar.height : 0,
          width: isNavigationBarVisible ? screenSize.width - android.navigationBar.width : screenSize.width,
          height: isStatusBarVisible ? screenSize.height - android.statusBar.height : screenSize.height,
        };
      case DeviceRotationDirection.RIGHT:
        return {
          x: isNavigationBarVisible ? android.navigationBar.width : 0,
          y: isStatusBarVisible ? android.statusBar.height : 0,
          width: isNavigationBarVisible ? screenSize.width - android.navigationBar.width : screenSize.width,
          height: isStatusBarVisible ? screenSize.height - android.statusBar.height : screenSize.height,
        };
      case DeviceRotationDirection.UPSIDE_DOWN:
        return {
          x: 0,
          y: android.statusBar.height,
          width: this.contextAndNode.node.attributes.width || screenSize.width,
          height: isNavigationBarVisible ? screenSize.height - android.statusBar.height - android.navigationBar.height : screenSize.height - android.statusBar.height,
        };
      default:
        return {
          x: 0,
          y: 0,
          width: this.contextAndNode.node.attributes.width || screenSize.width,
          height: this.contextAndNode.node.attributes.height || screenSize.height,
        };
    }
  };

  public getDeviceRotation: GetDeviceRotationFunc = () => {
    return DeviceRotationDirection.TOP_DOWN;
  };

  public getDeviceScreenSize: GetDeviceScreenSizeFunc = () => {
    return this.contextAndNode.screenSize;
  };
}

export default IosInspectorModule;
