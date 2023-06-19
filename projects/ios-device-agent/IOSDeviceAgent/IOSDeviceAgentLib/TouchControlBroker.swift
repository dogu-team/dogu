import DoguTypes

actor TouchControlBroker: IControlBroker {
  typealias Control = PatternControl
  typealias PatternKey = TouchControlPatternKey
  typealias PatternGroup = TouchControlPatternGroup

  var pattern: NSRegularExpression? = nil
  var controls: [Control] = []

  func open(with param: ControlOpenParam) throws {
    pattern = try NSRegularExpression(pattern: "(?<\(PatternGroup.down.rawValue)>d+)m*(?<\(PatternGroup.up.rawValue)>u+)")
  }

  func close() throws {}

  func push(with control: Control) {
    controls.append(control)
  }

  func popByPattern(after lastPlayTime: UInt64) throws -> DownUp? {
    guard !controls.isEmpty else {
      return nil
    }
    discard(before: lastPlayTime)

    let sequence = controls.map { $0.patternKey }.joined()
    guard let match = self.pattern!.firstMatch(in: sequence, range: NSRange(location: 0, length: sequence.utf16.count)) else {
      discard(before: .down)
      return nil
    }

    try validate(at: match)
    return try pop(by: match)
  }

  private func discard(before lastPlayTime: UInt64) {
    guard let playAfterIndex = controls.firstIndex(where: { $0.control.timeStamp > lastPlayTime }) else {
      return
    }
    Array(controls[0..<playAfterIndex]).forEach({$0.discardNotify()})
    controls = Array(controls[playAfterIndex..<controls.count])
  }

  private func discard(before patternKey: PatternKey) {
    guard let downIndex = controls.firstIndex(where: { $0.patternKey == patternKey.rawValue }) else {
      controls.forEach({$0.discardNotify()})
      controls = []
      return
    }
    Array(controls[0..<downIndex]).forEach({$0.discardNotify()})
    controls = Array(controls[downIndex..<controls.count])
  }

  private func pop(by match: NSTextCheckingResult) throws -> DownUp {
    let downRange = match.range(withName: PatternGroup.down.rawValue)
    guard downRange.length > 0 else {
      throw ControlError.downNotFound
    }
    let firstDownIndex = downRange.location
    let downControl = controls[firstDownIndex]

    let upRange = match.range(withName: PatternGroup.up.rawValue)
    guard upRange.length > 0 else {
      throw ControlError.upNotFound
    }
    let lastUpIndex = upRange.location + upRange.length - 1
    let upControl = controls[lastUpIndex]

    let afterIndex = match.range.location + match.range.length
    Array(controls[firstDownIndex + 1..<lastUpIndex]).forEach({$0.discardNotify()})
    controls = Array(controls[afterIndex..<controls.count])
    return DownUp(down: downControl, up: upControl)
  }

  private func validate(at match: NSTextCheckingResult) throws {
    let range = match.range
    guard range.location < controls.count else {
      throw ControlError.outOfRange(range.location)
    }
    guard (range.location + range.length) <= controls.count else {
      throw ControlError.outOfRange(range.length)
    }

    let downRange = match.range(withName: PatternGroup.down.rawValue)
    guard downRange.location < controls.count else {
      throw ControlError.outOfRange(downRange.location)
    }
    guard (downRange.location + downRange.length) <= controls.count else {
      throw ControlError.outOfRange(downRange.length)
    }

    let upRange = match.range(withName: PatternGroup.up.rawValue)
    guard upRange.location < controls.count else {
      throw ControlError.outOfRange(upRange.location)
    }
    guard (upRange.location + upRange.length) <= controls.count else {
      throw ControlError.outOfRange(upRange.length)
    }
  }
}
