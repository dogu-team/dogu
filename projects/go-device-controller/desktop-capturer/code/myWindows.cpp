
#include "myWindows.h"

#include <algorithm>
#include <chrono>
#include <iostream>
#include <string>
#include <thread>
#include <vector>
namespace mywindows
{
void getInfosString(std::vector<WindowInfo> &infos, std::string &out)
{
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
