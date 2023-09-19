#ifndef WEBRTC_IMPORTS_H
#define WEBRTC_IMPORTS_H

#if defined(_WIN32)
#define WEBRTC_WIN
#define NOMINMAX
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#pragma comment(lib, "D3D11.lib")
#pragma comment(lib, "DXGI.lib")
#pragma comment(lib, "Winmm.lib")
#elif defined(__APPLE__)
#define WEBRTC_MAC
#define WEBRTC_POSIX
#elif defined(__linux__)
#define WEBRTC_POSIX
#define WEBRTC_USE_X11
#else
#error "Unsupported OS"
#endif // defined(_WIN32 )

#endif /* WEBRTC_IMPORTS_H */