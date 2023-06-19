import Foundation

extension Date {
  public var unixTimeMilliseconds: UInt64 {
    return UInt64(self.timeIntervalSince1970 * 1000)
  }
}
