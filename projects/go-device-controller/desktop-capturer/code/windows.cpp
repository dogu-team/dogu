#include "windows.h"

#include <algorithm>
#include <chrono>
#include <iostream>
#include <sstream>
#include <string>
#include <thread>
#include <vector>

#if defined(_WIN32)
#define WEBRTC_WIN
#define NOMINMAX
#define WIN32_LEAN_AND_MEAN
#pragma comment(lib, "D3D11.lib")
#pragma comment(lib, "DXGI.lib")
#pragma comment(lib, "Winmm.lib")
#else
#define WEBRTC_POSIX
#define WEBRTC_MAC
#endif // defined(_WIN32 )

#include "modules/desktop_capture/desktop_capture_options.h"
#include "modules/desktop_capture/desktop_capturer.h"
#include "modules/desktop_capture/desktop_frame.h"
#include "modules/desktop_capture/desktop_region.h"

#if defined(_WIN32)
#include "modules/desktop_capture/win/window_list_utils.h"
#elif defined(__APPLE__)
#include "modules/desktop_capture/mac/desktop_configuration.h"
#include "modules/desktop_capture/mac/full_screen_mac_application_handler.h"
#include "modules/desktop_capture/mac/window_list_utils.h"
#else
#error "Unsupported platform."
#endif // defined(_WIN32)

struct WindowInfo
{
    intptr_t id = 0;
    int pid = 0;
    std::string title = "";

    std::string ToJson() const
    {
        std::stringstream ss;
        ss << "{";
        ss << "\"id\":" << id << ",";
        ss << "\"pid\":" << pid << ",";
        ss << "\"title\":\"" << title << "\"";
        ss << "}";
        return ss.str();
    }
};

namespace windows
{
void getInfos(std::string &out)
{
    webrtc::DesktopCaptureOptions option = webrtc::DesktopCaptureOptions::CreateDefault();
    webrtc::DesktopCapturer::SourceList desktop_windows;
    std::unique_ptr<webrtc::DesktopCapturer> capturer = webrtc::DesktopCapturer::CreateWindowCapturer(option);
    capturer->GetSourceList(&desktop_windows);

    std::vector<WindowInfo> infos;
    for (auto &s : desktop_windows)
    {
        WindowInfo info;
        info.id = s.id;
        info.title = s.title;
#if defined(_WIN32)

#elif defined(__APPLE__)
        info.pid = webrtc::GetWindowOwnerPid(uint32_t(s.id));
#else
#error "Unsupported platform."
#endif // defined(_WIN32 )
        infos.push_back(info);
    }

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
} // namespace windows
