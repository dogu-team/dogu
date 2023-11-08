import Foundation

struct StreamingOption: Decodable {
  var type: String = ""
  var maxFps = 30
  var maxResolution = 720
}
