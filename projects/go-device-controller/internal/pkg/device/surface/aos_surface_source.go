package surface

import (
	"go-device-controller/types/protocol/generated/proto/outer/streaming"

	log "go-device-controller/internal/pkg/log"

	"github.com/gorilla/websocket"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

type aosSurfaceSource struct {
	conn     *websocket.Conn
	agentUrl *string
}

var _as SurfaceSource = &aosSurfaceSource{}

func NewAosSurfaceSource(agentUrl *string) *aosSurfaceSource {
	log.Inst.Info("aosSurfaceSource.newAosSurface")
	s := aosSurfaceSource{}
	s.agentUrl = agentUrl
	return &s
}

func (s *aosSurfaceSource) Connect(serial string, screenCaptureOption *streaming.ScreenCaptureOption) error {
	// reconnect loop
	var err error
	s.conn, _, err = websocket.DefaultDialer.Dial(*s.agentUrl, nil)
	if err != nil {
		return err
	}

	return nil
}

func (s *aosSurfaceSource) Receive() ([]byte, error) {
	if nil == s.conn {
		return nil, errors.Errorf("aosSurfaceSource.Receive reader is null")
	}
	_, buf, err := s.conn.ReadMessage()
	if err != nil {
		s.conn = nil
	}

	return buf, err
}

func (s *aosSurfaceSource) NotifyData(listener SurfaceListener, timeStamp uint32, data []byte) {
	listener.OnSurface(timeStamp, data)
}

func (s *aosSurfaceSource) Close() {
	conn := s.conn
	if nil == conn {
		return
	}
	if closeEr := conn.Close(); closeEr != nil {
		log.Inst.Error("aosSurfaceSource.Close", zap.Error(closeEr))
	}
}
