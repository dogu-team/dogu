#include "tcpClient.h"

#if !defined(_WIN32)
#include <arpa/inet.h>
#include <chrono>
#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <netdb.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <sys/unistd.h>
#include <thread>
#include <unistd.h>

void tcperror(const char *err)
{
    std::cerr << "[err] " << err << std::endl << std::flush;
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
    struct sockaddr_in server;
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
    close(s);
}

void TcpClient::send(const uint8_t *data, int size)
{
    if (::send(s, data, size, 0) < 0)
    {
        tcperror("Send()");
        delayExit(1);
    }
}

void TcpClient::receive()
{
}
#endif // !defined(_WIN32 )
