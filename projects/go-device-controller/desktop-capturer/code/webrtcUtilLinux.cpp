#if defined(__linux__)
#include "myWindows.h"
#include "webrtcUtil.h"

#include <algorithm>
#include <chrono>
#include <iostream>
#include <string>
#include <thread>
#include <vector>

#define WEBRTC_POSIX
#define WEBRTC_USE_X11

#include "modules/desktop_capture/desktop_capture_options.h"
#include "modules/desktop_capture/desktop_capturer.h"
#include "modules/desktop_capture/desktop_frame.h"
#include "modules/desktop_capture/desktop_region.h"

#include "modules/desktop_capture/linux/x11/window_capturer_x11.h"
#include "modules/desktop_capture/linux/x11/window_list_utils.h"

namespace webrtcUtil
{

void applyCaptureOptions(webrtc::DesktopCaptureOptions &option)
{
}

void onCaptureLoop()
{
}

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

std::vector<mywindows::WindowInfo> getWindowInfos()
{
    auto option = webrtc::DesktopCaptureOptions::CreateDefault();
    webrtc::DesktopCapturer::SourceList desktop_windows;
    auto capturer = webrtc::DesktopCapturer::CreateWindowCapturer(option);
    capturer->GetSourceList(&desktop_windows);

    std::vector<mywindows::WindowInfo> infos;
    for (auto &s : desktop_windows)
    {
        mywindows::WindowInfo info;
        info.id = s.id;
        info.title = s.title;

        info.pid = getWindowPid(option.x_display()->display(), s.id);
        webrtc::GetWindowRect(option.x_display()->display(), s.id, &info.rect);
        infos.push_back(info);
    }

    return infos;
}
} // namespace webrtcUtil

#endif // defined(__linux__)