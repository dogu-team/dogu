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

type desktopLibwebrtcSurfaceSource struct {
	listener  *net.TCPListener
	conn      *net.TCPConn
	reader    *bufio.Reader
	cmd       *exec.Cmd
	recvQueue utils.SizePrefixedRecvQueue
}

var _dls SurfaceSource = &desktopLibwebrtcSurfaceSource{}

func NewDesktopLibwebrtcSurfaceSource() *desktopLibwebrtcSurfaceSource {
	log.Inst.Info("desktopLibwebrtcSurfaceSource.newDesktopLibwebrtcSurface")
	s := desktopLibwebrtcSurfaceSource{}
	return &s
}

func (s *desktopLibwebrtcSurfaceSource) Connect(serial string, screenCaptureOption *streaming.ScreenCaptureOption) error {
	var err error
	var port int
	listener, port, err, mutex := utils.ListenTCPFreePort()
	s.listener = listener
	defer mutex.Unlock()
	if err != nil {
		log.Inst.Error("desktopLibwebrtcSurfaceSource.Connect", zap.String("serial", serial), zap.Error(err))
		return err
	}

	exePath, err := getDesktopCapturerPath()
	if err != nil {
		log.Inst.Error("desktopLibwebrtcSurfaceSource.Connect", zap.String("serial", serial), zap.Error(err))
		return err
	}

	width, height := robotgo.GetScreenSize()
	// img, err := screenshot.CaptureDisplay(0)
	// if err != nil {
	// 	log.Inst.Error("desktopLibwebrtcSurfaceSource.Reconnect", zap.Error(err))
	// 	return err
	// }
	// width := img.Bounds().Size().X
	// height := img.Bounds().Size().Y
	if 0 < screenCaptureOption.GetMaxResolution() {
		ratio := float64(screenCaptureOption.GetMaxResolution()) / float64(height)
		height = int(screenCaptureOption.GetMaxResolution())
		width = int(float64(width) * ratio)
	}
	if 0 < screenCaptureOption.GetWidth() {
		width = int(screenCaptureOption.GetWidth())
	}
	if 0 < screenCaptureOption.GetHeight() {
		height = int(screenCaptureOption.GetHeight())
	}
	s.cmd, err = utils.Execute(
		exePath,
		"streaming",
		"--port", fmt.Sprintf("%d", port),
		"--width", fmt.Sprintf("%d", width),
		"--height", fmt.Sprintf("%d", height),
		"--fps", strconv.FormatUint(screenCaptureOption.GetMaxFps(), 10),
		"--pid", strconv.FormatInt(int64(screenCaptureOption.GetPid()), 10),
	)
	if err != nil {
		log.Inst.Error("desktopLibwebrtcSurfaceSource.Connect", zap.String("serial", serial), zap.Error(err))
		return err
	}
	s.conn, err = s.listener.AcceptTCP()
	if err != nil {
		log.Inst.Error("desktopLibwebrtcSurfaceSource.Connect", zap.String("serial", serial), zap.Error(err))
		return err
	}

	s.reader = bufio.NewReader(s.conn)
	s.recvQueue.Clear()

	return nil
}

func (s *desktopLibwebrtcSurfaceSource) Receive() ([]byte, error) {
	if nil == s.listener || nil == s.cmd || nil == s.reader || nil == s.conn {
		log.Inst.Error("desktopLibwebrtcSurfaceSource.Receive null exists", zap.Bool("listener", nil != s.listener), zap.Bool("cmd", nil != s.cmd), zap.Bool("reader", nil != s.reader), zap.Bool("conn", nil != s.conn))
		return nil, errors.Errorf("desktopLibwebrtcSurfaceSource.Receive null exists")
	}
	buf, err := s.receive()
	if err != nil {
		s.listener = nil
		s.conn = nil
		s.reader = nil
		s.cmd = nil
	}
	return buf, err
}

func (s *desktopLibwebrtcSurfaceSource) receive() ([]byte, error) {
	for {
		err := s.conn.SetReadDeadline(time.Now().Add(time.Minute))
		if err != nil {
			log.Inst.Error("desktopLibwebrtcSurfaceSource.SetReadDeadline error", zap.Error(err))
		}
		err = s.recvQueue.Push(s.reader)
		if err != nil {
			log.Inst.Error("desktopLibwebrtcSurfaceSource.Receive push failed", zap.Error(err))
			return nil, err
		}
		if !s.recvQueue.Has() {
			continue
		}
		buf, err := s.recvQueue.Pop()
		if err != nil {
			log.Inst.Error("desktopLibwebrtcSurfaceSource.Receive pop failed", zap.Error(err))
			return nil, err
		}
		return buf, nil
	}
}

func (s *desktopLibwebrtcSurfaceSource) NotifyData(listener SurfaceListener, timeStamp uint32, data []byte) {
	listener.OnSurface(timeStamp, data)
}

func (s *desktopLibwebrtcSurfaceSource) Close() {
	listener := s.listener
	conn := s.conn
	cmd := s.cmd
	if nil != listener {
		if closeEr := listener.Close(); closeEr != nil {
			log.Inst.Error("desktopLibwebrtcSurfaceSource.Close", zap.Error(closeEr))
		}
	}
	if nil != conn {
		if closeEr := conn.Close(); closeEr != nil {
			log.Inst.Error("desktopLibwebrtcSurfaceSource.Close", zap.Error(closeEr))
		}
	}
	if nil != cmd {
		process := cmd.Process
		if nil != process {
			if closeEr := process.Kill(); closeEr != nil {
				log.Inst.Warn("desktopLibwebrtcSurfaceSource.Close", zap.Error(closeEr))
			}
			utils.Execute("taskkill", "/PID", fmt.Sprintf("%v", process.Pid), "/F", "/T")
		}
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
