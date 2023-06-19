#ifndef MYWEBRTC_H
#define MYWEBRTC_H

namespace mywebrtc
{
    void prepare(int port, int width, int height, int fps);
    void connect();
    void createEncoder();
    void startCapture();
}

#endif /* MYWEBRTC_H */
