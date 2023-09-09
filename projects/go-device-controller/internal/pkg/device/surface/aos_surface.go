package surface

import (
	"go-device-controller/types/protocol/generated/proto/outer/streaming"

	log "go-device-controller/internal/pkg/log"

	"github.com/gorilla/websocket"
	"github.com/pkg/errors"
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

func (s *aosSurface) Connect(serial string, screenCaptureOption *streaming.ScreenCaptureOption) error {
	// reconnect loop
	var err error
	s.conn, _, err = websocket.DefaultDialer.Dial(*s.agentUrl, nil)
	if err != nil {
		return err
	}

	return nil
}

func (s *aosSurface) Receive() ([]byte, error) {
	if nil == s.conn {
		return nil, errors.Errorf("aosSurface.Receive reader is null")
	}
	_, buf, err := s.conn.ReadMessage()
	if err != nil {
		s.conn = nil
	}

	return buf, err
}

func (s *aosSurface) NotifyData(listener SurfaceListener, timeStamp uint32, data []byte) {
	listener.OnSurface(timeStamp, data)
}

func (s *aosSurface) Close() {
	if nil == s.conn {
		return
	}
	if closeEr := s.conn.Close(); closeEr != nil {
		log.Inst.Error("aosSurface.Close", zap.Error(closeEr))
	}
}
