
#if defined(_WIN32)
#include "myWindows.h"
#include "webrtcUtil.h"

#include <algorithm>
#include <chrono>
#include <iostream>
#include <string>
#include <thread>
#include <vector>

#include "modules/desktop_capture/desktop_capture_options.h"
#include "modules/desktop_capture/desktop_capturer.h"
#include "modules/desktop_capture/desktop_frame.h"
#include "modules/desktop_capture/desktop_region.h"

#include "modules/desktop_capture/win/window_capture_utils.h"
#include "winuser.h"
#pragma comment(lib, "User32.lib")

namespace webrtcUtil
{

void applyCaptureOptions(webrtc::DesktopCaptureOptions &option)
{
}

void onCaptureLoop()
{
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

        DWORD processId = 0;
        auto threadId = GetWindowThreadProcessId(HWND(s.id), &processId);
        if (0 == threadId)
        {
            std::cout << "GetWindowThreadProcessId failed." << std::endl;
        }
        info.pid = processId;
        webrtc::GetWindowRect(HWND(s.id), &info.rect);
        infos.push_back(info);
    }

    return infos;
}
} // namespace webrtcUtil

#endif // defined(_WIN32 )