//
//  XCTestUtils.swift
//  IOSDeviceAgentLib
//
//  Copyright © 2023 Dogu. All rights reserved.
//

import XCTest

public final class XCTestUtils {
  static var swizzledOutIdle = false  // Disabling waiting for idle state in UI testing (https://stackoverflow.com/a/45515130)

  public static func disableWaitingIdle(testcase: XCTestCase) {
    if !XCTestUtils.swizzledOutIdle {  // ensure the swizzle only happens once
      let original = class_getInstanceMethod(objc_getClass("XCUIApplicationProcess") as! AnyClass, Selector(("waitForQuiescenceIncludingAnimationsIdle:")))
      let replaced = class_getInstanceMethod(type(of: testcase), #selector(XCTestUtils.replace))
      if nil != original && nil != replaced {
        method_exchangeImplementations(original!, replaced!)
      }

      XCTestUtils.swizzledOutIdle = true
    }
    testcase.continueAfterFailure = false
  }

  @objc func replace() {
    return
  }
}
