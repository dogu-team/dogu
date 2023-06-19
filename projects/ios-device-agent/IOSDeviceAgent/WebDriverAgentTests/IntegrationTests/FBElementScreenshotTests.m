/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <XCTest/XCTest.h>

#import "FBMacros.h"
#import "FBIntegrationTestCase.h"
#import "XCUIDevice+FBRotation.h"
#import "XCUIElement+FBUtilities.h"
#import "XCUIScreen.h"

@interface FBElementScreenshotTests : FBIntegrationTestCase
@end

@implementation FBElementScreenshotTests

- (void)setUp
{
  [super setUp];
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    [self launchApplication];
    [self goToAlertsPage];
  });
}

- (void)tearDown
{
  [self resetOrientation];
  [super tearDown];
}

- (void)testElementScreenshot
{
  [[XCUIDevice sharedDevice] fb_setDeviceInterfaceOrientation:UIDeviceOrientationLandscapeLeft];
  XCUIElement *button = self.testedApplication.buttons[FBShowAlertButtonName];
  NSError *error = nil;
  NSData *screenshotData = [button fb_screenshotWithError:&error];
  XCTAssertNotNil(screenshotData);
  XCTAssertNil(error);
  UIImage *image = [UIImage imageWithData:screenshotData];
  XCTAssertNotNil(image);
  XCTAssertTrue(image.size.width > image.size.height);
}

@end
