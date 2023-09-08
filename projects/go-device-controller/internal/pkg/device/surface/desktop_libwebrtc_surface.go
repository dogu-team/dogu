package surface

import (
	"bufio"
	"fmt"
	"net"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"time"

	"go-device-controller/types/protocol/generated/proto/outer/streaming"

	"github.com/go-vgo/robotgo"
	"github.com/pkg/errors"

	"go-device-controller/internal/pkg/utils"

	log "go-device-controller/internal/pkg/log"

	"go.uber.org/zap"
)

type desktopLibwebrtcSurface struct {
	listener  *net.TCPListener
	conn      *net.TCPConn
	reader    *bufio.Reader
	cmd       *exec.Cmd
	recvQueue utils.SizePrefixedRecvQueue
}

var _dls surface = &desktopLibwebrtcSurface{}

func newDesktopLibwebrtcSurface() *desktopLibwebrtcSurface {
	log.Inst.Info("desktopLibwebrtcSurface.newDesktopLibwebrtcSurface")
	s := desktopLibwebrtcSurface{}
	return &s
}

func (s *desktopLibwebrtcSurface) Connect(serial string, screenCaptureOption *streaming.ScreenCaptureOption) error {
	var err error
	var port int
	listener, port, err, mutex := utils.ListenTCPFreePort()
	s.listener = listener
	defer mutex.Unlock()
	if err != nil {
		log.Inst.Error("desktopLibwebrtcSurface.Connect", zap.String("serial", serial), zap.Error(err))
		return err
	}

	exePath, err := getDesktopCapturerPath()
	if err != nil {
		log.Inst.Error("desktopLibwebrtcSurface.Connect", zap.String("serial", serial), zap.Error(err))
		return err
	}

	width, height := robotgo.GetScreenSize()
	// img, err := screenshot.CaptureDisplay(0)
	// if err != nil {
	// 	log.Inst.Error("desktopLibwebrtcSurface.Reconnect", zap.Error(err))
	// 	return err
	// }
	// width := img.Bounds().Size().X
	// height := img.Bounds().Size().Y
	if 0 < screenCaptureOption.GetMaxResolution() {
		ratio := float64(screenCaptureOption.GetMaxResolution()) / float64(height)
		height = int(screenCaptureOption.GetMaxResolution())
		width = int(float64(width) * ratio)
	}
	s.cmd, err = utils.Execute(
		exePath,
		"--port", fmt.Sprintf("%d", port),
		"--width", fmt.Sprintf("%d", width),
		"--height", fmt.Sprintf("%d", height),
		"--fps", strconv.FormatUint(screenCaptureOption.GetMaxFps(), 10),
	)
	if err != nil {
		log.Inst.Error("desktopLibwebrtcSurface.Connect", zap.String("serial", serial), zap.Error(err))
		return err
	}
	s.conn, err = s.listener.AcceptTCP()
	if err != nil {
		log.Inst.Error("desktopLibwebrtcSurface.Connect", zap.String("serial", serial), zap.Error(err))
		return err
	}

	s.reader = bufio.NewReader(s.conn)
	s.recvQueue.Clear()

	return nil
}

func (s *desktopLibwebrtcSurface) Receive() ([]byte, error) {
	if nil == s.reader {
		log.Inst.Error("desktopLibwebrtcSurface.Receive reader is null")
		return nil, errors.Errorf("desktopLibwebrtcSurface.Receive reader is null")

	}
	for {
		err := s.conn.SetReadDeadline(time.Now().Add(time.Minute))
		if err != nil {
			log.Inst.Error("desktopLibwebrtcSurface.SetReadDeadline error", zap.Error(err))
		}
		err = s.recvQueue.Push(s.reader)
		if err != nil {
			log.Inst.Error("desktopLibwebrtcSurface.Receive push failed", zap.Error(err))
			return nil, err
		}
		if !s.recvQueue.Has() {
			continue
		}
		buf, err := s.recvQueue.Pop()
		if err != nil {
			log.Inst.Error("desktopLibwebrtcSurface.Receive pop failed", zap.Error(err))
			return nil, err
		}
		// log.Inst.Debug("desktopLibwebrtcSurface.Receive", zap.Int("size", len(buf)))
		return buf, nil
	}
}

func (s *desktopLibwebrtcSurface) NotifyData(listener SurfaceListener, timeStamp uint32, data []byte) {
	listener.OnSurface(timeStamp, data)
}

func (s *desktopLibwebrtcSurface) Close() {
	if nil != s.listener {
		if closeEr := s.listener.Close(); closeEr != nil {
			log.Inst.Error("desktopLibwebrtcSurface.Close", zap.Error(closeEr))
		}
		s.listener = nil
	}
	if nil != s.conn {
		if closeEr := s.conn.Close(); closeEr != nil {
			log.Inst.Error("desktopLibwebrtcSurface.Close", zap.Error(closeEr))
		}
		s.conn = nil
	}
	s.reader = nil
	if nil != s.cmd {
		if closeEr := s.cmd.Process.Kill(); closeEr != nil {
			log.Inst.Warn("desktopLibwebrtcSurface.Close", zap.Error(closeEr))
		}
		utils.Execute("taskkill", "/PID", fmt.Sprintf("%v", s.cmd.Process.Pid), "/F", "/T")
		s.cmd = nil
	}
}

func getDesktopCapturerPath() (string, error) {
	ex, err := os.Executable()
	if err != nil {
		return "", err
	}
	exPath := filepath.Dir(ex)
	candidates := []string{
		filepath.Join(exPath, "desktop-capturer.exe"),
		filepath.Join(exPath, "desktop-capturer"),
		filepath.Join(exPath, "desktop-capturer", "build", "Release", "desktop-capturer.exe"),
		filepath.Join(exPath, "desktop-capturer", "build", "Release", "desktop-capturer"),
	}
	// check if file exists
	for _, candidate := range candidates {
		fileStat, err := os.Stat(candidate)
		if err == nil && !fileStat.IsDir() {
			return candidate, nil
		}
	}
	return "", fmt.Errorf("desktop_capturer not found")
}
