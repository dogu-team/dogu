/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "XCUIApplication+FBHelpers.h"

#import "FBElementTypeTransformer.h"
#import "FBKeyboard.h"
#import "FBLogger.h"
#import "FBMacros.h"
#import "FBMathUtils.h"
#import "FBActiveAppDetectionPoint.h"
#import "FBXCodeCompatibility.h"
#import "FBXPath.h"
#import "FBXCAccessibilityElement.h"
#import "FBXCTestDaemonsProxy.h"
#import "FBXCElementSnapshotWrapper+Helpers.h"
#import "FBXCAXClientProxy.h"
#import "FBXMLGenerationOptions.h"
#import "XCUIDevice+FBHelpers.h"
#import "XCUIElement+FBCaching.h"
#import "XCUIElement+FBIsVisible.h"
#import "XCUIElement+FBUtilities.h"
#import "XCUIElement+FBWebDriverAttributes.h"
#import "XCTestManager_ManagerInterface-Protocol.h"
#import "XCTestPrivateSymbols.h"
#import "XCTRunnerDaemonSession.h"
#import "FBRunLoopSpinner.h"
#import "XCUIElement+FBTap.h"
#import "XCUIElementQuery.h"


#define BROKEN_RECT CGRectMake(-1, -1, 0, 0)


static NSString* const FBUnknownBundleId = @"unknown";


@implementation XCUIApplication (FBHelpers)


CGRect* frameCache = NULL;


- (CGRect)wdFrame
{
  if (NULL == frameCache) {
    frameCache = malloc(sizeof(CGRect));
    *frameCache = self.sanpshotFrame;
  }
  CGFloat max = MAX(frameCache->size.width, frameCache->size.height);
  CGFloat min = MIN(frameCache->size.width, frameCache->size.height);
  UIDeviceOrientation orientation = [XCUIDevice sharedDevice].orientation;
  if (orientation == UIDeviceOrientationLandscapeLeft || orientation == UIDeviceOrientationLandscapeRight) {
    return  CGRectMake(0, 0, max, min);
  }
  return CGRectMake(0, 0, min, max);
}

- (CGRect)sanpshotFrame
{
  CGRect frame = self.frame;
  int width = (int)frame.size.width;
  int height = (int)frame.size.height;
  if (width == height) {
    NSArray<XCUIElement *>* elems = self.application.windows.allElementsBoundByIndex;
    if(0 < elems.count){
      frame = elems[0].frame;
    }
  }

  // It is mandatory to replace all Infinity values with numbers to avoid JSON parsing
  // exceptions like https://github.com/facebook/WebDriverAgent/issues/639#issuecomment-314421206
  // caused by broken element dimensions returned by XCTest
  return (isinf(frame.size.width) || isinf(frame.size.height)
          || isinf(frame.origin.x) || isinf(frame.origin.y))
    ? CGRectIntegral(BROKEN_RECT)
    : CGRectIntegral(frame);
}


- (BOOL)fb_waitForAppElement:(NSTimeInterval)timeout
{
  __block BOOL canDetectAxElement = YES;
  int currentProcessIdentifier = [self.accessibilityElement processIdentifier];
  BOOL result = [[[FBRunLoopSpinner new]
           timeout:timeout]
          spinUntilTrue:^BOOL{
    id<FBXCAccessibilityElement> currentAppElement = FBActiveAppDetectionPoint.sharedInstance.axElement;
    canDetectAxElement = nil != currentAppElement;
    if (!canDetectAxElement) {
      return YES;
    }
    return currentAppElement.processIdentifier == currentProcessIdentifier;
  }];
  return canDetectAxElement
    ? result
    : [self waitForExistenceWithTimeout:timeout];
}

+ (NSArray<NSDictionary<NSString *, id> *> *)fb_appsInfoWithAxElements:(NSArray<id<FBXCAccessibilityElement>> *)axElements
{
  NSMutableArray<NSDictionary<NSString *, id> *> *result = [NSMutableArray array];
  id<XCTestManager_ManagerInterface> proxy = [FBXCTestDaemonsProxy testRunnerProxy];
  for (id<FBXCAccessibilityElement> axElement in axElements) {
    NSMutableDictionary<NSString *, id> *appInfo = [NSMutableDictionary dictionary];
    pid_t pid = axElement.processIdentifier;
    appInfo[@"pid"] = @(pid);
    __block NSString *bundleId = nil;
    dispatch_semaphore_t sem = dispatch_semaphore_create(0);
    [proxy _XCT_requestBundleIDForPID:pid
                                reply:^(NSString *bundleID, NSError *error) {
                                  if (nil == error) {
                                    bundleId = bundleID;
                                  } else {
                                    [FBLogger logFmt:@"Cannot request the bundle ID for process ID %@: %@", @(pid), error.description];
                                  }
                                  dispatch_semaphore_signal(sem);
                                }];
    dispatch_semaphore_wait(sem, dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)));
    appInfo[@"bundleId"] = bundleId ?: FBUnknownBundleId;
    [result addObject:appInfo.copy];
  }
  return result.copy;
}

+ (NSArray<NSDictionary<NSString *, id> *> *)fb_activeAppsInfo
{
  return [self fb_appsInfoWithAxElements:[FBXCAXClientProxy.sharedClient activeApplications]];
}

- (BOOL)fb_deactivateWithDuration:(NSTimeInterval)duration error:(NSError **)error
{
  if(![[XCUIDevice sharedDevice] fb_goToHomescreenWithError:error]) {
    return NO;
  }
  [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:MAX(duration, .0)]];
  [self fb_activate];
  return YES;
}

- (NSDictionary *)fb_tree
{
  id<FBXCElementSnapshot> snapshot = self.fb_isResolvedFromCache.boolValue
    ? self.lastSnapshot
    : [self fb_snapshotWithAllAttributesAndMaxDepth:nil];
  return [self.class dictionaryForElement:snapshot recursive:YES];
}

- (NSDictionary *)fb_accessibilityTree
{
  id<FBXCElementSnapshot> snapshot = self.fb_isResolvedFromCache.boolValue
    ? self.lastSnapshot
    : [self fb_snapshotWithAllAttributesAndMaxDepth:nil];
  return [self.class accessibilityInfoForElement:snapshot];
}

+ (NSDictionary *)dictionaryForElement:(id<FBXCElementSnapshot>)snapshot recursive:(BOOL)recursive
{
  NSMutableDictionary *info = [[NSMutableDictionary alloc] init];
  info[@"type"] = [FBElementTypeTransformer shortStringWithElementType:snapshot.elementType];
  info[@"rawIdentifier"] = FBValueOrNull([snapshot.identifier isEqual:@""] ? nil : snapshot.identifier);
  FBXCElementSnapshotWrapper *wrappedSnapshot = [FBXCElementSnapshotWrapper ensureWrapped:snapshot];
  info[@"name"] = FBValueOrNull(wrappedSnapshot.wdName);
  info[@"value"] = FBValueOrNull(wrappedSnapshot.wdValue);
  info[@"label"] = FBValueOrNull(wrappedSnapshot.wdLabel);
  info[@"rect"] = wrappedSnapshot.wdRect;
  info[@"frame"] = NSStringFromCGRect(wrappedSnapshot.wdFrame);
  info[@"isEnabled"] = [@([wrappedSnapshot isWDEnabled]) stringValue];
  info[@"isVisible"] = [@([wrappedSnapshot isWDVisible]) stringValue];
  info[@"isAccessible"] = [@([wrappedSnapshot isWDAccessible]) stringValue];
#if TARGET_OS_TV
  info[@"isFocused"] = [@([wrappedSnapshot isWDFocused]) stringValue];
#endif

  if (!recursive) {
    return info.copy;
  }

  NSArray *childElements = snapshot.children;
  if ([childElements count]) {
    info[@"children"] = [[NSMutableArray alloc] init];
    for (id<FBXCElementSnapshot> childSnapshot in childElements) {
      [info[@"children"] addObject:[self dictionaryForElement:childSnapshot recursive:YES]];
    }
  }
  return info;
}

+ (NSDictionary *)accessibilityInfoForElement:(id<FBXCElementSnapshot>)snapshot
{
  FBXCElementSnapshotWrapper *wrappedSnapshot = [FBXCElementSnapshotWrapper ensureWrapped:snapshot];
  BOOL isAccessible = [wrappedSnapshot isWDAccessible];
  BOOL isVisible = [wrappedSnapshot isWDVisible];

  NSMutableDictionary *info = [[NSMutableDictionary alloc] init];

  if (isAccessible) {
    if (isVisible) {
      info[@"value"] = FBValueOrNull(wrappedSnapshot.wdValue);
      info[@"label"] = FBValueOrNull(wrappedSnapshot.wdLabel);
    }
  } else {
    NSMutableArray *children = [[NSMutableArray alloc] init];
    for (id<FBXCElementSnapshot> childSnapshot in snapshot.children) {
      NSDictionary *childInfo = [self accessibilityInfoForElement:childSnapshot];
      if ([childInfo count]) {
        [children addObject: childInfo];
      }
    }
    if ([children count]) {
      info[@"children"] = [children copy];
    }
  }
  if ([info count]) {
    info[@"type"] = [FBElementTypeTransformer shortStringWithElementType:snapshot.elementType];
    info[@"rawIdentifier"] = FBValueOrNull([snapshot.identifier isEqual:@""] ? nil : snapshot.identifier);
    info[@"name"] = FBValueOrNull(wrappedSnapshot.wdName);
  } else {
    return nil;
  }
  return info;
}

- (NSString *)fb_xmlRepresentation
{
  return [self fb_xmlRepresentationWithOptions:nil];
}

- (NSString *)fb_xmlRepresentationWithOptions:(FBXMLGenerationOptions *)options
{
  return [FBXPath xmlStringWithRootElement:self options:options];
}

- (NSString *)fb_descriptionRepresentation
{
  NSMutableArray<NSString *> *childrenDescriptions = [NSMutableArray array];
  for (XCUIElement *child in [self.fb_query childrenMatchingType:XCUIElementTypeAny].allElementsBoundByAccessibilityElement) {
    [childrenDescriptions addObject:child.debugDescription];
  }
  // debugDescription property of XCUIApplication instance shows descendants addresses in memory
  // instead of the actual information about them, however the representation works properly
  // for all descendant elements
  return (0 == childrenDescriptions.count) ? self.debugDescription : [childrenDescriptions componentsJoinedByString:@"\n\n"];
}

- (XCUIElement *)fb_activeElement
{
  return [[[self.fb_query descendantsMatchingType:XCUIElementTypeAny]
           matchingPredicate:[NSPredicate predicateWithFormat:@"hasKeyboardFocus == YES"]]
          fb_firstMatch];
}

#if TARGET_OS_TV
- (XCUIElement *)fb_focusedElement
{
  return [[[self.fb_query descendantsMatchingType:XCUIElementTypeAny]
           matchingPredicate:[NSPredicate predicateWithFormat:@"hasFocus == true"]]
          fb_firstMatch];
}
#endif

- (BOOL)fb_dismissKeyboardWithKeyNames:(nullable NSArray<NSString *> *)keyNames
                                 error:(NSError **)error
{
  BOOL (^isKeyboardInvisible)(void) = ^BOOL(void) {
    return ![FBKeyboard waitUntilVisibleForApplication:self
                                               timeout:0
                                                 error:nil];
  };

  if (isKeyboardInvisible()) {
    // Short circuit if the keyboard is not visible
    return YES;
  }

#if TARGET_OS_TV
  [[XCUIRemote sharedRemote] pressButton:XCUIRemoteButtonMenu];
#else
  NSArray<XCUIElement *> *(^findMatchingKeys)(NSPredicate *) = ^NSArray<XCUIElement *> *(NSPredicate * predicate) {
    NSPredicate *keysPredicate = [NSPredicate predicateWithFormat:@"elementType == %@", @(XCUIElementTypeKey)];
    XCUIElementQuery *parentView = [[self.keyboard descendantsMatchingType:XCUIElementTypeOther]
                                    containingPredicate:keysPredicate];
    return [[parentView childrenMatchingType:XCUIElementTypeAny]
            matchingPredicate:predicate].allElementsBoundByIndex;
  };

  if (nil != keyNames && keyNames.count > 0) {
    NSPredicate *searchPredicate = [NSPredicate predicateWithBlock:^BOOL(id<FBXCElementSnapshot> snapshot, NSDictionary *bindings) {
      if (snapshot.elementType != XCUIElementTypeKey && snapshot.elementType != XCUIElementTypeButton) {
        return NO;
      }

      return (nil != snapshot.identifier && [keyNames containsObject:snapshot.identifier])
        || (nil != snapshot.label && [keyNames containsObject:snapshot.label]);
    }];
    NSArray *matchedKeys = findMatchingKeys(searchPredicate);
    if (matchedKeys.count > 0) {
      for (XCUIElement *matchedKey in matchedKeys) {
        if (!matchedKey.exists) {
          continue;
        }

        [matchedKey fb_tapWithError:nil];
        if (isKeyboardInvisible()) {
          return YES;
        }
      }
    }
  }
  
  if ([UIDevice.currentDevice userInterfaceIdiom] == UIUserInterfaceIdiomPad) {
    NSPredicate *searchPredicate = [NSPredicate predicateWithFormat:@"elementType IN %@",
                                    @[@(XCUIElementTypeKey), @(XCUIElementTypeButton)]];
    NSArray *matchedKeys = findMatchingKeys(searchPredicate);
    if (matchedKeys.count > 0) {
      [matchedKeys[matchedKeys.count - 1] fb_tapWithError:nil];
    }
  }
#endif
  NSString *errorDescription = @"Did not know how to dismiss the keyboard. Try to dismiss it in the way supported by your application under test.";
  return [[[[FBRunLoopSpinner new]
            timeout:3]
           timeoutErrorMessage:errorDescription]
          spinUntilTrue:isKeyboardInvisible
          error:error];
}

@end
