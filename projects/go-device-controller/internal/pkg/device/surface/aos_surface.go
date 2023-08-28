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

func (s *aosSurface) Reconnect(serial string, retryCount int, sleepSec int, screenCaptureOption *streaming.ScreenCaptureOption) error {
	// reconnect loop
	var err error
	count := 0
	for {
		s.conn, _, err = websocket.DefaultDialer.Dial(*s.agentUrl, nil)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Inst.Info("aosSurface.Reconnect closed", zap.String("serial", serial), zap.String("url", *s.agentUrl))
				return err
			}
			if count >= retryCount {
				return err
			}
			if count%10 == 0 {
				log.Inst.Info("aosSurface.Reconnect ", zap.String("serial", serial), zap.String("url", *s.agentUrl), zap.Int("retry", count))
			}
			time.Sleep(time.Second * time.Duration(sleepSec))
			count += 1
			continue
		}
		err = s.conn.SetReadDeadline(time.Now().Add(10 * time.Second))
		if err != nil {
			log.Inst.Error("aosSurface.SetReadDeadline error", zap.String("url", *s.agentUrl), zap.Error(err))
		}
		return nil
	}
}

func (s *aosSurface) Receive() ([]byte, error) {
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
