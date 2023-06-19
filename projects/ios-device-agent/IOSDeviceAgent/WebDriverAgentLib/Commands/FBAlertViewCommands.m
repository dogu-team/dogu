/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "FBAlertViewCommands.h"

#import "FBAlert.h"
#import "FBApplication.h"
#import "FBRouteRequest.h"
#import "FBSession.h"

@implementation FBAlertViewCommands

#pragma mark - <FBCommandHandler>

+ (NSArray *)routes
{
  return
  @[
    [[FBRoute GET:@"/alert/text"] respondWithTarget:self action:@selector(handleAlertGetTextCommand:)],
    [[FBRoute GET:@"/alert/text"].withoutSession respondWithTarget:self action:@selector(handleAlertGetTextCommand:)],
    [[FBRoute POST:@"/alert/text"] respondWithTarget:self action:@selector(handleAlertSetTextCommand:)],
    [[FBRoute POST:@"/alert/accept"] respondWithTarget:self action:@selector(handleAlertAcceptCommand:)],
    [[FBRoute POST:@"/alert/accept"].withoutSession respondWithTarget:self action:@selector(handleAlertAcceptCommand:)],
    [[FBRoute POST:@"/alert/dismiss"] respondWithTarget:self action:@selector(handleAlertDismissCommand:)],
    [[FBRoute POST:@"/alert/dismiss"].withoutSession respondWithTarget:self action:@selector(handleAlertDismissCommand:)],
    [[FBRoute GET:@"/wda/alert/buttons"] respondWithTarget:self action:@selector(handleGetAlertButtonsCommand:)],
  ];
}


#pragma mark - Commands

+ (id<FBResponsePayload>)handleAlertGetTextCommand:(FBRouteRequest *)request
{
  FBApplication *application = request.session.activeApplication ?: FBApplication.fb_activeApplication;
  NSString *alertText = [FBAlert alertWithApplication:application].text;
  if (!alertText) {
    return FBResponseWithStatus([FBCommandStatus noAlertOpenErrorWithMessage:nil
                                                                   traceback:nil]);
  }
  return FBResponseWithObject(alertText);
}

+ (id<FBResponsePayload>)handleAlertSetTextCommand:(FBRouteRequest *)request
{
  FBSession *session = request.session;
  id value = request.arguments[@"value"];
  if (!value) {
    return FBResponseWithStatus([FBCommandStatus invalidArgumentErrorWithMessage:@"Missing 'value' parameter" traceback:nil]);
  }
  FBAlert *alert = [FBAlert alertWithApplication:session.activeApplication];
  if (!alert.isPresent) {
    return FBResponseWithStatus([FBCommandStatus noAlertOpenErrorWithMessage:nil
                                                                   traceback:nil]);
  }
  NSString *textToType = value;
  if ([value isKindOfClass:[NSArray class]]) {
    textToType = [value componentsJoinedByString:@""];
  }
  NSError *error;
  if (![alert typeText:textToType error:&error]) {
    return FBResponseWithStatus([FBCommandStatus unsupportedOperationErrorWithMessage:error.description
                                                                            traceback:[NSString stringWithFormat:@"%@", NSThread.callStackSymbols]]);
  }
  return FBResponseWithOK();
}

+ (id<FBResponsePayload>)handleAlertAcceptCommand:(FBRouteRequest *)request
{
  FBApplication *application = request.session.activeApplication ?: FBApplication.fb_activeApplication;
  NSString *name = request.arguments[@"name"];
  FBAlert *alert = [FBAlert alertWithApplication:application];
  NSError *error;

  if (!alert.isPresent) {
    return FBResponseWithStatus([FBCommandStatus noAlertOpenErrorWithMessage:nil
                                                                   traceback:nil]);
  }
  if (name) {
    if (![alert clickAlertButton:name error:&error]) {
      return FBResponseWithStatus([FBCommandStatus invalidElementStateErrorWithMessage:error.description
                                                                             traceback:[NSString stringWithFormat:@"%@", NSThread.callStackSymbols]]);
    }
  } else if (![alert acceptWithError:&error]) {
    return FBResponseWithStatus([FBCommandStatus invalidElementStateErrorWithMessage:error.description
                                                                            traceback:[NSString stringWithFormat:@"%@", NSThread.callStackSymbols]]);
  }
  return FBResponseWithOK();
}

+ (id<FBResponsePayload>)handleAlertDismissCommand:(FBRouteRequest *)request
{
  FBApplication *application = request.session.activeApplication ?: FBApplication.fb_activeApplication;
  NSString *name = request.arguments[@"name"];
  FBAlert *alert = [FBAlert alertWithApplication:application];
  NSError *error;
    
  if (!alert.isPresent) {
    return FBResponseWithStatus([FBCommandStatus noAlertOpenErrorWithMessage:nil
                                                                   traceback:nil]);
  }
  if (name) {
    if (![alert clickAlertButton:name error:&error]) {
      return FBResponseWithStatus([FBCommandStatus invalidElementStateErrorWithMessage:error.description
                                                                            traceback:[NSString stringWithFormat:@"%@", NSThread.callStackSymbols]]);
    }
  } else if (![alert dismissWithError:&error]) {
    return FBResponseWithStatus([FBCommandStatus invalidElementStateErrorWithMessage:error.description
                                                                            traceback:[NSString stringWithFormat:@"%@", NSThread.callStackSymbols]]);
  }
  return FBResponseWithOK();
}

+ (id<FBResponsePayload>)handleGetAlertButtonsCommand:(FBRouteRequest *)request {
  FBSession *session = request.session;
  FBAlert *alert = [FBAlert alertWithApplication:session.activeApplication];

  if (!alert.isPresent) {
    return FBResponseWithStatus([FBCommandStatus noAlertOpenErrorWithMessage:nil
                                                                   traceback:nil]);
  }
  NSArray *labels = alert.buttonLabels;
  return FBResponseWithObject(labels);
}
@end
