//
//  BroadcastPicker.swift
//  DoguDev
//
//  Created by jenkins on 2023/05/31.
//  Copyright © 2023 Dogu. All rights reserved.
//

import Foundation
import ReplayKit
import SwiftUI

struct BroadcastPicker: UIViewRepresentable {
  @State private var view: RPSystemBroadcastPickerView

  init() {
    view = RPSystemBroadcastPickerView(frame: CGRect(x: 0, y: 0, width: 300, height: 300))
    view.preferredExtension = "com.dogu.IOSDeviceAgentRunner.DoguScreen"
    view.showsMicrophoneButton = false
  }

  func makeUIView(context: Context) -> RPSystemBroadcastPickerView {
    return view
  }

  func updateUIView(_ uiView: RPSystemBroadcastPickerView, context: Context) {
    // Optional: You can customize the picker view properties here
    
  }

  func clickButtonInSubview() {
    guard let button = view.subviews.first(where: { $0 is UIButton }) as? UIButton else {
      NSLog("BroadcastPicker. button null")
      return
    }
    button.sendActions(for: .touchUpInside)
  }

  func findAllButtonsInView(view: UIView) -> [UIButton] {
    var buttons = [UIButton]()

    if let button = view as? UIButton {
      buttons += [button]
    }

    for subview in view.subviews {
      buttons += findAllButtonsInView(view: subview)
    }

    return buttons
  }

}
