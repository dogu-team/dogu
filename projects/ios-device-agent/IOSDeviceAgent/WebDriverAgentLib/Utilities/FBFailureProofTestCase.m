/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "FBFailureProofTestCase.h"

#import "FBExceptions.h"
#import "FBLogger.h"
#import "FBXCTestCaseImplementationFailureHoldingProxy.h"

@interface FBFailureProofTestCase ()
@property (nonatomic, assign) BOOL didRegisterAXTestFailure;
@end

@implementation FBFailureProofTestCase

- (void)setUp
{
  [super setUp];
  self.continueAfterFailure = YES;
  // https://github.com/appium/appium/issues/13949
  self.shouldSetShouldHaltWhenReceivesControl = NO;
  self.shouldHaltWhenReceivesControl = NO;
}


/**
 Override 'recordFailureWithDescription' to not stop by failures.
 */
- (void)recordFailureWithDescription:(NSString *)description
                              inFile:(NSString *)filePath
                              atLine:(NSUInteger)lineNumber
                            expected:(BOOL)expected
{
  [self _enqueueFailureWithDescription:description inFile:filePath atLine:lineNumber expected:expected];
}

/**
 Private XCTestCase method used to block and tunnel failure messages
 */
- (void)_enqueueFailureWithDescription:(NSString *)description
                                inFile:(NSString *)filePath
                                atLine:(NSUInteger)lineNumber
                              expected:(BOOL)expected
{
  [FBLogger logFmt:@"Enqueue Failure: %@ %@ %lu %d", description, filePath, (unsigned long)lineNumber, expected];
  const BOOL isPossibleDeadlock = ([description rangeOfString:@"Failed to get refreshed snapshot"].location != NSNotFound);
  if (!isPossibleDeadlock) {
    self.didRegisterAXTestFailure = YES;
  }
  else if (self.didRegisterAXTestFailure) {
    self.didRegisterAXTestFailure = NO; // Reseting to NO to enable future deadlock detection
    [[NSException exceptionWithName:FBApplicationDeadlockDetectedException
                             reason:@"Can't communicate with deadlocked application"
                           userInfo:nil]
     raise];
  }
}

@end
