//
//  InputBlocker.swift
//  IOSDeviceAgentLib
//
//  Created by jenkins on 2023/11/02.
//  Copyright © 2023 Dogu. All rights reserved.
//
import Combine
import WebDriverAgentLib

class InputBlocker {
  enum Error: Swift.Error {
    case sessionNotFound
  }

  private var config: Config
  private let webDriverClient: WebDriverClient
  private let period: TimeInterval = 1.0 / 3
  private var timer: Cancellable? = nil
  var isAppBlocked: Bool = false

  init(config: Config, webDriverClient: WebDriverClient) {
    self.config = config
    self.webDriverClient = webDriverClient
    self.startTimer()
  }

  func close() throws {
    timer?.cancel()
  }

  private func startTimer() {
    let callGuard = DuplicatedCallGuarder()

    timer = Timer.publish(every: period, on: .main, in: .default)
      .autoconnect()
      .sink { currentTime in
        Task.catchable(
          {
            try await callGuard.guardCall {
              let isBlocked = try await self.blockApp()
              self.isAppBlocked = isBlocked
            }
          },
          catch: {
            Log.shared.debug("handling failed. \($0)")
          })
      }
  }

  @MainActor
  func blockTap(position: CGPoint) async throws -> Bool {
    let apps = XCUIApplication.fb_activeAppsInfo()
    let isSpringboard = apps.contains(where: { app in
      guard let bundleId = app["bundleId"] as? String else {
        return false
      }
      return Constants.SpringboardBundleId == bundleId
    })
    if !isSpringboard {
      return false
    }

    try await self.webDriverClient.setSessionIfNotSet()
    guard let session = FBSession.active() else {
      throw Error.sessionNotFound
    }
    let addWidget: XCUIElement = session.activeApplication.buttons["Add Widget"]
    if !addWidget.exists {
      return false
    }
    let widgetFrame = addWidget.frame

    if widgetFrame.minX < position.x && position.x < widgetFrame.maxX && widgetFrame.minY < position.y && position.y < widgetFrame.maxY {
      return true
    }
    return false
  }

  @MainActor
  private func blockApp() async throws -> Bool {
    if !self.config.isDeviceShare {
      return false
    }
    let apps = XCUIApplication.fb_activeAppsInfo()
    for app in apps {
      guard let bundleId = app["bundleId"] as? String else {
        return false
      }
      if Constants.SpringboardBundleId == bundleId {
        return try await blockOnSpringboard()
      }
      if Constants.BlockAppBundleIds.contains(where: { $0 == bundleId }) {
        try await self.webDriverClient.setSessionIfNotSet()
        guard let session = FBSession.active() else {
          throw Error.sessionNotFound
        }
        session.terminateApplication(withBundleId: bundleId)
        return true
      }
    }

    return false
  }

  @MainActor
  private func blockOnSpringboard() async throws -> Bool {
    if !self.config.isDeviceShare {
      return false
    }

    try await self.webDriverClient.setSessionIfNotSet()
    guard let session = FBSession.active() else {
      throw Error.sessionNotFound
    }
    if try await self.blockControlCenter(app: session.activeApplication) {
      return true
    }

    if try await self.blockRemoveApp(app: session.activeApplication) {
      return true
    }

    return false
  }

  @MainActor
  private func blockControlCenter(app: FBApplication) async throws -> Bool {
    let controlCenterView: XCUIElement = app.otherElements["ControlCenterView"]
    if !controlCenterView.exists {
      return false
    }
    try await webDriverClient.homescreen()
    try await webDriverClient.homescreen()

    return true
  }

  @MainActor
  private func blockRemoveApp(app: FBApplication) async throws -> Bool {
    let removeButton: XCUIElement = app.buttons["Delete App"]
    if !removeButton.exists {
      return false
    }
    try await webDriverClient.homescreen()
    try await webDriverClient.homescreen()

    return true
  }

}
