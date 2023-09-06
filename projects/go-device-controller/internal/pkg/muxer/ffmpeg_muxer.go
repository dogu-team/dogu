package muxer

// ref https://github.com/pion/example-webrtc-applications/blob/master/save-to-webm/main.go

import (
	"fmt"
	"net"
	"os"
	"os/exec"
	"strings"
	"time"

	"go-device-controller/types/protocol/generated/proto/inner/types"
	"go-device-controller/types/protocol/generated/proto/outer"
	gotypes "go-device-controller/types/types"

	"go-device-controller/internal/pkg/args"
	"go-device-controller/internal/pkg/device/surface"
	log "go-device-controller/internal/pkg/log"
	"go-device-controller/internal/pkg/utils"

	"go.uber.org/zap"
)

type FFmpegMuxer struct {
	id        int
	filePath  string
	file      *os.File
	startTime time.Time
	cmd       *exec.Cmd
	conn      *net.TCPConn
}

var (
	_fm  Muxer                   = &FFmpegMuxer{}
	_fms surface.SurfaceListener = &FFmpegMuxer{}
)

func NewFFmpegMuxer(filePath string, etcParam string, context *types.DcGdcDeviceContext) (*FFmpegMuxer, *outer.ErrorResult) {
	log.Inst.Info("FFmpegMuxer.NewFFmpegMuxer")
	s := FFmpegMuxer{}
	file, err := utils.OpenFile(filePath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0o600)
	if err != nil {
		return nil, &outer.ErrorResult{Code: outer.Code_CODE_FILESYSTEM_FILE_OPEN_FAILED, Message: err.Error()}
	}
	listener, port, err, mutex := utils.ListenTCPFreePort()
	defer mutex.Unlock()
	if err != nil {
		return nil, &outer.ErrorResult{Code: outer.Code_CODE_NETWORK_CONNECTION_ABORTED, Message: err.Error()}
	}
	listener.Close()

	s.file = file
	s.filePath = filePath
	params := []string{
		"-y",
		"-listen", "1",
		"-tcp_nodelay", "1",
		"-use_wallclock_as_timestamps", "1",
		"-i", fmt.Sprintf("tcp://127.0.0.1:%d", port),
	}

	params = append(params, strings.Split(etcParam, " ")...)
	params = append(params, filePath)
	s.cmd, err = utils.Execute(args.Global.FFmpegPath, params...)

	for i := 0; i < 10; i++ {
		connectionTimeout := 10000 * time.Millisecond
		conn, err := net.DialTimeout("tcp", fmt.Sprintf("127.0.0.1:%d", port), connectionTimeout)
		if err != nil {
			time.Sleep(1000 * time.Millisecond)
			continue
		}
		s.conn = conn.(*net.TCPConn)
		return &s, gotypes.Success
	}
	s.close()
	return nil, &outer.ErrorResult{Code: outer.Code_CODE_NETWORK_CONNECTION_FAILED, Message: err.Error()}
}

func (s *FFmpegMuxer) GetId() int {
	return s.id
}

func (s *FFmpegMuxer) SetId(id int) {
	s.id = id
}

func (s *FFmpegMuxer) FilePath() string {
	return s.filePath
}

func (s *FFmpegMuxer) GetSurfaceListenerType() string {
	return MuxerType
}

// implement surfacelistener
func (s *FFmpegMuxer) OnSurface(_ uint32, data []byte) {
	s.conn.Write(data)
}

func (s *FFmpegMuxer) OnRemove() {
	log.Inst.Info("FFmpegMuxer.OnRemove")
	s.close()
}

func (s *FFmpegMuxer) OnRTPBytes(_ uint32, data []byte) {
	log.Inst.Error("FFmpegMuxer.OnRTPBytes not supported")
}

func (s *FFmpegMuxer) close() {
	log.Inst.Info("FFmpegMuxer.close Finalizing...")
	if s.conn != nil {
		log.Inst.Info("FFmpegMuxer.close send connection")
		s.conn.Close()
		s.conn = nil
	}

	if s.cmd != nil {
		state, err := s.cmd.Process.Wait()
		if err != nil {
			log.Inst.Error("FFmpegMuxer.close err: ", zap.Error(err))
		}
		log.Inst.Info("FFmpegMuxer.close state: ", zap.Any("state", state))
	}
}
