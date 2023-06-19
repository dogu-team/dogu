/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "FBXCAXClientProxy.h"

#import <objc/runtime.h>

#import "FBXCAccessibilityElement.h"
#import "FBConfiguration.h"
#import "FBLogger.h"
#import "FBMacros.h"
#import "FBReflectionUtils.h"
#import "XCAXClient_iOS.h"
#import "XCUIDevice.h"

static id FBAXClient = nil;

@implementation XCAXClient_iOS (WebDriverAgent)

/**
 Parameters for traversing elements tree from parents to children while requesting XCElementSnapshot.

 @return dictionary with parameters for element's snapshot request
 */
- (NSDictionary *)fb_getParametersForElementSnapshot
{
  return FBConfiguration.snapshotRequestParameters;
}

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-load-method"

+ (void)load
{
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    SEL originalParametersSelector = @selector(defaultParameters);
    SEL swizzledParametersSelector = @selector(fb_getParametersForElementSnapshot);
    FBReplaceMethod([self class], originalParametersSelector, swizzledParametersSelector);
  });
}

#pragma clang diagnostic pop

@end

@implementation FBXCAXClientProxy

+ (instancetype)sharedClient
{
  static FBXCAXClientProxy *instance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    instance = [[self alloc] init];
    FBAXClient = [XCUIDevice.sharedDevice accessibilityInterface];
  });
  return instance;
}

- (BOOL)setAXTimeout:(NSTimeInterval)timeout error:(NSError **)error
{
  return [FBAXClient _setAXTimeout:timeout error:error];
}

- (id<FBXCElementSnapshot>)snapshotForElement:(id<FBXCAccessibilityElement>)element
                                   attributes:(NSArray<NSString *> *)attributes
                                     maxDepth:(nullable NSNumber *)maxDepth
                                        error:(NSError **)error
{
  NSMutableDictionary *parameters = [[NSMutableDictionary alloc] init];
  // Mimicking XCTest framework behavior (this attribute is added by default unless it is an excludingNonModalElements query)
  // See https://github.com/appium/WebDriverAgent/pull/523
  if (SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(@"13.0")) {
    parameters[@"snapshotKeyHonorModalViews"] = @(NO);
  }
  if (nil != maxDepth) {
    [parameters addEntriesFromDictionary:self.defaultParameters];
    parameters[FBSnapshotMaxDepthKey] = maxDepth;
  }

  id result = [FBAXClient requestSnapshotForElement:element
                                         attributes:attributes
                                         parameters:[parameters copy]
                                              error:error];
  id<FBXCElementSnapshot> snapshot = [result valueForKey:@"_rootElementSnapshot"];
  return nil == snapshot ? result : snapshot;
}

- (NSArray<id<FBXCAccessibilityElement>> *)activeApplications
{
  return [FBAXClient activeApplications];
}

- (id<FBXCAccessibilityElement>)systemApplication
{
  return [FBAXClient systemApplication];
}

- (NSDictionary *)defaultParameters
{
  return [FBAXClient defaultParameters];
}

- (void)notifyWhenNoAnimationsAreActiveForApplication:(XCUIApplication *)application
                                                reply:(void (^)(void))reply
{
  [FBAXClient notifyWhenNoAnimationsAreActiveForApplication:application reply:reply];
}

- (NSDictionary *)attributesForElement:(id<FBXCAccessibilityElement>)element
                            attributes:(NSArray *)attributes
{
  NSError *error = nil;
  NSDictionary* result = [FBAXClient attributesForElement:element
                                               attributes:attributes
                                                    error:&error];
  if (error) {
    [FBLogger logFmt:@"Cannot retrieve element attribute(s) %@. Original error: %@", attributes, error.description];
  }
  return result;
}

- (XCUIApplication *)monitoredApplicationWithProcessIdentifier:(int)pid
{
  return [[FBAXClient applicationProcessTracker] monitoredApplicationWithProcessIdentifier:pid];
}

@end
