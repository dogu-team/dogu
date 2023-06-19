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
#import "XCUIApplication+FBTouchAction.h"
#import "FBTestMacros.h"
#import "XCUIDevice+FBRotation.h"
#import "FBRunLoopSpinner.h"
#import "FBXCodeCompatibility.h"

@interface FBAppiumTouchActionsIntegrationTestsPart1 : FBIntegrationTestCase
@end

@interface FBAppiumTouchActionsIntegrationTestsPart2 : FBIntegrationTestCase
@property (nonatomic) XCUIElement *pickerWheel;
@end


@implementation FBAppiumTouchActionsIntegrationTestsPart1

- (void)verifyGesture:(NSArray<NSDictionary<NSString *, id> *> *)gesture orientation:(UIDeviceOrientation)orientation
{
  [[XCUIDevice sharedDevice] fb_setDeviceInterfaceOrientation:orientation];
  NSError *error;
  XCTAssertTrue([self.testedApplication fb_performAppiumTouchActions:gesture elementCache:nil error:&error]);
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
  XCUIElement *dstButton = self.testedApplication.buttons[FBShowAlertButtonName];
  
  NSArray<NSArray<NSDictionary<NSString *, id> *> *> *invalidGestures =
  @[
    // Empty chain
    @[],
    
    // Chain element without 'action' key
    @[@{
        @"options": @{
            @"ms": @100
            }
        },
      ],
    
    // Empty chain because of cancel
    @[@{
        @"action": @"moveTo",
        @"options": @{
            @"ELEMENT": dstButton,
            }
        },
      @{
        @"action": @"cancel"
        },
      ],
    
    // Chain with unknown action
    @[@{
        @"action": @"tapP",
        @"options": @{
            @"ELEMENT": dstButton,
            }
        },
      ],
    
    // Wait without preceeding coordinate
    @[@{
        @"action": @"wait"
        }
      ],

    // Wait with negative duration
    @[@{
        @"action": @"press",
        @"options": @{
            @"x": @1,
            @"y": @1
            }
        },
      @{
        @"action": @"wait",
        @"options": @{
            @"ms": @-1.0
            }
        },
      ],

    // Release without preceeding coordinate
    @[@{
        @"action": @"release"
        },
      @{
        @"action": @"tap",
        @"options": @{
            @"x": @1,
            @"y": @1
            }
        },
      ],

    // Press without coordinates
    @[@{
        @"action": @"press"
        }
      ],

    // longPress with invalid coordinates
    @[@{
        @"action": @"longPress",
        @"options": @{
            @"x": @1
            }
        },
      ],
    
    // longPress with negative duration
    @[@{
        @"action": @"longPress",
        @"options": @{
            @"x": @1,
            @"y": @1,
            @"duration": @-0.01
            }
        },
      ],
    
  ];
  
  for (NSArray<NSDictionary<NSString *, id> *> *invalidGesture in invalidGestures) {
    NSError *error;
    XCTAssertFalse([self.testedApplication fb_performAppiumTouchActions:invalidGesture elementCache:nil error:&error]);
    XCTAssertNotNil(error);
  }
}

- (void)testTap
{
  NSArray<NSDictionary<NSString *, id> *> *gesture =
  @[@{
      @"action": @"tap",
      @"options": @{
          @"ELEMENT": self.testedApplication.buttons[FBShowAlertButtonName]
          }
      }
  ];
  [self verifyGesture:gesture orientation:UIDeviceOrientationPortrait];
}

- (void)testTapByCoordinates
{
  CGRect elementRect = self.testedApplication.buttons[FBShowAlertButtonName].frame;
  CGFloat x = elementRect.origin.x + elementRect.size.width / 2;
  CGFloat y = elementRect.origin.y + elementRect.size.height / 2;
  NSArray<NSDictionary<NSString *, id> *> *gesture =
  @[@{
      @"action": @"tap",
      @"options": @{
          @"x": @(x),
          @"y": @(y)
          }
      }
    ];
  [self verifyGesture:gesture orientation:UIDeviceOrientationPortrait];
}

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
      @"action": @"tap",
      @"options": @{
          @"ELEMENT": self.testedApplication.buttons[FBShowAlertButtonName],
          @"count": @2
          }
      },
  ];
  [self verifyGesture:gesture orientation:UIDeviceOrientationLandscapeLeft];
}

// TODO: UIDeviceOrientationLandscapeRight is not so good in iOS 16? (Especially simulators)
- (void)testPress
{
  if (SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(@"15.0")) {
    // Does not work on iOS 15.0.
    // The same action tap the FBShowAlertButtonName after rotating the screen
    // worked with W3C actions. `.click` action did not work.
    return;
  }

  NSArray<NSDictionary<NSString *, id> *> *gesture =
  @[@{
      @"action": @"press",
      @"options": @{
          @"ELEMENT": self.testedApplication.buttons[FBShowAlertButtonName],
          @"x": @1,
          @"y": @1
          }
      },
    @{
      @"action": @"wait",
      @"options": @{
          @"ms": @300
          }
      },
    @{
      @"action": @"wait",
      @"options": @{
          @"ms": @300
          }
      },
    @{
      @"action": @"wait",
      @"options": @{
          @"ms": @300
          }
      },
    @{
      @"action": @"release"
      }
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
      @"action": @"longPress",
      @"options": @{
          @"x": @(elementFrame.origin.x + 1),
          @"y": @(elementFrame.origin.y + 1),
          @"duration": @5
          }
      },
    @{
      @"action": @"wait",
      @"options": @{
          @"ms": @500
          }
      },
    @{
      @"action": @"release"
      }
  ];
  [self verifyGesture:gesture orientation:orientation];
}

@end


@implementation FBAppiumTouchActionsIntegrationTestsPart2

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
  XCTAssertTrue([self.testedApplication fb_performAppiumTouchActions:gesture elementCache:nil error:&error]);
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
      @"action": @"press",
      @"options": @{
          @"ELEMENT": self.pickerWheel,
          @"x": @(pickerFrame.size.width / 2),
          @"y": @(pickerFrame.size.height / 2),
          }
      },
    @{
      @"action": @"wait",
      @"options": @{
          @"ms": @500,
          }
      },
    @{
      @"action": @"moveTo",
      @"options": @{
          @"ELEMENT": self.pickerWheel,
          @"x": @(pickerFrame.size.width / 2),
          @"y": @(pickerFrame.size.height),
          }
      },
    @{
      @"action": @"release"
      }
  ];
  [self verifyPickerWheelPositionChangeWithGesture:gesture];
}

- (void)testSwipePickerWheelWithRelativeCoordinates
{
  CGRect pickerFrame = self.pickerWheel.frame;
  NSArray<NSDictionary<NSString *, id> *> *gesture =
  @[@{
      @"action": @"press",
      @"options": @{
          @"ELEMENT": self.pickerWheel,
          @"x": @(pickerFrame.size.width / 2),
          @"y": @(pickerFrame.size.height / 2),
          }
      },
    @{
      @"action": @"wait",
      @"options": @{
          @"ms": @500,
          }
      },
    @{
      @"action": @"moveTo",
      @"options": @{
          @"x": @(pickerFrame.origin.x / 2),
          @"y": @(pickerFrame.origin.y),
          }
      },
    @{
      @"action": @"release"
      }
    ];
  [self verifyPickerWheelPositionChangeWithGesture:gesture];
}

- (void)testSwipePickerWheelWithAbsoluteCoordinates
{
  CGRect pickerFrame = self.pickerWheel.frame;
  NSArray<NSDictionary<NSString *, id> *> *gesture =
  @[@{
      @"action": @"longPress",
      @"options": @{
          @"x": @(pickerFrame.origin.x + pickerFrame.size.width / 2),
          @"y": @(pickerFrame.origin.y + pickerFrame.size.height / 2),
          }
      },
    @{
      @"action": @"moveTo",
      @"options": @{
          @"x": @(pickerFrame.origin.x + pickerFrame.size.width / 2),
          @"y": @(pickerFrame.origin.y + pickerFrame.size.height),
          }
      },
    @{
      @"action": @"release"
      }
    ];
  [self verifyPickerWheelPositionChangeWithGesture:gesture];
}

@end

