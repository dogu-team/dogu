#include "mywebrtc.h"
#include "tcpClient.h"

#include <chrono>
#include <iostream>
#include <thread>

#if defined(_WIN32)
#define WEBRTC_WIN
#define NOMINMAX
#define WIN32_LEAN_AND_MEAN
#pragma comment(lib, "D3D11.lib")
#pragma comment(lib, "DXGI.lib")
#pragma comment(lib, "Winmm.lib")
#else
#define WEBRTC_POSIX
#define WEBRTC_MAC
#endif // defined(_WIN32 )

#include "media/engine/internal_encoder_factory.h"
#include "media/engine/simulcast_encoder_adapter.h"
#include "modules/video_coding/codecs/vp8/libvpx_vp8_encoder.h"

#include "absl/strings/string_view.h"
#include "api/video/i420_buffer.h"
#include "api/video_codecs/builtin_video_encoder_factory.h"
#include "api/video_codecs/video_encoder.h"
#include "api/video_codecs/vp8_temporal_layers.h"
#include "common_video/libyuv/include/webrtc_libyuv.h"
#include "libyuv.h"
#include "modules/video_coding/codecs/interface/libvpx_interface.h"
#include "modules/video_coding/codecs/vp8/include/vp8.h"
#include "modules/video_coding/codecs/vp8/libvpx_vp8_encoder.h"
#include "modules/video_coding/include/video_codec_interface.h"
#include "modules/video_coding/utility/vp8_header_parser.h"
#include "rtc_base/logging.h"
#include "rtc_base/time_utils.h"

#include "modules/desktop_capture/desktop_capture_options.h"
#include "modules/desktop_capture/desktop_capturer.h"
#include "modules/desktop_capture/desktop_frame.h"
#include "modules/desktop_capture/desktop_region.h"

#ifdef WEBRTC_MAC
#include "modules/desktop_capture/mac/desktop_configuration.h"
#include "modules/desktop_capture/mac/full_screen_mac_application_handler.h"
#endif

#include "call/rtp_transport_controller_send.h"
#include "modules/rtp_rtcp/include/rtp_rtcp_defines.h"
#include "modules/rtp_rtcp/source/byte_io.h"
#include "modules/rtp_rtcp/source/rtcp_packet/nack.h"
#include "modules/rtp_rtcp/source/rtp_dependency_descriptor_extension.h"
#include "modules/rtp_rtcp/source/rtp_packet.h"
#include "modules/video_coding/fec_controller_default.h"
#include "modules/video_coding/include/video_codec_interface.h"
#include "rtc_base/rate_limiter.h"

namespace trace
{
long long sendCount = 500;
long long sentSize = 0;
std::chrono::time_point<std::chrono::system_clock> befTime = std::chrono::system_clock::now();

void traceSend(const uint32_t size)
{
    trace::sendCount += 1;
    trace::sentSize += size;
    if (500 < trace::sendCount)
    {
        auto elapsedTime = std::chrono::system_clock::now() - trace::befTime;
        auto elapsedMSec = std::chrono::duration_cast<std::chrono::milliseconds>(elapsedTime);
        auto sendPerSec = float(trace::sendCount) / float(elapsedMSec.count()) * 1000.0f;
        auto sentSizePerSec = float(trace::sentSize) / float(elapsedMSec.count()) * 1000.0f / 1024.0f / 1024.0f;
        std::cout << "[DesktopCapturer] count: " << sendPerSec << ", size: " << sentSizePerSec << "MB/s\n" << std::flush;
        trace::sendCount = 0;
        trace::sentSize = 0;
        trace::befTime = std::chrono::system_clock::now();
    }
}

} // namespace trace

namespace mywebrtc
{
int g_port;
int g_width;
int g_height;
int g_fps;
int g_frameDeltaMs;
int g_moderatedframeDeltaMs;

std::unique_ptr<webrtc::VideoEncoder> g_encoder;
std::unique_ptr<webrtc::DesktopCapturer> g_capturer;
TcpClient *g_tcpClient = nullptr;
int g_remainFrameMillisecPerPeriod = 0;
int g_frameCountPerPeriod = 0;

class EncodedImageCallback : public webrtc::EncodedImageCallback
{
  public:
    Result OnEncodedImage(const webrtc::EncodedImage &encoded_image, const webrtc::CodecSpecificInfo *codec_specific_info) override
    {
        // std::cout << " OnEncodedImage. tid: " <<
        // std::this_thread::get_id() << ", size: " << encoded_image.size()
        // << "\n";

        if (encoded_image._frameType == webrtc::VideoFrameType::kVideoFrameKey)
        {
            // std::cout << "KeyFrame "
            //           << " size: " << encoded_image.size() << "\n"
            //           << std::flush;
        }

        callback_count_++;
        countPerSec += 1;

        uint32_t imageSize = encoded_image.size();
        trace::traceSend(imageSize);

        buffer_.resize(imageSize + 4);
        memcpy(buffer_.data(), &imageSize, 4);
        memcpy(buffer_.data() + 4, encoded_image.data(), imageSize);
        g_tcpClient->send(buffer_.data(), imageSize + 4);
        buffer_.clear();

        return webrtc::EncodedImageCallback::Result(webrtc::EncodedImageCallback::Result::OK, callback_count_);
    }
    int callback_count_ = 0;
    int countPerSec = 0;
    std::vector<uint8_t> buffer_;
    std::chrono::time_point<std::chrono::system_clock> befTime_;
};

class CaptureCallback : public webrtc::DesktopCapturer::Callback
{
  protected:
    // Called after a frame has been captured. `frame` is not nullptr if and
    // only if `result` is SUCCESS.
    // https://source.chromium.org/chromium/chromium/src/+/main:content/browser/media/capture/desktop_capture_device.cc;drc=f80a91731a1071561e39a430adc2afc4aee8443e
    void OnCaptureResult(webrtc::DesktopCapturer::Result result, std::unique_ptr<webrtc::DesktopFrame> frame) override
    {
        //            std::cout << " OnCapture :" << std::this_thread::get_id() <<
        //            "\n";
        if (result != webrtc::DesktopCapturer::Result::SUCCESS)
        {
            return;
        }

        int width = frame->size().width();
        int height = frame->size().height();

        if (frame->size().width() <= 1 || frame->size().height() <= 1)
        {
            std::cout << " Empty desktop \n" << std::flush;
            return;
        }

        output_frame_ = std::make_unique<webrtc::BasicDesktopFrame>(webrtc::DesktopSize(g_width, g_height));

        libyuv::ARGBScale(frame->data(), frame->stride(), frame->size().width(), frame->size().height(), output_frame_->GetFrameDataAtPos(webrtc::DesktopVector(0, 0)),
                          output_frame_->stride(), output_frame_->size().width(), output_frame_->size().height(), libyuv::kFilterBilinear);

        if (!i420_buffer_.get() || i420_buffer_->width() * i420_buffer_->height() < g_width * g_height)
        {
            i420_buffer_ = webrtc::I420Buffer::Create(g_width, g_height);
        }

        const int convertResult =
            libyuv::ConvertToI420(output_frame_->data(), 0, i420_buffer_->MutableDataY(), i420_buffer_->StrideY(), i420_buffer_->MutableDataU(), i420_buffer_->StrideU(),
                                  i420_buffer_->MutableDataV(), i420_buffer_->StrideV(), 0, 0, g_width, g_height, g_width, g_height, libyuv::kRotate0, libyuv::FOURCC_ARGB);
        if (convertResult < 0)
        {
            std::cout << "Failed to convert capture frame from type to I420.\n" << std::flush;
        }

        webrtc::VideoFrame videoFrame = webrtc::VideoFrame(i420_buffer_, 0, 0, webrtc::kVideoRotation_0);
        std::vector<webrtc::VideoFrameType> frame_types = {};

        // encode
        int encodeError = g_encoder->Encode(videoFrame, &frame_types);
        if (0 != encodeError)
        {
            std::cout << " Encode Error." << encodeError << "\n" << std::flush;
        }

        count += 1;
    }

    virtual ~CaptureCallback()
    {
    }

    int count = 0;
    std::unique_ptr<webrtc::DesktopFrame> output_frame_;
    rtc::scoped_refptr<webrtc::I420Buffer> i420_buffer_;
};

void prepare(int port, int width, int height, int fps)
{
    g_port = port;
    g_width = width & ~1;
    g_height = height & ~1;
    g_fps = fps;

    g_frameDeltaMs = (int)(1000 / g_fps);
    g_moderatedframeDeltaMs = g_frameDeltaMs;
}

void connect()
{
    g_tcpClient = new TcpClient("127.0.0.1", g_port);
    g_tcpClient->connect();
}

void createEncoder()
{
    auto vpxInterface = webrtc::LibvpxInterface::Create();
    g_encoder = std::make_unique<webrtc::LibvpxVp8Encoder>(std::move(vpxInterface), webrtc::VP8Encoder::Settings());
    webrtc::VideoCodec codec_settings_;

    codec_settings_.mode = webrtc::VideoCodecMode::kScreensharing;
    codec_settings_.maxFramerate = g_fps;
    codec_settings_.startBitrate = 90000;
    codec_settings_.maxBitrate = 90000;
    codec_settings_.width = g_width;
    codec_settings_.height = g_height;
    codec_settings_.qpMax = 20;
    codec_settings_.SetVideoEncoderComplexity(webrtc::VideoCodecComplexity::kComplexityNormal);
    codec_settings_.VP8()->numberOfTemporalLayers = 1;
    codec_settings_.VP8()->denoisingOn = true;
    codec_settings_.VP8()->automaticResizeOn = false;
    codec_settings_.VP8()->frameDroppingOn = true;
    codec_settings_.VP8()->keyFrameInterval = g_fps * 2;

    const webrtc::VideoEncoder::Capabilities capabilities(false);
    const webrtc::VideoEncoder::Settings settings(capabilities, 2, 1440);

    int encodeError = g_encoder->InitEncode(&codec_settings_, settings);
    if (0 != encodeError)
    {
        std::cout << " InitEncode Error." << encodeError << "\n" << std::flush;
    }
    g_encoder->RegisterEncodeCompleteCallback(new EncodedImageCallback());
}

void checkFrameDeltaPerPeriod(long long remainFrameDeltaMillisec)
{
    g_remainFrameMillisecPerPeriod += remainFrameDeltaMillisec;
    g_frameCountPerPeriod += 1;
}

void modifyFrameDeltaPerPeriod(std::chrono::system_clock::time_point &periodStartTime)
{
    auto periodEndTime = std::chrono::system_clock::now();
    auto periodElapsedSec = periodEndTime - periodStartTime;
    auto periodElapsedMilisec = std::chrono::duration_cast<std::chrono::milliseconds>(periodElapsedSec);
    if (1000 < periodElapsedMilisec.count())
    {
        auto remainFrameDeltaPerPeriodMillisec = g_remainFrameMillisecPerPeriod / g_frameCountPerPeriod;
        if (g_moderatedframeDeltaMs * 0.3 < std::abs(remainFrameDeltaPerPeriodMillisec))
        {
            auto befFrameDeltaMs = g_moderatedframeDeltaMs;
            if (0 < remainFrameDeltaPerPeriodMillisec)
            {
                g_moderatedframeDeltaMs += -1 * remainFrameDeltaPerPeriodMillisec * 0.5;
            }
            else
            {
                g_moderatedframeDeltaMs += -1 * remainFrameDeltaPerPeriodMillisec * 0.5;
            }
            g_moderatedframeDeltaMs = std::min(200, g_moderatedframeDeltaMs);
            g_moderatedframeDeltaMs = std::max(33, g_moderatedframeDeltaMs);
            g_moderatedframeDeltaMs = std::max(g_frameDeltaMs, g_moderatedframeDeltaMs);
            if (befFrameDeltaMs != g_moderatedframeDeltaMs)
            {
                std::cout << "frameDeltaMs changed: " << befFrameDeltaMs << " -> " << g_moderatedframeDeltaMs << "\n" << std::flush;
            }
        }
        g_remainFrameMillisecPerPeriod = 0;
        g_frameCountPerPeriod = 0;
        periodStartTime = std::chrono::system_clock::now();
    }
}

void startCapture()
{
    webrtc::DesktopCaptureOptions option = webrtc::DesktopCaptureOptions::CreateDefault();
#ifdef WEBRTC_MAC
    option.set_allow_iosurface(true);
#endif

    webrtc::DesktopCapturer::SourceList desktop_screens;

    g_capturer = webrtc::DesktopCapturer::CreateScreenCapturer(option);
    g_capturer->GetSourceList(&desktop_screens);
    for (auto &s : desktop_screens)
    {
        std::cout << "screen: " << s.id << " -> " << s.title << "\n" << std::flush;
    }
    g_capturer->SelectSource(desktop_screens[0].id);

    CaptureCallback *callback = new CaptureCallback();
    g_capturer->Start(callback);

    std::chrono::time_point<std::chrono::system_clock> frameStartTime = std::chrono::system_clock::now();
    std::chrono::time_point<std::chrono::system_clock> periodStartTime = std::chrono::system_clock::now();
    while (true)
    {
        //            std::cout << " CaptureFrame :" << std::this_thread::get_id()
        //            << "\n";
        // https://groups.google.com/g/discuss-webrtc/c/VsX5YrPmEmE
#ifdef WEBRTC_MAC
        CFRunLoopRunInMode(kCFRunLoopDefaultMode, 0, true);
#endif

        g_capturer->CaptureFrame();

        auto frameEndTime = std::chrono::system_clock::now();
        auto frameElapsedSec = frameEndTime - frameStartTime;
        auto frameElapsedMilisec = std::chrono::duration_cast<std::chrono::milliseconds>(frameElapsedSec);
        checkFrameDeltaPerPeriod(g_moderatedframeDeltaMs - frameElapsedMilisec.count());
        long long remainFrameDeltaMillisec = g_moderatedframeDeltaMs - frameElapsedMilisec.count();
        if (1 < remainFrameDeltaMillisec)
        {
            std::this_thread::sleep_for(std::chrono::milliseconds(remainFrameDeltaMillisec - 1));
        }
        modifyFrameDeltaPerPeriod(periodStartTime);

        frameStartTime = std::chrono::system_clock::now();
    }
}

} // namespace mywebrtc
