
#if defined(__APPLE__)
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

#include "modules/desktop_capture/mac/desktop_configuration.h"
#include "modules/desktop_capture/mac/full_screen_mac_application_handler.h"
#include "modules/desktop_capture/mac/window_list_utils.h"


namespace webrtcUtil
{

void applyCaptureOptions(webrtc::DesktopCaptureOptions &option)
{
    option.set_allow_iosurface(true);
}

void onCaptureLoop()
{
    CFRunLoopRunInMode(kCFRunLoopDefaultMode, 0, true);
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

        info.pid = webrtc::GetWindowOwnerPid(uint32_t(s.id));
        info.rect = webrtc::GetWindowBounds(uint32_t(s.id));
        infos.push_back(info);
    }

    return infos;
}

} // namespace webrtcUtil

#endif // defined(__APPLE__)
