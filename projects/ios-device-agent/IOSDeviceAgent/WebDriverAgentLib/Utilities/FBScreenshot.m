/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "FBScreenshot.h"

#import <MobileCoreServices/MobileCoreServices.h>

#import "FBConfiguration.h"
#import "FBErrorBuilder.h"
#import "FBImageIOScaler.h"
#import "FBLogger.h"
#import "FBMacros.h"
#import "FBXCodeCompatibility.h"
#import "FBXCTestDaemonsProxy.h"
#import "XCTestManager_ManagerInterface-Protocol.h"
#import "XCUIScreen.h"

static const NSTimeInterval SCREENSHOT_TIMEOUT = 20.;
static const CGFloat SCREENSHOT_SCALE = 1.0;  // Screenshot API should keep the original screen scale
static const CGFloat HIGH_QUALITY = 0.8;
static const CGFloat LOW_QUALITY = 0.25;

NSString *formatTimeInterval(NSTimeInterval interval) {
  NSUInteger milliseconds = (NSUInteger)(interval * 1000);
  return [NSString stringWithFormat:@"%ld ms", milliseconds];
}

@implementation FBScreenshot

+ (BOOL)isNewScreenshotAPISupported
{
  static dispatch_once_t newScreenshotAPISupported;
  static BOOL result;
  dispatch_once(&newScreenshotAPISupported, ^{
    result = [(NSObject *)[FBXCTestDaemonsProxy testRunnerProxy] respondsToSelector:@selector(_XCT_requestScreenshotOfScreenWithID:withRect:uti:compressionQuality:withReply:)];
  });
  return result;
}

+ (CGFloat)compressionQualityWithQuality:(NSUInteger)quality
{
  switch (quality) {
    case 1:
      return HIGH_QUALITY;
    case 2:
      return LOW_QUALITY;
    default:
      return 1.0;
  }
}

+ (NSString *)imageUtiWithQuality:(NSUInteger)quality
{
  switch (quality) {
    case 1:
    case 2:
      return (__bridge id)kUTTypeJPEG;
    default:
      return (__bridge id)kUTTypePNG;
  }
}

+ (NSData *)takeInOriginalResolutionWithQuality:(NSUInteger)quality
                                           rect:(CGRect)rect
                                          error:(NSError **)error
{
  if ([self.class isNewScreenshotAPISupported]) {
    XCUIScreen *mainScreen = XCUIScreen.mainScreen;
    return [self.class takeWithScreenID:mainScreen.displayID
                                  scale:SCREENSHOT_SCALE
                     compressionQuality:[self.class compressionQualityWithQuality:FBConfiguration.screenshotQuality]
                                   rect:rect
                              sourceUTI:[self.class imageUtiWithQuality:FBConfiguration.screenshotQuality]
                                  error:error];
  }

  [[[FBErrorBuilder builder]
         withDescription:@"Screenshots of limited areas are only available for newer OS versions"]
        buildError:error];
  return nil;
}

+ (NSData *)takeInOriginalResolutionWithQuality:(NSUInteger)quality
                                          error:(NSError **)error
{
  if ([self.class isNewScreenshotAPISupported]) {
    XCUIScreen *mainScreen = XCUIScreen.mainScreen;
    return [self.class takeWithScreenID:mainScreen.displayID
                                  scale:SCREENSHOT_SCALE
                     compressionQuality:[self.class compressionQualityWithQuality:FBConfiguration.screenshotQuality]
                                   rect:CGRectNull
                              sourceUTI:[self.class imageUtiWithQuality:FBConfiguration.screenshotQuality]
                                  error:error];
  }

  id<XCTestManager_ManagerInterface> proxy = [FBXCTestDaemonsProxy testRunnerProxy];
  __block NSData *screenshotData = nil;
  __block NSError *innerError = nil;
  dispatch_semaphore_t sem = dispatch_semaphore_create(0);
  [proxy _XCT_requestScreenshotWithReply:^(NSData *data, NSError *screenshotError) {
    if (nil == screenshotError) {
      screenshotData = data;
    } else {
      innerError = screenshotError;
    }
    dispatch_semaphore_signal(sem);
  }];
  if (nil != innerError && error) {
    *error = innerError;
  }
  int64_t timeoutNs = (int64_t)(SCREENSHOT_TIMEOUT * NSEC_PER_SEC);
  if (0 != dispatch_semaphore_wait(sem, dispatch_time(DISPATCH_TIME_NOW, timeoutNs))) {
    [[[FBErrorBuilder builder]
      withDescription:[NSString stringWithFormat:@"Cannot take a screenshot within %@ timeout", formatTimeInterval(SCREENSHOT_TIMEOUT)]]
     buildError:error];
  };
  return screenshotData;
}

+ (NSData *)takeWithScreenID:(long long)screenID
                       scale:(CGFloat)scale
          compressionQuality:(CGFloat)compressionQuality
                        rect:(CGRect)rect
                   sourceUTI:(NSString *)uti
                       error:(NSError **)error
{
  NSData *screenshotData = [self.class takeInOriginalResolutionWithScreenID:screenID
                                                         compressionQuality:compressionQuality
                                                                        uti:uti
                                                                    timeout:SCREENSHOT_TIMEOUT
                                                                      error:error];
  if (nil == screenshotData) {
    return nil;
  }
  return [[[FBImageIOScaler alloc] init] scaledImageWithImage:screenshotData
                                                          uti:(__bridge id)kUTTypePNG
                                                         rect:rect
                                                scalingFactor:1.0 / scale
                                           compressionQuality:FBMaxCompressionQuality
                                                        error:error];
}

+ (NSData *)takeInOriginalResolutionWithScreenID:(long long)screenID
                              compressionQuality:(CGFloat)compressionQuality
                                             uti:(NSString *)uti
                                         timeout:(NSTimeInterval)timeout
                                           error:(NSError **)error
{
  id<XCTestManager_ManagerInterface> proxy = [FBXCTestDaemonsProxy testRunnerProxy];
  __block NSData *screenshotData = nil;
  __block NSError *innerError = nil;
  dispatch_semaphore_t sem = dispatch_semaphore_create(0);
  if ([self.class shouldUseScreenshotRequestApiForProxy:(NSObject *)proxy]) {
    id screnshotRequest = [self.class screenshotRequestWithScreenID:screenID
                                                               rect:CGRectNull
                                                                uti:uti
                                                 compressionQuality:compressionQuality
                                                              error:error];
    if (nil == screnshotRequest) {
      return nil;
    }
    [proxy _XCT_requestScreenshot:screnshotRequest
                        withReply:^(id image, NSError *err) {
      if (nil != err) {
        innerError = err;
      } else {
        screenshotData = [image data];
      }
      dispatch_semaphore_signal(sem);
    }];
  } else {
    [proxy _XCT_requestScreenshotOfScreenWithID:screenID
                                       withRect:CGRectNull
                                            uti:uti
                             compressionQuality:compressionQuality
                                      withReply:^(NSData *data, NSError *err) {
      if (nil != err) {
        innerError = err;
      } else {
        screenshotData = data;
      }
      dispatch_semaphore_signal(sem);
    }];
  }
  int64_t timeoutNs = (int64_t)(timeout * NSEC_PER_SEC);
  if (0 != dispatch_semaphore_wait(sem, dispatch_time(DISPATCH_TIME_NOW, timeoutNs))) {
    NSString *timeoutMsg = [NSString stringWithFormat:@"Cannot take a screenshot within %@ timeout", formatTimeInterval(SCREENSHOT_TIMEOUT)];
    if (nil == error) {
      [FBLogger log:timeoutMsg];
    } else if (nil == innerError) {
      [[[FBErrorBuilder builder]
        withDescription:timeoutMsg]
       buildError:error];
    }
  };
  if (nil != error && nil != innerError) {
    *error = innerError;
  }
  return screenshotData;
}

+ (BOOL)shouldUseScreenshotRequestApiForProxy:(NSObject *)proxy
{
  static dispatch_once_t shouldUseSRApi;
  static BOOL result;
  dispatch_once(&shouldUseSRApi, ^{
    if ([proxy respondsToSelector:@selector(_XCT_requestScreenshot:withReply:)]) {
#if TARGET_OS_SIMULATOR
      // Required to support simulators running iOS 14.4 and below with Xcode 12.5 and above due to unsupported API on the simulator side.
      result = SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(@"14.5");
#else
      result = SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(@"15.0");
#endif
    } else {
      result = NO;
    }
  });
  return result;
}

+ (nullable id)imageEncodingWithUniformTypeIdentifier:(NSString *)uti
                                   compressionQuality:(CGFloat)compressionQuality
                                                error:(NSError **)error
{
  // TODO: Use native accessors after we drop the support of Xcode 12.4 and below
  Class imageEncodingClass = NSClassFromString(@"XCTImageEncoding");
  if (nil == imageEncodingClass) {
    [[[FBErrorBuilder builder]
      withDescription:@"Cannot find XCTImageEncoding class"]
     buildError:error];
    return nil;
  }
  id imageEncodingAllocated = [imageEncodingClass alloc];
  SEL imageEncodingConstructorSelector = NSSelectorFromString(@"initWithUniformTypeIdentifier:compressionQuality:");
  if (![imageEncodingAllocated respondsToSelector:imageEncodingConstructorSelector]) {
    [[[FBErrorBuilder builder]
      withDescription:@"'initWithUniformTypeIdentifier:compressionQuality:' contructor is not found on XCTImageEncoding class"]
     buildError:error];
    return nil;
  }
  NSMethodSignature *imageEncodingContructorSignature = [imageEncodingAllocated methodSignatureForSelector:imageEncodingConstructorSelector];
  NSInvocation *imageEncodingInitInvocation = [NSInvocation invocationWithMethodSignature:imageEncodingContructorSignature];
  [imageEncodingInitInvocation setSelector:imageEncodingConstructorSelector];
  [imageEncodingInitInvocation setArgument:&uti atIndex:2];
  [imageEncodingInitInvocation setArgument:&compressionQuality atIndex:3];
  [imageEncodingInitInvocation invokeWithTarget:imageEncodingAllocated];
  id __unsafe_unretained imageEncoding;
  [imageEncodingInitInvocation getReturnValue:&imageEncoding];
  return imageEncoding;
}

+ (nullable id)screenshotRequestWithScreenID:(long long)screenID
                                        rect:(struct CGRect)rect
                                         uti:(NSString *)uti
                          compressionQuality:(CGFloat)compressionQuality
                                       error:(NSError **)error
{
  // TODO: Use native accessors after we drop the support of Xcode 12.4 and below
  id imageEncoding = [self.class imageEncodingWithUniformTypeIdentifier:uti
                                                     compressionQuality:compressionQuality
                                                                  error:error];
  if (nil == imageEncoding) {
    return nil;
  }

  Class screenshotRequestClass = NSClassFromString(@"XCTScreenshotRequest");
  if (nil == screenshotRequestClass) {
    [[[FBErrorBuilder builder]
      withDescription:@"Cannot find XCTScreenshotRequest class"]
     buildError:error];
    return nil;
  }
  id screenshotRequestAllocated = [screenshotRequestClass alloc];
  SEL screenshotRequestConstructorSelector = NSSelectorFromString(@"initWithScreenID:rect:encoding:");
  if (![screenshotRequestAllocated respondsToSelector:screenshotRequestConstructorSelector]) {
    [[[FBErrorBuilder builder]
      withDescription:@"'initWithScreenID:rect:encoding:' contructor is not found on XCTScreenshotRequest class"]
     buildError:error];
    return nil;
  }
  NSMethodSignature *screenshotRequestContructorSignature = [screenshotRequestAllocated methodSignatureForSelector:screenshotRequestConstructorSelector];
  NSInvocation *screenshotRequestInitInvocation = [NSInvocation invocationWithMethodSignature:screenshotRequestContructorSignature];
  [screenshotRequestInitInvocation setSelector:screenshotRequestConstructorSelector];
  [screenshotRequestInitInvocation setArgument:&screenID atIndex:2];
  [screenshotRequestInitInvocation setArgument:&rect atIndex:3];
  [screenshotRequestInitInvocation setArgument:&imageEncoding atIndex:4];
  [screenshotRequestInitInvocation invokeWithTarget:screenshotRequestAllocated];
  id __unsafe_unretained screenshotRequest;
  [screenshotRequestInitInvocation getReturnValue:&screenshotRequest];
  return screenshotRequest;
}

@end
