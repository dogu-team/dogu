package muxer

// ref https://github.com/pion/example-webrtc-applications/blob/master/save-to-webm/main.go

import (
	"os"
	"time"

	"go-device-controller/types/protocol/generated/proto/outer"
	gotypes "go-device-controller/types/types"

	"go-device-controller/internal/pkg/device/surface"
	log "go-device-controller/internal/pkg/log"
	"go-device-controller/internal/pkg/utils"

	"github.com/at-wat/ebml-go/mkvcore"
	"github.com/at-wat/ebml-go/webm"
	"go.uber.org/zap"

	"github.com/pion/rtp"
	"github.com/pion/rtp/codecs"
	"github.com/pion/webrtc/v3"
	"github.com/pion/webrtc/v3/pkg/media/samplebuilder"
)

type WebmMuxer struct {
	id             int
	filePath       string
	videoWriter    webm.BlockWriteCloser
	videoTimestamp time.Duration
	packetizer     rtp.Packetizer
	file           *os.File
	startTime      time.Time

	sampleBuilder *samplebuilder.SampleBuilder
}

var (
	_wm  Muxer                   = &WebmMuxer{}
	_wms surface.SurfaceListener = &WebmMuxer{}
)

func NewWebmMuxer(filePath string) (*WebmMuxer, *outer.ErrorResult) {
	s := WebmMuxer{}
	file, err := utils.OpenFile(filePath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0o600)
	if err != nil {
		return nil, &outer.ErrorResult{Code: outer.Code_CODE_FILESYSTEM_FILE_OPEN_FAILED, Message: err.Error()}
	}
	s.file = file
	s.filePath = filePath

	codecCap := webrtc.RTPCodecCapability{
		MimeType: webrtc.MimeTypeVP8,
	}
	codec := webrtc.RTPCodecParameters{RTPCodecCapability: codecCap}
	payloader := &codecs.VP8Payloader{
		EnablePictureID: true,
	}

	sequencer := rtp.NewRandomSequencer()
	s.packetizer = rtp.NewPacketizer(
		1200,
		0, // Value is handled when writing
		0, // Value is handled when writing
		payloader,
		sequencer,
		codec.ClockRate,
	)
	s.sampleBuilder = samplebuilder.New(30000, &codecs.VP8Packet{}, 90000)
	return &s, gotypes.Success
}

func (s *WebmMuxer) GetId() int {
	return s.id
}

func (s *WebmMuxer) SetId(id int) {
	s.id = id
}

func (s *WebmMuxer) FilePath() string {
	return s.filePath
}

func (s *WebmMuxer) GetSurfaceListenerType() surface.SurfaceListenerType {
	return MuxerType
}

// implement surfacelistener
func (s *WebmMuxer) OnSurface(_ uint32, data []byte) {
	if s.startTime.IsZero() {
		s.startTime = time.Now()
	}
	diffTime := time.Since(s.startTime)
	s.pushVP8(diffTime.Milliseconds(), data)
}

func (s *WebmMuxer) OnRemove() {
	s.close()
}

func (s *WebmMuxer) OnRTPBytes(_ uint32, data []byte) {
	packet := rtp.Packet{}
	if err := packet.Unmarshal(data); err != nil {
		log.Inst.Error("WebmMuxer.OnRTPBytes Failed to unmarshal RTP packet", zap.Error(err))
		return
	}
	s.sampleBuilder.Push(&packet)
	sample := s.sampleBuilder.Pop()
	if nil == sample {
		return
	}
	s.videoTimestamp += sample.Duration
	s.pushVP8(s.videoTimestamp.Milliseconds(), sample.Data)
}

func (s *WebmMuxer) pushVP8(timestamp int64, data []byte) {
	if len(data) < 10 {
		log.Inst.Info("WebmMuxer.pushVP8 Invalid sample data")
		return
	}
	videoKeyframe := (data[0]&0x1 == 0)
	if videoKeyframe {
		raw := uint(data[6]) | uint(data[7])<<8 | uint(data[8])<<16 | uint(data[9])<<24
		width := int(raw & 0x3FFF)
		height := int((raw >> 16) & 0x3FFF)

		if s.videoWriter == nil {
			s.InitWriter(width, height)
		}
	}
	if s.videoWriter != nil {
		if _, err := s.videoWriter.Write(videoKeyframe, timestamp, data); err != nil {
			log.Inst.Error("WebmMuxer.pushVP8 Failed to write video sample", zap.Error(err))
		}
	}
}

func (s *WebmMuxer) InitWriter(width, height int) {
	ws, err := webm.NewSimpleBlockWriter(s.file,
		[]webm.TrackEntry{
			{
				Name:            "Video",
				TrackNumber:     2,
				TrackUID:        67890,
				CodecID:         "V_VP8",
				TrackType:       1,
				DefaultDuration: 33333333,
				Video: &webm.Video{
					PixelWidth:  uint64(width),
					PixelHeight: uint64(height),
				},
			},
		},
		mkvcore.WithSeekHead(true),
	)
	if err != nil {
		log.Inst.Error("WebmMuxer.InitWriter Failed to create webm writer", zap.Error(err))
		return
	}
	log.Inst.Info("WebmMuxer.InitWriter saver has started with video", zap.Int("width", width), zap.Int("height", height))
	s.videoWriter = ws[0]
}

func (s *WebmMuxer) close() {
	log.Inst.Info("WebmMuxer.close Finalizing webm...")
	if s.videoWriter != nil {
		if err := s.videoWriter.Close(); err != nil {
			log.Inst.Error("WebmMuxer.close Failed to close video writer", zap.Error(err))
		}
		s.videoWriter = nil
		s.file = nil // file is closed by videoWriter
	}
	if s.file != nil {
		if err := s.file.Close(); err != nil {
			log.Inst.Error("WebmMuxer.close Failed to close file", zap.Error(err))
		}
		s.file = nil
	}
}
