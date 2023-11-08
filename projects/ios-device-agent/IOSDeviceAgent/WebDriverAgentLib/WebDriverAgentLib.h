/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <UIKit/UIKit.h>

//! Project version number for WebDriverAgentLib_.
FOUNDATION_EXPORT double WebDriverAgentLib_VersionNumber;

//! Project version string for WebDriverAgentLib_.
FOUNDATION_EXPORT const unsigned char WebDriverAgentLib_VersionString[];

#import <WebDriverAgentLib/XCDebugLogDelegate-Protocol.h>
#import <WebDriverAgentLib/XCTestCase.h>
#import <WebDriverAgentLib/XCUIElement.h>
#import <WebDriverAgentLib/XCUIApplication.h>
#import <WebDriverAgentLib/XCUIElement+FBWebDriverAttributes.h>
#import <WebDriverAgentLib/XCUIElement+FBFind.h>
#import <WebDriverAgentLib/FBApplication.h>
#import <WebDriverAgentLib/FBMathUtils.h>
#import <WebDriverAgentLib/FBElement.h>
#import <WebDriverAgentLib/FBDebugLogDelegateDecorator.h>
#import <WebDriverAgentLib/FBConfiguration.h>
#import <WebDriverAgentLib/FBFailureProofTestCase.h>
#import <WebDriverAgentLib/FBWebServer.h>
#import <WebDriverAgentLib/FBXCElementSnapshot.h>
#import <WebDriverAgentLib/FBXCElementSnapshotWrapper.h>
#import <WebDriverAgentLib/XCSynthesizedEventRecord.h>
#import <WebDriverAgentLib/XCPointerEventPath.h>
#import <WebDriverAgentLib/XCUIDevice.h>
#import <WebDriverAgentLib/XCTestManager_ManagerInterface-Protocol.h>
#import <WebDriverAgentLib/FBXCTestDaemonsProxy.h>
#import <WebDriverAgentLib/XCUIDevice+FBHelpers.h>
#import <WebDriverAgentLib/FBSession.h>
#import <WebDriverAgentLib/XCUIApplication+FBTouchAction.h>
#import <WebDriverAgentLib/XCUIApplication+FBHelpers.h>
#import <WebDriverAgentLib/FBElementCache.h>
#import <WebDriverAgentLib/FBW3CActionsSynthesizer.h>
#import <WebDriverAgentLib/FBBaseActionsSynthesizer.h>
