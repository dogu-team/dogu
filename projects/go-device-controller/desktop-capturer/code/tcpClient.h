#ifndef TCPCLIENT_H
#define TCPCLIENT_H

#include <cstdio>
#include <string>

class TcpClient
{
  public:
    TcpClient(std::string url, unsigned short port);
    ~TcpClient();

    void connect();
    void disconnect();
    void send(const uint8_t *data, int size);
    void receive();

  private:
    std::string url;
    unsigned short port;
    int s;
};
#endif /* TCPCLIENT_H */
