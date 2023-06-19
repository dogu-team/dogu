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
#import "FBMacros.h"
#import "FBTestMacros.h"
#import "FBXCodeCompatibility.h"
#import "XCUIElement+FBIsVisible.h"

@interface FBElementVisibilityTests : FBIntegrationTestCase
@end

@implementation FBElementVisibilityTests

- (void)testSpringBoardIcons
{
  if ([UIDevice currentDevice].userInterfaceIdiom == UIUserInterfaceIdiomPad) {
    return;
  }
  [self launchApplication];
  [self goToSpringBoardFirstPage];

  // Check Icons on first screen
  // Note: Calender app exits 2 (an app icon + a widget) exist on the home screen
  // on iOS 15+. The firstMatch is for it.
  XCTAssertTrue(self.springboard.icons[@"Calendar"].firstMatch.fb_isVisible);
  XCTAssertTrue(self.springboard.icons[@"Reminders"].fb_isVisible);

  // Check Icons on second screen screen
  XCTAssertFalse(self.springboard.icons[@"IntegrationApp"].query.fb_firstMatch.fb_isVisible);
}

- (void)testSpringBoardSubfolder
{
  if ([UIDevice currentDevice].userInterfaceIdiom == UIUserInterfaceIdiomPad
      || SYSTEM_VERSION_GREATER_THAN(@"12.0")) {
    return;
  }
  [self launchApplication];
  [self goToSpringBoardExtras];
  XCTAssertFalse(self.springboard.icons[@"Extras"].otherElements[@"Contacts"].fb_isVisible);
}

- (void)disabled_testIconsFromSearchDashboard
{
  // This test causes:
  // Failure fetching attributes for element <XCAccessibilityElement: 0x60800044dd10> Device element: Error Domain=XCTDaemonErrorDomain Code=13 "Value for attribute 5017 is an error." UserInfo={NSLocalizedDescription=Value for attribute 5017 is an error.}
  [self launchApplication];
  [self goToSpringBoardDashboard];
  XCTAssertFalse(self.springboard.icons[@"Reminders"].fb_isVisible);
  XCTAssertFalse([[[self.springboard descendantsMatchingType:XCUIElementTypeIcon]
                   matchingIdentifier:@"IntegrationApp"]
                  fb_firstMatch].fb_isVisible);
}

- (void)testTableViewCells
{
  if (SYSTEM_VERSION_GREATER_THAN(@"12.0")) {
    // The test is flacky on iOS 12+ in Travis env
    return;
  }

  [self launchApplication];
  [self goToScrollPageWithCells:YES];
  for (int i = 0 ; i < 10 ; i++) {
    FBAssertWaitTillBecomesTrue(self.testedApplication.cells.allElementsBoundByAccessibilityElement[i].fb_isVisible);
    FBAssertWaitTillBecomesTrue(self.testedApplication.staticTexts.allElementsBoundByAccessibilityElement[i].fb_isVisible);
  }
}

@end
