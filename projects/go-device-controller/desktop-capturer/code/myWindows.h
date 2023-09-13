#ifndef MYWINDOWS_H
#define MYWINDOWS_H

#include <sstream>
#include <string>
#include <vector>

#include "modules/desktop_capture/desktop_geometry.h"

namespace mywindows
{

struct WindowInfo
{
    intptr_t id = 0;
    intptr_t pid = 0;
    std::string title = "";
    webrtc::DesktopRect rect;

    std::string ToJson() const
    {
        std::stringstream ss;
        ss << "{";
        ss << "\"id\":" << id << ",";
        ss << "\"pid\":" << pid << ",";
        ss << "\"title\":\"" << title << ",";
        ss << "\"width\":\"" << rect.size().width() << ",";
        ss << "\"height\":\"" << rect.size().height() << "\"";
        ss << "}";
        return ss.str();
    }
};

std::vector<WindowInfo> getInfos();
void getInfosString(std::string &out);
} // namespace mywindows

#endif /* MYWINDOWS_H */
