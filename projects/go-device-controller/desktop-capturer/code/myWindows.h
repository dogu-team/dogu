#ifndef MYWINDOWS_H
#define MYWINDOWS_H

#include <string>
#include <vector>
#include <sstream>

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
        ss << "\"title\":\"" << title << "\"";
        ss << "}";
        return ss.str();
    }
};


std::vector<WindowInfo> getInfos();
void getInfosString(std::string &out);
} // namespace mywindows

#endif /* MYWINDOWS_H */
