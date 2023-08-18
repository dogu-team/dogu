//
//  tcpClient.cpp
//  webrtc_lib_practice
//
//  Created by jenkins on 2022/12/05.
//

#include "tcpClient.h"

#if defined(_WIN32)
#include <chrono>
#include <iostream>
#include <cstdio>
#include <cstdlib>
#include <thread>
#include <winsock2.h>
#include <ws2tcpip.h>
#pragma comment(lib, "Ws2_32.lib")

#define LOG(...)                                                                                                                                                                   \
    printf(__VA_ARGS__);                                                                                                                                                           \
    printf("\n");                                                                                                                                                                  \
    fflush(stdout);

const char *getLastErrString()
{
    int lastError = WSAGetLastError();
    static char msgbuf[256];
    msgbuf[0] = '\0';

    FormatMessage(FORMAT_MESSAGE_FROM_SYSTEM, NULL, lastError, MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), (LPTSTR)&msgbuf, sizeof(msgbuf), NULL);
    return msgbuf;
}

void tcperror(const char *err)
{
    std::cerr << "[err] " << err << "no:" << WSAGetLastError() << ", str:" << getLastErrString() << std::endl << std::flush;
}

void delayExit(int code)
{
    std::cout << "delayExit(" << code << ")" << std::endl << std::flush;
    std::this_thread::sleep_for(std::chrono::seconds(2));
    exit(code);
}

TcpClient::TcpClient(std::string url, unsigned short port) : url(url), port(port)
{
}

TcpClient::~TcpClient()
{
    disconnect();
}

void TcpClient::connect()
{
    struct hostent *hostnm;
    SOCKADDR_IN server;

    WSADATA wsa;
    WSAStartup(MAKEWORD(2, 2), &wsa);

    /*
     * The host name is the first argument. Get the server address.
     */
    hostnm = gethostbyname(this->url.c_str());
    if (hostnm == (struct hostent *)0)
    {
        fprintf(stderr, "Gethostbyname failed\n");
        delayExit(2);
    }

    /*
     * Put the server information into the server structure.
     * The port must be put into network byte order.
     */
    server.sin_family = AF_INET;
    server.sin_port = htons(port);
    server.sin_addr.s_addr = *((unsigned long *)hostnm->h_addr);

    /*
     * Get a stream socket.
     */
    if ((s = socket(AF_INET, SOCK_STREAM, 0)) < 0)
    {
        tcperror("Socket()");
        delayExit(3);
    }

    /*
     * Connect to the server.
     */
    if (::connect(s, (struct sockaddr *)&server, sizeof(server)) < 0)
    {
        tcperror("Connect()");
        delayExit(4);
    }
}

void TcpClient::disconnect()
{
    closesocket(s);
    WSACleanup();
}

void TcpClient::send(const uint8_t *data, int size)
{
    if (::send(s, (const char *)data, size, 0) < 0)
    {
        tcperror("Send()");
        delayExit(1);
    }
}

void TcpClient::receive()
{
}
#endif // defined(_WIN32 )
