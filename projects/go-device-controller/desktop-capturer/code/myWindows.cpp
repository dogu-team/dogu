
#include "myWindows.h"

#include <algorithm>
#include <chrono>
#include <iostream>
#include <string>
#include <thread>
#include <vector>

#if defined(_WIN32)
#define WEBRTC_WIN
#define NOMINMAX
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#elif defined(__APPLE__)
#define WEBRTC_MAC
#define WEBRTC_POSIX
#else
#define WEBRTC_POSIX
#define WEBRTC_USE_X11
#else
#error "Unsupported OS"
#endif // defined(_WIN32 )

#include "modules/desktop_capture/desktop_capture_options.h"
#include "modules/desktop_capture/desktop_capturer.h"
#include "modules/desktop_capture/desktop_frame.h"
#include "modules/desktop_capture/desktop_region.h"

#if defined(_WIN32)
#include "modules/desktop_capture/win/window_capture_utils.h"
#include "winuser.h"
#pragma comment(lib, "User32.lib")
#elif defined(__APPLE__)
#include "modules/desktop_capture/mac/desktop_configuration.h"
#include "modules/desktop_capture/mac/full_screen_mac_application_handler.h"
#include "modules/desktop_capture/mac/window_list_utils.h"
#elif defined(__linux__)
#include "modules/desktop_capture/linux/x11/window_capturer_x11.h"
#include "modules/desktop_capture/linux/x11/window_list_utils.h"
#else
#error "Unsupported OS"
#endif // defined(_WIN32)

namespace mywindows
{

#if defined(__linux__)
int getWindowPid(::Display *display, ::Window window)
{
    Atom type, property;
    int format;
    unsigned long nitems, bytes_after;
    unsigned char *prop = NULL;

    property = XInternAtom(display, "_NET_WM_PID", False);
    if (!property)
    {
        return 0;
    }

    int status = XGetWindowProperty(display, window, property, 0, 1024, False, AnyPropertyType, &type, &format, &nitems, &bytes_after, &prop);

    if (status != Success)
    {
        return 0;
    }

    if (prop)
    {
        int pid = *((int *)prop);
        XFree(prop);
        return pid;
    }

    return 0;
}
#endif // defined(__linux__)

std::vector<WindowInfo> getInfos()
{
    auto option = webrtc::DesktopCaptureOptions::CreateDefault();
    webrtc::DesktopCapturer::SourceList desktop_windows;
    auto capturer = webrtc::DesktopCapturer::CreateWindowCapturer(option);
    capturer->GetSourceList(&desktop_windows);

    std::vector<WindowInfo> infos;
    for (auto &s : desktop_windows)
    {
        WindowInfo info;
        info.id = s.id;
        info.title = s.title;

#if defined(_WIN32)
        DWORD processId = 0;
        auto threadId = GetWindowThreadProcessId(HWND(s.id), &processId);
        if (0 == threadId)
        {
            std::cout << "GetWindowThreadProcessId failed." << std::endl;
        }
        info.pid = processId;
        webrtc::GetWindowRect(HWND(s.id), &info.rect);
#elif defined(__APPLE__)
        info.pid = webrtc::GetWindowOwnerPid(uint32_t(s.id));
        info.rect = webrtc::GetWindowBounds(uint32_t(s.id));
#elif defined(__linux__)
        info.pid = getWindowPid(option.x_display()->display(), s.id);
        webrtc::GetWindowRect(option.x_display()->display(), s.id, &info.rect);
#else
#error "Unsupported OS"
#endif // defined(_WIN32 )
        infos.push_back(info);
    }

    return infos;
}

void getInfosString(std::string &out)
{
    auto infos = getInfos();

    std::stringstream ss;
    ss << "[";
    for (size_t i = 0; i < infos.size(); i++)
    {
        ss << infos[i].ToJson();
        if (i != infos.size() - 1)
        {
            ss << ",";
        }
    }
    ss << "]";
    out = ss.str();
}
} // namespace mywindows
