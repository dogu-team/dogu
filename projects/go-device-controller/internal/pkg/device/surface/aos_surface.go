package surface

import (
	"time"

	"go-device-controller/types/protocol/generated/proto/outer/streaming"

	log "go-device-controller/internal/pkg/log"

	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

type aosSurface struct {
	conn     *websocket.Conn
	agentUrl *string
}

var _as surface = &aosSurface{}

func newAosSurface(agentUrl *string) *aosSurface {
	log.Inst.Info("aosSurface.newAosSurface")
	s := aosSurface{}
	s.agentUrl = agentUrl
	return &s
}

func (s *aosSurface) Reconnect(serial string, sleepSec int, screenCaptureOption *streaming.ScreenCaptureOption) error {
	// reconnect loop
	var err error
	s.conn, _, err = websocket.DefaultDialer.Dial(*s.agentUrl, nil)
	if err != nil {
		return err
	}

	return nil
}

func (s *aosSurface) Receive() ([]byte, error) {
	err := s.conn.SetReadDeadline(time.Now().Add(10 * time.Second))
	if err != nil {
		log.Inst.Error("aosSurface.SetReadDeadline error", zap.String("url", *s.agentUrl), zap.Error(err))
	}
	_, buf, err := s.conn.ReadMessage()
	return buf, err
}

func (s *aosSurface) NotifyData(listener SurfaceListener, timeStamp uint32, data []byte) {
	listener.OnSurface(timeStamp, data)
}

func (s *aosSurface) Close() {
	if nil != s.conn {
		if closeEr := s.conn.Close(); closeEr != nil {
			log.Inst.Error("aosSurface.Close", zap.Error(closeEr))
		}
	}
	s.conn = nil
}
