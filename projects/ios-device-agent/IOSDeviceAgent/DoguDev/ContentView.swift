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
