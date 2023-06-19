/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "FBScreen.h"
#import "FBApplication.h"
#import "XCUIElement+FBIsVisible.h"
#import "FBXCodeCompatibility.h"
#import "XCUIScreen.h"

@implementation FBScreen

+ (double)scale
{
  return [XCUIScreen.mainScreen scale];
}

+ (CGSize)statusBarSizeForApplication:(XCUIApplication *)application
{
  XCUIApplication *app = application;
  BOOL expectVisibleBar = YES;

  // Since iOS 13 the status bar is no longer part of the application, it’s part of the SpringBoard
  if (@available(iOS 13.0, *)) {
    app = FBApplication.fb_systemApplication;
    expectVisibleBar = NO;
  }

  XCUIElement *mainStatusBar = app.statusBars.fb_firstMatch;
  if (!mainStatusBar || (expectVisibleBar && !mainStatusBar.fb_isVisible)) {
    return CGSizeZero;
  }
  CGSize result = mainStatusBar.frame.size;
  // Workaround for https://github.com/appium/appium/issues/15961
  return CGSizeMake(MAX(result.width, result.height), MIN(result.width, result.height));
}

@end
