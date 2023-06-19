//
//  ContentView.swift
//  IOSDeviceAgentApp
//
//  Created by hunhoe kim on 2022/12/07.
//  Copyright © 2022 Dogu. All rights reserved.
//

import ReplayKit
import SwiftUI

struct ContentView: View {

  var body: some View {
    VStack {
      let picker = BroadcastPicker()
      picker.onAppear {
        picker.clickButtonInSubview()
      }
    }
    .padding()
  }
}

struct ContentView_Previews: PreviewProvider {
  static var previews: some View {
    ContentView()
  }
}
