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

#import "XCUIElement.h"
#import "XCUIDevice.h"
#import "XCUIApplication+FBTouchAction.h"
#import "FBTestMacros.h"
#import "XCUIDevice+FBRotation.h"
#import "FBRunLoopSpinner.h"
#import "FBXCodeCompatibility.h"

@interface FBW3CTouchActionsIntegrationTestsPart1 : FBIntegrationTestCase
@end

@interface FBW3CTouchActionsIntegrationTestsPart2 : FBIntegrationTestCase
@property (nonatomic) XCUIElement *pickerWheel;
@end


@implementation FBW3CTouchActionsIntegrationTestsPart1

- (void)verifyGesture:(NSArray<NSDictionary<NSString *, id> *> *)gesture orientation:(UIDeviceOrientation)orientation
{
  [[XCUIDevice sharedDevice] fb_setDeviceInterfaceOrientation:orientation];
  NSError *error;
  XCTAssertTrue([self.testedApplication fb_performW3CActions:gesture elementCache:nil error:&error]);
  FBAssertWaitTillBecomesTrue(self.testedApplication.alerts.count > 0);
}

- (void)setUp
{
  [super setUp];
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    [self launchApplication];
    [self goToAlertsPage];
  });
  [self clearAlert];
}

- (void)tearDown
{
  [self clearAlert];
  [self resetOrientation];
  [super tearDown];
}

- (void)testErroneousGestures
{
  NSArray<NSArray<NSDictionary<NSString *, id> *> *> *invalidGestures =
  @[
    // Empty chain
    @[],
    
    // Chain element without 'actions' key
    @[@{
        @"type": @"pointer",
        @"id": @"finger1",
        @"parameters": @{@"pointerType": @"touch"},
        },
      ],
    
    // Chain element with empty 'actions'
    @[@{
        @"type": @"pointer",
        @"id": @"finger1",
        @"parameters": @{@"pointerType": @"touch"},
        @"actions": @[],
        },
      ],
    
    // Chain element without type
    @[@{
        @"id": @"finger1",
        @"parameters": @{@"pointerType": @"touch"},
        @"actions": @[
            @{@"type": @"pointerMove", @"duration": @0, @"x": @100, @"y": @100},
            ],
        },
      ],
    
    // Chain element without id
    @[@{
        @"type": @"pointer",
        @"parameters": @{@"pointerType": @"touch"},
        @"actions": @[
            @{@"type": @"pointerMove", @"duration": @0, @"x": @100, @"y": @100},
            ],
        },
      ],
    
    // Chain element with empty id
    @[@{
        @"type": @"pointer",
        @"id": @"",
        @"parameters": @{@"pointerType": @"touch"},
        @"actions": @[
            @{@"type": @"pointerMove", @"duration": @0, @"x": @100, @"y": @100},
            ],
        },
      ],
    
    // Chain element with unsupported type
    @[@{
        @"type": @"key",
        @"id": @"finger1",
        @"parameters": @{@"pointerType": @"touch"},
        @"actions": @[
            @{@"type": @"pointerMove", @"duration": @0, @"x": @100, @"y": @100},
            ],
        },
      ],
    
    // Chain element with unsupported pointerType (default)
    @[@{
        @"type": @"pointer",
        @"id": @"finger1",
        @"actions": @[
            @{@"type": @"pointerMove", @"duration": @0, @"x": @100, @"y": @100},
            ],
        },
      ],
 
    // Chain element with unsupported pointerType (non-default)
    @[@{
        @"type": @"pointer",
        @"id": @"finger1",
        @"parameters": @{@"pointerType": @"pen"},
        @"actions": @[
            @{@"type": @"pointerMove", @"duration": @0, @"x": @100, @"y": @100},
            ],
        },
      ],
    
    // Chain element without action item type
    @[@{
        @"type": @"pointer",
        @"id": @"finger1",
        @"parameters": @{@"pointerType": @"touch"},
        @"actions": @[
            @{@"duration": @0, @"x": @1, @"y": @1},
            @{@"type": @"pointerDown"},
            @{@"type": @"pause", @"duration": @100},
            @{@"type": @"pointerUp"},
            ],
        },
      ],

    // Chain element with singe up action
    @[@{
        @"type": @"pointer",
        @"id": @"finger1",
        @"parameters": @{@"pointerType": @"touch"},
        @"actions": @[
            @{@"type": @"pointerUp"},
            ],
        },
      ],
    
    // Chain element containing action item without y coordinate
    @[@{
        @"type": @"pointer",
        @"id": @"finger1",
        @"parameters": @{@"pointerType": @"touch"},
        @"actions": @[
            @{@"type": @"pointerMove", @"duration": @0, @"x": @1},
            @{@"type": @"pointerDown"},
            @{@"type": @"pause", @"duration": @100},
            @{@"type": @"pointerUp"},
            ],
        },
      ],
    
    // Chain element containing action item with an unknown type
    @[@{
        @"type": @"pointer",
        @"id": @"finger1",
        @"parameters": @{@"pointerType": @"touch"},
        @"actions": @[
            @{@"type": @"pointerMoved", @"duration": @0, @"x": @1, @"y": @1},
            @{@"type": @"pointerDown"},
            @{@"type": @"pause", @"duration": @100},
            @{@"type": @"pointerUp"},
            ],
        },
      ],
    
    // Chain element where action items start with an incorrect item
    @[@{
        @"type": @"pointer",
        @"id": @"finger1",
        @"parameters": @{@"pointerType": @"touch"},
        @"actions": @[
            @{@"type": @"pause", @"duration": @100},
            @{@"type": @"pointerMove", @"duration": @0, @"x": @1, @"y": @1},
            @{@"type": @"pointerDown"},
            @{@"type": @"pause", @"duration": @100},
            @{@"type": @"pointerUp"},
            ],
        },
      ],
    
    // Chain element where pointerMove action item does not contain coordinates
    @[@{
        @"type": @"pointer",
        @"id": @"finger1",
        @"parameters": @{@"pointerType": @"touch"},
        @"actions": @[
            @{@"type": @"pointerMove", @"duration": @0},
            @{@"type": @"pointerDown"},
            @{@"type": @"pause", @"duration": @100},
            @{@"type": @"pointerUp"},
            ],
        },
      ],
    
    // Chain element where pointerMove action item cannot use coordinates of the previous item
    @[@{
        @"type": @"pointer",
        @"id": @"finger1",
        @"parameters": @{@"pointerType": @"touch"},
        @"actions": @[
            @{@"type": @"pointerMove", @"duration": @0, @"origin": @"pointer"},
            @{@"type": @"pointerDown"},
            @{@"type": @"pause", @"duration": @100},
            @{@"type": @"pointerUp"},
            ],
        },
      ],
    
    // Chain element where action items contains negative duration
    @[@{
        @"type": @"pointer",
        @"id": @"finger1",
        @"parameters": @{@"pointerType": @"touch"},
        @"actions": @[
            @{@"type": @"pointerMove", @"duration": @0, @"x": @1, @"y": @1},
            @{@"type": @"pointerDown"},
            @{@"type": @"pause", @"duration": @-100},
            @{@"type": @"pointerUp"},
            ],
        },
      ],
    
    // Chain element where action items start with an incorrect one, because the correct one is canceled
    @[@{
        @"type": @"pointer",
        @"id": @"finger1",
        @"parameters": @{@"pointerType": @"touch"},
        @"actions": @[
            @{@"type": @"pointerMove", @"duration": @0, @"x": @1, @"y": @1},
            @{@"type": @"pointerCancel"},
            @{@"type": @"pointerDown"},
            @{@"type": @"pause", @"duration": @-100},
            @{@"type": @"pointerUp"},
            ],
        },
      ],
    
    ];
  
  for (NSArray<NSDictionary<NSString *, id> *> *invalidGesture in invalidGestures) {
    NSError *error;
    XCTAssertFalse([self.testedApplication fb_performW3CActions:invalidGesture elementCache:nil error:&error]);
    XCTAssertNotNil(error);
  }
}

- (void)testTap
{
  NSArray<NSDictionary<NSString *, id> *> *gesture =
  @[@{
      @"type": @"pointer",
      @"id": @"finger1",
      @"parameters": @{@"pointerType": @"touch"},
      @"actions": @[
          @{@"type": @"pointerMove", @"duration": @0, @"origin": self.testedApplication.buttons[FBShowAlertButtonName], @"x": @0, @"y": @0},
          @{@"type": @"pointerDown"},
          @{@"type": @"pause", @"duration": @100},
          @{@"type": @"pointerUp"},
          ],
      },
    ];
  [self verifyGesture:gesture orientation:UIDeviceOrientationPortrait];
}

// TODO: UIDeviceOrientationLandscapeLeft did not work in iOS 16 simumlator.
// UIDeviceOrientationPortrait was ok.
- (void)testDoubleTap
{
  if ([UIDevice.currentDevice userInterfaceIdiom] == UIUserInterfaceIdiomPad &&
      SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(@"15.0")) {
    // "tap the element" does not work on iPadOS simulator after change the rotation in iOS 15
    // while selecting the element worked. (I confirmed with getting an element screenshot that
    // the FBShowAlertButtonName was actually selected after changing the orientation.)
    return;
  }

  NSArray<NSDictionary<NSString *, id> *> *gesture =
  @[@{
      @"type": @"pointer",
      @"id": @"finger1",
      @"parameters": @{@"pointerType": @"touch"},
      @"actions": @[
          @{@"type": @"pointerMove", @"duration": @0, @"origin": self.testedApplication.buttons[FBShowAlertButtonName]},
          @{@"type": @"pointerDown"},
          @{@"type": @"pause", @"duration": @50},
          @{@"type": @"pointerUp"},
          @{@"type": @"pause", @"duration": @200},
          @{@"type": @"pointerDown"},
          @{@"type": @"pause", @"duration": @50},
          @{@"type": @"pointerUp"},
          ],
      },
    ];
  [self verifyGesture:gesture orientation:UIDeviceOrientationLandscapeLeft];
}

// TODO: UIDeviceOrientationLandscapeRight did not work in iOS 16 simumlator.
// UIDeviceOrientationPortrait was ok.
- (void)testLongPressWithCombinedPause
{
  if (SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(@"15.0")) {
    // Xcode 13 x iOS 14 also does not work while Xcode 12.5 x iOS 14 worked.
    // Skip this test for iOS 15 since iOS 15 works with Xcode 13 at least.
    return;
  }


  NSArray<NSDictionary<NSString *, id> *> *gesture =
  @[@{
      @"type": @"pointer",
      @"id": @"finger1",
      @"parameters": @{@"pointerType": @"touch"},
      @"actions": @[
          @{@"type": @"pointerMove", @"duration": @0, @"origin": self.testedApplication.buttons[FBShowAlertButtonName], @"x": @5, @"y": @5},
          @{@"type": @"pointerDown"},
          @{@"type": @"pause", @"duration": @200},
          @{@"type": @"pause", @"duration": @200},
          @{@"type": @"pause", @"duration": @100},
          @{@"type": @"pointerUp"},
          ],
      },
    ];
  [self verifyGesture:gesture orientation:UIDeviceOrientationLandscapeRight];
}

- (void)testLongPress
{
  UIDeviceOrientation orientation = UIDeviceOrientationLandscapeLeft;
  [[XCUIDevice sharedDevice] fb_setDeviceInterfaceOrientation:orientation];
  CGRect elementFrame = self.testedApplication.buttons[FBShowAlertButtonName].frame;
  NSArray<NSDictionary<NSString *, id> *> *gesture =
  @[@{
      @"type": @"pointer",
      @"id": @"finger1",
      @"parameters": @{@"pointerType": @"touch"},
      @"actions": @[
          @{@"type": @"pointerMove", @"duration": @0, @"x": @(elementFrame.origin.x + 1), @"y": @(elementFrame.origin.y + 1)},
          @{@"type": @"pointerDown"},
          @{@"type": @"pause", @"duration": @500},
          @{@"type": @"pointerUp"},
          ],
      },
    ];
  [self verifyGesture:gesture orientation:orientation];
}

- (void)testForceTap
{
  if (![XCUIDevice.sharedDevice supportsPressureInteraction]) {
    return;
  }

  NSArray<NSDictionary<NSString *, id> *> *gesture =
  @[@{
      @"type": @"pointer",
      @"id": @"finger1",
      @"parameters": @{@"pointerType": @"touch"},
      @"actions": @[
          @{@"type": @"pointerMove", @"duration": @0, @"origin": self.testedApplication.buttons[FBShowAlertButtonName]},
          @{@"type": @"pointerDown"},
          @{@"type": @"pause", @"duration": @500},
          @{@"type": @"pointerDown", @"pressure": @1.0},
          @{@"type": @"pause", @"duration": @50},
          @{@"type": @"pointerDown", @"pressure": @1.0},
          @{@"type": @"pause", @"duration": @50},
          @{@"type": @"pointerUp"},
          ],
      },
    ];
  [self verifyGesture:gesture orientation:UIDeviceOrientationLandscapeLeft];
}

@end


@implementation FBW3CTouchActionsIntegrationTestsPart2

- (void)setUp
{
  [super setUp];
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    [self launchApplication];
    [self goToAttributesPage];
  });
  self.pickerWheel = self.testedApplication.pickerWheels.fb_firstMatch;
}

- (void)tearDown
{
  [self resetOrientation];
  [super tearDown];
}

- (void)verifyPickerWheelPositionChangeWithGesture:(NSArray<NSDictionary<NSString *, id> *> *)gesture
{
  NSString *previousValue = self.pickerWheel.value;
  NSError *error;
  XCTAssertTrue([self.testedApplication fb_performW3CActions:gesture elementCache:nil error:&error]);
  XCTAssertNil(error);
  XCTAssertTrue([[[[FBRunLoopSpinner new]
                   timeout:2.0]
                  timeoutErrorMessage:@"Picker wheel value has not been changed after 2 seconds timeout"]
                 spinUntilTrue:^BOOL{
                   return ![self.pickerWheel.fb_takeSnapshot.value isEqualToString:previousValue];
                 }
                 error:&error]);
  XCTAssertNil(error);
}

- (void)testSwipePickerWheelWithElementCoordinates
{
  CGRect pickerFrame = self.pickerWheel.frame;
  NSArray<NSDictionary<NSString *, id> *> *gesture =
  @[@{
      @"type": @"pointer",
      @"id": @"finger1",
      @"parameters": @{@"pointerType": @"touch"},
      @"actions": @[
          @{@"type": @"pointerMove", @"duration": @0, @"origin": self.pickerWheel, @"x": @0, @"y":@0},
          @{@"type": @"pointerDown"},
          @{@"type": @"pointerMove", @"duration": @500, @"origin": self.pickerWheel, @"x": @0, @"y": @(pickerFrame.size.height / 2)},
          @{@"type": @"pointerUp"},
          ],
      },
    ];
  [self verifyPickerWheelPositionChangeWithGesture:gesture];
}

- (void)testSwipePickerWheelWithRelativeCoordinates
{
  CGRect pickerFrame = self.pickerWheel.frame;
  NSArray<NSDictionary<NSString *, id> *> *gesture =
  @[@{
      @"type": @"pointer",
      @"id": @"finger1",
      @"parameters": @{@"pointerType": @"touch"},
      @"actions": @[
          @{@"type": @"pointerMove", @"duration": @250, @"origin": self.pickerWheel, @"x": @0, @"y": @0},
          @{@"type": @"pointerDown"},
          @{@"type": @"pointerMove", @"duration": @500, @"origin": @"pointer", @"x": @0, @"y": @(-pickerFrame.size.height / 2)},
          @{@"type": @"pointerUp"},
          ],
      },
    ];
  [self verifyPickerWheelPositionChangeWithGesture:gesture];
}

- (void)testSwipePickerWheelWithAbsoluteCoordinates
{
  CGRect pickerFrame = self.pickerWheel.frame;
  NSArray<NSDictionary<NSString *, id> *> *gesture =
  @[@{
      @"type": @"pointer",
      @"id": @"finger1",
      @"parameters": @{@"pointerType": @"touch"},
      @"actions": @[
          @{@"type": @"pointerMove", @"duration": @0, @"x": @(pickerFrame.origin.x + pickerFrame.size.width / 2), @"y": @(pickerFrame.origin.y + pickerFrame.size.height / 2)},
          @{@"type": @"pointerDown"},
          @{@"type": @"pointerMove", @"duration": @500, @"origin": @"pointer", @"x": @0, @"y": @(pickerFrame.size.height / 2)},
          @{@"type": @"pointerUp"},
          ],
      },
    ];
  [self verifyPickerWheelPositionChangeWithGesture:gesture];
}

@end


