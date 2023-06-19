//
//  tcpClient.cpp
//  webrtc_lib_practice
//
//  Created by jenkins on 2022/12/05.
//

#include "tcpClient.h"

#if !defined(_WIN32)
#include <cstdio>
#include <cstdlib>
#include <arpa/inet.h>
#include <netdb.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <sys/unistd.h>
#include <unistd.h>

void tcperror(const char *err) { printf("[err] %s\n", err); }

TcpClient::TcpClient(std::string url, unsigned short port)
    : url(url), port(port) {}

TcpClient::~TcpClient() { disconnect(); }

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
    exit(2);
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
    exit(3);
  }

  /*
   * Connect to the server.
   */
  if (::connect(s, (struct sockaddr *)&server, sizeof(server)) < 0)
  {
    tcperror("Connect()");
    exit(4);
  }
}

void TcpClient::disconnect() { close(s); }

void TcpClient::send(const uint8_t *data, int size)
{
  if (::send(s, data, size, 0) < 0)
  {
    tcperror("Send()");
    exit(1);
  }
}

void TcpClient::receive() {}
#endif // !defined(_WIN32 )
