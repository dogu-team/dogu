package streamer

import (
	"time"

	"go-device-controller/types/protocol/generated/proto/outer/streaming"

	"go-device-controller/internal/pkg/device/surface"
	log "go-device-controller/internal/pkg/log"

	"go-device-controller/internal/pkg/device"

	"github.com/pion/rtp"
	"github.com/pion/webrtc/v3"
	"go.uber.org/zap"
)

var seqSeed = 1

type Streamer struct {
	id                int
	seq               int
	mediaPeer         webRTCPeer
	serial            string
	deviceServerPort  int32
	param             *streaming.StreamingOffer_StartStreaming
	onTrickleListener func(*streaming.StreamingAnswer)
	devices           *device.Devices
	labeledChannels   []LabeledDatachannel
	isClosed          bool

	// monitor
	sentBytePerPeriod     int
	sentCountPerPeriod    int
	sendMillisecPerPeriod int64

	// rtp packetizer
	packetizer    rtp.Packetizer
	befPacketTime time.Time
}

var (
	_ webRTCPeerListener      = &Streamer{}
	_ surface.SurfaceListener = &Streamer{}
)

func newStreamer(serial string, deviceServerPort int32, param *streaming.StreamingOffer_StartStreaming, devices *device.Devices, onTrickle func(*streaming.StreamingAnswer)) *Streamer {
	streamer := Streamer{}
	streamer.seq = seqSeed
	streamer.param = param
	streamer.serial = serial
	streamer.deviceServerPort = deviceServerPort
	streamer.devices = devices
	streamer.onTrickleListener = onTrickle
	seqSeed += 1
	streamer.isClosed = false
	streamer.befPacketTime = time.Now()

	codec := getVideoParametersByPlatform(param.StartStreaming.Platform)

	sequencer := rtp.NewRandomSequencer()
	streamer.packetizer = rtp.NewPacketizer(
		1200,
		0, // Value is handled when writing
		0, // Value is handled when writing
		getPayloaderByPlatform(param.StartStreaming.Platform),
		sequencer,
		codec.ClockRate,
	)

	log.Inst.Info("Streamer.start ", zap.String("serial", streamer.serial))

	newWebRTCMediaPeer(&streamer.mediaPeer, &streamer, param.StartStreaming.Platform)
	streamer.mediaPeer.start(param)
	return &streamer
}

func (s *Streamer) GetId() int {
	return s.id
}

func (s *Streamer) SetId(id int) {
	s.id = id
}

func (s *Streamer) GetSurfaceListenerType() string {
	return "Streamer"
}

func (s *Streamer) OnRemove() {
	if s.isClosed {
		return
	}
	log.Inst.Info("Streamer.OnRemove")
	s.mediaPeer.stop()
}

func (s *Streamer) onTrickle(answer *streaming.StreamingAnswer) {
	s.onTrickleListener(answer)
}

func (s *Streamer) onWebRTCPeerConnected() {
	log.Inst.Info("Streamer.onWebRTCPeerConnected")

	s.devices.AddSurfaceListener(s.serial, s, s.param.StartStreaming.Option.Screen)
}

func (s *Streamer) onWebRTCPeerDisconnected() {
	log.Inst.Info("Streamer.onWebRTCPeerDisconnected")

	s.devices.RemoveSurfaceListener(s.serial, s)

	s.isClosed = true
}

func (s *Streamer) onDataChannel(d *webrtc.DataChannel) {
	newLabeledDatachannel := newLabeledDatachannel(d, s.devices, s.serial, s.deviceServerPort)
	if newLabeledDatachannel == nil {
		return
	}
}

// implement surfacelistener
func (s *Streamer) OnSurface(timeStamp uint32, data []byte) {
	if s.isClosed {
		return
	}
	s.sentBytePerPeriod += len(data)
	s.sentCountPerPeriod += 1

	funcStartTime := time.Now()

	packets := s.packetizer.Packetize(data, 0)

	for _, p := range packets {
		p.Timestamp = timeStamp
		if err := s.mediaPeer.videoTrack.WriteRTP(p); err != nil {
			log.Inst.Error("streamer.OnSurface failed to write RTP", zap.Error(err))
			return
		}
	}

	funEndTime := time.Now()
	s.befPacketTime = time.Now()
	diffTime := funEndTime.Sub(funcStartTime).Milliseconds()
	s.sendMillisecPerPeriod += diffTime
}

func (s *Streamer) OnRTPBytes(timeStamp uint32, data []byte) {
	if s.isClosed {
		return
	}
	s.sentBytePerPeriod += len(data)
	s.sentCountPerPeriod += 1

	funcStartTime := time.Now()

	if _, err := s.mediaPeer.videoTrack.Write(data); err != nil {
		log.Inst.Error("streamer.OnRTPBytes failed to write RTP", zap.Error(err))
		return
	}

	funEndTime := time.Now()
	s.befPacketTime = time.Now()
	diffTime := funEndTime.Sub(funcStartTime).Milliseconds()
	s.sendMillisecPerPeriod += diffTime
}

func convertSdpTypeFromGoToProto(sdpType webrtc.SDPType) streaming.ProtoRTCSdpType {
	switch sdpType {
	case webrtc.SDPTypeOffer:
		return streaming.ProtoRTCSdpType_PROTO_RTCSDP_TYPE_RTCSDP_TYPE_OFFER
	case webrtc.SDPTypePranswer:
		return streaming.ProtoRTCSdpType_PROTO_RTCSDP_TYPE_RTCSDP_TYPE_PRANSWER
	case webrtc.SDPTypeAnswer:
		return streaming.ProtoRTCSdpType_PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ANSWER
	case webrtc.SDPTypeRollback:
		return streaming.ProtoRTCSdpType_PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ROLLBACK
	default:
		return streaming.ProtoRTCSdpType_PROTO_RTCSDP_TYPE_RTCSDP_TYPE_UNSPECIFIED
	}
}
