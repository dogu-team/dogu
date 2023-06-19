extension Outer_Platform {
  public func toNodeJSPlatform() -> String {
    switch self {
    case .linux: return "linux"
    case .macos: return "darwin"
    case .windows: return "win32"
    case .android, .ios, .ps4, .xbox, .unspecified, .UNRECOGNIZED(_): fallthrough
    @unknown default: return "unspecified"
    }
  }

  public static func fromNodeJSPlatform(_ platform: String) -> Outer_Platform {
    switch platform {
    case "linux": return .linux
    case "darwin": return .macos
    case "win32": return .windows
    default: return .unspecified
    }
  }
}

extension Outer_Architecture {
  public func toNodeJSArchitecture() -> String {
    switch self {
    case .x86: return "ia32"
    case .x64: return "x64"
    case .arm: return "arm"
    case .arm64: return "arm64"
    case .unspecified, .UNRECOGNIZED(_): fallthrough
    @unknown default: return "unspecified"
    }
  }

  public static func fromNodeJSArchitecture(_ architecture: String) -> Outer_Architecture {
    switch architecture {
    case "ia32": return .x86
    case "x64": return .x64
    case "arm": return .arm
    case "arm64": return .arm64
    default: return .unspecified
    }
  }
}
