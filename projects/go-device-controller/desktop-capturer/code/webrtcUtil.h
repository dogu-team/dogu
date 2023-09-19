#ifndef WEBRTC_UTIL_H
#define WEBRTC_UTIL_H

#include "myWindows.h"
#include "webrtcImports.h"

#include "modules/desktop_capture/desktop_capture_options.h"

#include <cstdio>
#include <string>

namespace webrtcUtil
{
void applyCaptureOptions(webrtc::DesktopCaptureOptions &option);
void onCaptureLoop();
std::vector<mywindows::WindowInfo> getWindowInfos();

} // namespace webrtcUtil

#endif /* WEBRTC_UTIL_H */
