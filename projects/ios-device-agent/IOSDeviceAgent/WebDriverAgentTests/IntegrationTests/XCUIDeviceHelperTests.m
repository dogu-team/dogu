/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <XCTest/XCTest.h>

#import "FBApplication.h"
#import "FBIntegrationTestCase.h"
#import "FBImageUtils.h"
#import "FBMacros.h"
#import "FBTestMacros.h"
#import "XCUIDevice+FBHelpers.h"
#import "XCUIDevice+FBRotation.h"
#import "XCUIScreen.h"

@interface XCUIDeviceHelperTests : FBIntegrationTestCase
@end

@implementation XCUIDeviceHelperTests

- (void)restorePortraitOrientation
{
  if ([XCUIDevice sharedDevice].orientation != UIDeviceOrientationPortrait) {
    [[XCUIDevice sharedDevice] fb_setDeviceInterfaceOrientation:UIDeviceOrientationPortrait];
  }
}

- (void)setUp
{
  [super setUp];
  [self launchApplication];
  [self restorePortraitOrientation];
}

- (void)tearDown
{
  [self restorePortraitOrientation];
  [super tearDown];
}

- (void)testScreenshot
{
  NSError *error = nil;
  NSData *screenshotData = [[XCUIDevice sharedDevice] fb_screenshotWithError:&error];
  XCTAssertNotNil(screenshotData);
  XCTAssertNil(error);
  XCTAssertTrue(FBIsPngImage(screenshotData));

  UIImage *screenshot = [UIImage imageWithData:screenshotData];
  XCTAssertNotNil(screenshot);

  XCUIScreen *mainScreen = XCUIScreen.mainScreen;
  UIImage *screenshotExact = ((XCUIScreenshot *)mainScreen.screenshot).image;
  XCTAssertEqualWithAccuracy(screenshotExact.size.height * mainScreen.scale,
                             screenshot.size.height,
                             FLT_EPSILON);
  XCTAssertEqualWithAccuracy(screenshotExact.size.width * mainScreen.scale,
                             screenshot.size.width,
                             FLT_EPSILON);
}

- (void)testLandscapeScreenshot
{
  XCTAssertTrue([[XCUIDevice sharedDevice] fb_setDeviceInterfaceOrientation:UIDeviceOrientationLandscapeLeft]);
  NSError *error = nil;
  NSData *screenshotData = [[XCUIDevice sharedDevice] fb_screenshotWithError:&error];
  XCTAssertNotNil(screenshotData);
  XCTAssertTrue(FBIsPngImage(screenshotData));
  XCTAssertNil(error);

  UIImage *screenshot = [UIImage imageWithData:screenshotData];
  XCTAssertNotNil(screenshot);
  XCTAssertTrue(screenshot.size.width > screenshot.size.height);

  XCUIScreen *mainScreen = XCUIScreen.mainScreen;
  // TODO: This screenshot rotation was not landscape in an iOS 16 beta simulator. 
  UIImage *screenshotExact = ((XCUIScreenshot *)mainScreen.screenshot).image;
  XCTAssertEqualWithAccuracy(screenshotExact.size.height * mainScreen.scale,
                             screenshot.size.height,
                             FLT_EPSILON);
  XCTAssertEqualWithAccuracy(screenshotExact.size.width * mainScreen.scale,
                             screenshot.size.width,
                             FLT_EPSILON);
}

- (void)testWifiAddress
{
  NSString *adderss = [XCUIDevice sharedDevice].fb_wifiIPAddress;
  if (!adderss) {
    return;
  }
  NSRange range = [adderss rangeOfString:@"^([0-9]{1,3})\\.([0-9]{1,3})\\.([0-9]{1,3})\\.([0-9]{1,3})" options:NSRegularExpressionSearch];
  XCTAssertTrue(range.location != NSNotFound);
}

- (void)testGoToHomeScreen
{
  NSError *error;
  XCTAssertTrue([[XCUIDevice sharedDevice] fb_goToHomescreenWithError:&error]);
  XCTAssertNil(error);
  XCTAssertTrue([FBApplication fb_activeApplication].icons[@"Safari"].exists);
}

- (void)testLockUnlockScreen
{
  XCTAssertFalse([[XCUIDevice sharedDevice] fb_isScreenLocked]);
  NSError *error;
  XCTAssertTrue([[XCUIDevice sharedDevice] fb_lockScreen:&error]);
  XCTAssertTrue([[XCUIDevice sharedDevice] fb_isScreenLocked]);
  XCTAssertNil(error);
  XCTAssertTrue([[XCUIDevice sharedDevice] fb_unlockScreen:&error]);
  XCTAssertFalse([[XCUIDevice sharedDevice] fb_isScreenLocked]);
  XCTAssertNil(error);
}

- (void)disabled_testUrlSchemeActivation
{
  // This test is not stable on CI because of system slowness
  NSError *error;
  XCTAssertTrue([XCUIDevice.sharedDevice fb_openUrl:@"https://apple.com" error:&error]);
  FBAssertWaitTillBecomesTrue([FBApplication.fb_activeApplication.bundleID isEqualToString:@"com.apple.mobilesafari"]);
  XCTAssertNil(error);
}

- (void)testPressingUnsupportedButton
{
  NSError *error;
  NSNumber *duration = nil;
  XCTAssertFalse([XCUIDevice.sharedDevice fb_pressButton:@"volumeUpp"
                                             forDuration:duration
                                                   error:&error]);
  XCTAssertNotNil(error);
}

- (void)testPressingSupportedButton
{
  NSError *error;
  XCTAssertTrue([XCUIDevice.sharedDevice fb_pressButton:@"home"
                                            forDuration:nil
                                                  error:&error]);
  XCTAssertNil(error);
}

- (void)testPressingSupportedButtonNumber
{
  NSError *error;
  XCTAssertTrue([XCUIDevice.sharedDevice fb_pressButton:@"home"
                                            forDuration:[NSNumber numberWithDouble:1.0]
                                                  error:&error]);
  XCTAssertNil(error);
}

- (void)testLongPressHomeButton
{
  NSError *error;
  // kHIDPage_Consumer = 0x0C
  // kHIDUsage_Csmr_Menu = 0x40
  XCTAssertTrue([XCUIDevice.sharedDevice fb_performIOHIDEventWithPage:0x0C
                                                                usage:0x40
                                                             duration:1.0
                                                                error:&error]);
  XCTAssertNil(error);
}

- (void)testAppearance
{
  if (SYSTEM_VERSION_LESS_THAN(@"15.0")) {
    return;
  }
  NSError *error;
  XCTAssertTrue([XCUIDevice.sharedDevice fb_setAppearance:FBUIInterfaceAppearanceDark error:&error]);
  XCTAssertNil(error);
}

@end
