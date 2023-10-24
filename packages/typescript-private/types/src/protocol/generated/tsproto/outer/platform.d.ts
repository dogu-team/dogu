export declare enum Platform {
    PLATFORM_UNSPECIFIED = 0,
    PLATFORM_LINUX = 1,
    PLATFORM_MACOS = 10,
    PLATFORM_WINDOWS = 20,
    PLATFORM_ANDROID = 30,
    PLATFORM_IOS = 40,
    PLATFORM_PS4 = 50,
    PLATFORM_XBOX = 60,
    UNRECOGNIZED = -1
}
export declare function platformFromJSON(object: any): Platform;
export declare function platformToJSON(object: Platform): string;
export declare enum Architecture {
    ARCHITECTURE_UNSPECIFIED = 0,
    ARCHITECTURE_X86 = 10,
    ARCHITECTURE_X64 = 20,
    ARCHITECTURE_ARM = 30,
    ARCHITECTURE_ARM64 = 40,
    UNRECOGNIZED = -1
}
export declare function architectureFromJSON(object: any): Architecture;
export declare function architectureToJSON(object: Architecture): string;
