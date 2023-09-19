//
//  main.cpp
//  webrtc_lib_practice
//
//  Created by Dogu on 2022/12/04.
//

#include "args/args.hxx"
#include "myWindows.h"
#include "mywebrtc.h"
#include "webrtcUtil.h"

#include <iostream>

#if defined(_WIN32)
#include <windows.h>
#endif // defined(_WIN32 )

void StreamingCommand(args::Subparser &parser)
{
    args::ValueFlag<int> port(parser, "port", "port to send vpx packet", {"port"});
    args::ValueFlag<int> width(parser, "width", "width to encode", {"width"}, 0);
    args::ValueFlag<int> height(parser, "height", "height to encode", {"height"}, 0);
    args::ValueFlag<int> fps(parser, "fps", "fps to encode", {"fps"}, 30);
    args::ValueFlag<int> pid(parser, "pid", "pid to capture", {"pid"}, 0);
    try
    {
        parser.Parse();
    }
    catch (args::Help)
    {
        std::cout << parser << std::flush;
        exit(1);
    }
    catch (args::ParseError e)
    {
        std::cerr << e.what() << std::endl;
        std::cerr << parser << std::flush;
        exit(1);
    }
    catch (args::ValidationError e)
    {
        std::cerr << e.what() << std::endl;
        std::cerr << parser << std::flush;
        exit(1);
    }

    if (!port)
    {
        std::cerr << "port is required" << std::endl;
        std::cerr << parser << std::flush;
        exit(1);
    }
    if (!fps || fps.Get() < 1 || fps.Get() > 60)
    {
        std::cerr << "fps is required and must be between 1 and 60" << std::endl;
        std::cerr << parser << std::flush;
        exit(1);
    }
    std::cout << "[DesktopCapturer]\n" << std::flush;
    std::cout << "port: " << port.Get() << std::endl << std::flush;
    std::cout << "width: " << width.Get() << std::endl << std::flush;
    std::cout << "height: " << height.Get() << std::endl << std::flush;
    std::cout << "fps: " << fps.Get() << std::endl << std::flush;
    std::cout << "pid: " << pid.Get() << std::endl << std::flush;

    mywebrtc::prepare(port.Get(), width.Get(), height.Get(), fps.Get(), pid.Get());
    mywebrtc::connect();
    mywebrtc::createEncoder();
    mywebrtc::startCapture();
}

void WindowCommand(args::Subparser &parser)
{
    args::Flag info(parser, "info", "getWindowInfo", {"info"});
    try
    {
        parser.Parse();
    }
    catch (args::Help)
    {
        std::cout << parser << std::flush;
        exit(1);
    }
    catch (args::ParseError e)
    {
        std::cerr << e.what() << std::endl;
        std::cerr << parser << std::flush;
        exit(1);
    }
    catch (args::ValidationError e)
    {
        std::cerr << e.what() << std::endl;
        std::cerr << parser << std::flush;
        exit(1);
    }

    if (info)
    {
        std::string json;
        auto infos = webrtcUtil::getWindowInfos();
        mywindows::getInfosString(infos, json);
        std::cout << json << std::endl << std::flush;
    }
}

int main(int argc, const char *argv[])
{
#if defined(_WIN32)
    SetConsoleOutputCP(CP_UTF8);
    setvbuf(stdout, nullptr, _IONBF, 0);
#endif // defined(_WIN32 )

    args::ArgumentParser parser("Desktopcapturer.", "");
    args::Group commands(parser, "commands");
    args::Command streaming(commands, "streaming", "streaming screen", &StreamingCommand);
    args::Command window(commands, "windows", "gui window features", &WindowCommand);

    args::HelpFlag help(parser, "help", "Display this help menu", {'h', "help"});
    try
    {
        parser.ParseCLI(argc, argv);
    }
    catch (args::Help)
    {
        std::cout << parser << std::flush;
        exit(1);
    }
    catch (args::ParseError e)
    {
        std::cerr << e.what() << std::endl;
        std::cerr << parser << std::flush;
        exit(1);
    }
    catch (args::ValidationError e)
    {
        std::cerr << e.what() << std::endl;
        std::cerr << parser << std::flush;
        exit(1);
    }

    return 0;
}
