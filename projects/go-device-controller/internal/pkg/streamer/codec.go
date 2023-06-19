package streamer

import (
	"go-device-controller/types/protocol/generated/proto/outer"

	"github.com/pion/rtp"
	"github.com/pion/rtp/codecs"
	"github.com/pion/webrtc/v3"
)

func getCapabilityByPlatform(platform outer.Platform) webrtc.RTPCodecCapability {
	switch platform {
	case outer.Platform_PLATFORM_IOS:
		return webrtc.RTPCodecCapability{
			MimeType:    webrtc.MimeTypeH264,
			ClockRate:   90000,
			Channels:    0,
			SDPFmtpLine: "level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f",
		}
	default:
		return webrtc.RTPCodecCapability{
			MimeType:  webrtc.MimeTypeVP8,
			ClockRate: 90000,
		}
	}
}

func getPayloaderByPlatform(platform outer.Platform) rtp.Payloader {
	switch platform {
	case outer.Platform_PLATFORM_IOS:
		return &codecs.H264Payloader{}
	default:
		return &codecs.VP8Payloader{
			EnablePictureID: true,
		}
	}
}

func getVideoParametersByPlatform(platform outer.Platform) webrtc.RTPCodecParameters {
	switch platform {
	case outer.Platform_PLATFORM_IOS:
		return webrtc.RTPCodecParameters{
			RTPCodecCapability: getCapabilityByPlatform(platform),
			PayloadType:        98,
		}
	default:
		return webrtc.RTPCodecParameters{
			RTPCodecCapability: getCapabilityByPlatform(platform),
			PayloadType:        96,
		}
	}
}
