public func currentPlatform() -> Outer_Platform{
  #if os(macOS)
    return .macos
  #elseif os(iOS)
    return .ios
  #elseif os(Linux)
    return .linux
  #elseif os(Windows)
    return .windows
  #else
    return .unspecified
  #endif
}

public func currentArchitecture() -> Outer_Architecture {
  #if arch(arm64)
    return .arm64
  #elseif arch(x86_64)
    return .x64
  #else
    return .unspecified
  #endif
}
