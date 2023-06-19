/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <XCTest/XCTest.h>

#import "FBIntegrationTestCase.h"
#import "FBScreen.h"

@interface FBScreenTests : FBIntegrationTestCase
@end

@implementation FBScreenTests

- (void)setUp
{
  [super setUp];
  [self launchApplication];
}

- (void)testScreenScale
{
  XCTAssertTrue([FBScreen scale] >= 2);
}

- (void)testStatusBarSize
{
  CGSize statusBarSize = [FBScreen statusBarSizeForApplication:self.testedApplication];
  BOOL statusBarSizeIsZero = CGSizeEqualToSize(CGSizeZero, statusBarSize);
  XCTAssertFalse(statusBarSizeIsZero);
}

@end

