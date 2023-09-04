package surface

import (
	"math/rand"
	"sync"
	"time"

	"go-device-controller/types/protocol/generated/proto/outer/streaming"

	log "go-device-controller/internal/pkg/log"

	"github.com/pkg/errors"
	"go.uber.org/zap"
)

type surface interface {
	Reconnect(serial string, screenCaptureOption *streaming.ScreenCaptureOption) error
	Receive() ([]byte, error)
	NotifyData(listener SurfaceListener, timeStamp uint32, data []byte)
	Close()
}

type SurfaceProfile struct {
	ReadSizePerPeriod     int
	ReadCountPerPeriod    int
	ReadMillisecPerPeriod int64
}

type SurfaceMessageType string

const (
	connect SurfaceMessageType = "connect"
	receive SurfaceMessageType = "receive"
	close   SurfaceMessageType = "close"
)

type SurfaceMessage struct {
	msgType SurfaceMessageType
	buf     []byte
	err     error
}

type SurfaceConnector struct {
	serial             string
	surface            surface
	isSurfaceConnected bool
	lastReconnectTime  time.Time
	listernerIdSeed    int
	listeners          []SurfaceListener
	listenerMutex      sync.RWMutex

	msgChan chan SurfaceMessage

	// send timestamp
	firstTimeStamp uint32
	firstSendTime  time.Time

	option  *streaming.ScreenCaptureOption
	Profile SurfaceProfile
}

func NewSurfaceConnectorBase(s *SurfaceConnector, serial string) {
	s.serial = serial
	s.listernerIdSeed = 0
	s.listeners = make([]SurfaceListener, 0)
	s.listenerMutex = sync.RWMutex{}
	s.msgChan = make(chan SurfaceMessage, 65535)
	go s.startRoutine()
	go s.startRecvRoutine()
}

func NewAosSurfaceConnector(s *SurfaceConnector, serial string, agentUrl *string) {
	log.Inst.Info("surfaceConnector.newAosSurfaceConnector ", zap.String("serial", serial), zap.String("url", *agentUrl))
	NewSurfaceConnectorBase(s, serial)
	s.surface = newAosSurface(agentUrl)
}

func NewIosSurfaceConnector(s *SurfaceConnector, serial string, agentUrl *string) {
	log.Inst.Info("surfaceConnector.NewIosSurfaceConnector ", zap.String("serial", serial), zap.String("url", *agentUrl))
	NewSurfaceConnectorBase(s, serial)
	s.surface = newiosSurface(agentUrl)
}

func NewWindowsSurfaceConnector(s *SurfaceConnector, serial string) {
	log.Inst.Info("surfaceConnector.NewWindowsSurfaceConnector", zap.String("serial", serial))
	NewSurfaceConnectorBase(s, serial)
	s.surface = newDesktopLibwebrtcSurface()
}

func NewMacSurfaceConnector(s *SurfaceConnector, serial string) {
	log.Inst.Info("surfaceConnector.NewMacSurfaceConnector", zap.String("serial", serial))
	NewSurfaceConnectorBase(s, serial)
	s.surface = newDesktopLibwebrtcSurface()
}

// add listener
func (s *SurfaceConnector) AddListener(listener SurfaceListener) {
	s.listenerMutex.Lock()
	defer s.listenerMutex.Unlock()

	listener.SetId(s.listernerIdSeed)
	log.Inst.Info("surfaceConnector.addListener", zap.String("serial", s.serial), zap.Int("id", listener.GetId()), zap.String("type", listener.GetSurfaceListenerType()), zap.Int("listenerCount", len(s.listeners)))
	s.listernerIdSeed++

	s.listeners = append(s.listeners, listener)

	s.msgChan <- SurfaceMessage{msgType: close}
	s.msgChan <- SurfaceMessage{msgType: connect}

	log.Inst.Info("surfaceConnector.addListener done", zap.String("serial", s.serial), zap.Int("id", listener.GetId()), zap.String("type", listener.GetSurfaceListenerType()), zap.Int("listenerCount", len(s.listeners)))
}

// remove listener
func (s *SurfaceConnector) RemoveListener(listener SurfaceListener) {
	s.listenerMutex.Lock()
	defer s.listenerMutex.Unlock()
	log.Inst.Info("surfaceConnector.removeListener ", zap.String("serial", s.serial), zap.Int("id", listener.GetId()), zap.String("type", listener.GetSurfaceListenerType()), zap.Int("listenerCount", len(s.listeners)))

	for i, l := range s.listeners {
		if l == listener {
			l.OnRemove()
			s.listeners = append(s.listeners[:i], s.listeners[i+1:]...)
			break
		}
	}
	if len(s.listeners) <= 0 {
		s.msgChan <- SurfaceMessage{msgType: close, err: errors.Errorf("no listener")}
	}
	log.Inst.Info("surfaceConnector.removeListener done", zap.String("serial", s.serial), zap.Int("id", listener.GetId()), zap.String("type", listener.GetSurfaceListenerType()), zap.Int("listenerCount", len(s.listeners)))
}

func (s *SurfaceConnector) HasListener() bool {
	return 0 < len(s.listeners)
}

func (s *SurfaceConnector) FindListeners(listenerType string) []SurfaceListener {
	s.listenerMutex.RLock()
	defer s.listenerMutex.RUnlock()
	var result []SurfaceListener
	for _, l := range s.listeners {
		if l.GetSurfaceListenerType() == listenerType {
			result = append(result, l)
		}
	}
	return result
}

func (s *SurfaceConnector) RemoveAllListeners() {
	s.listenerMutex.Lock()
	defer s.listenerMutex.Unlock()
	log.Inst.Info("surfaceConnector.removeAllListeners ", zap.String("serial", s.serial), zap.Int("listenerCount", len(s.listeners)))

	for _, l := range s.listeners {
		l.OnRemove()
	}
	s.listeners = make([]SurfaceListener, 0)
}

func (s *SurfaceConnector) SetScreenCaptureOption(option *streaming.ScreenCaptureOption) {
	s.option = option
}

func (s *SurfaceConnector) startRoutine() {
	log.Inst.Info("surfaceConnector.startRoutine", zap.String("serial", s.serial))
	for msg := range s.msgChan {
		switch msg.msgType {
		case connect:
			if s.listeners == nil || len(s.listeners) == 0 {
				continue
			}
			err := s.notifySurfaceReconnect(s.serial)
			if err != nil {
				log.Inst.Error("surfaceConnector.startRoutine reconnect error", zap.Error(err))
			}
		case close:
			if nil == msg.err {
				msg.err = errors.Errorf("unknown")
			}
			log.Inst.Error("surfaceConnector.startRoutine close", zap.String("serial", s.serial), zap.String("reason", msg.err.Error()))
			s.notifySurfaceClose("close")
		case receive:
			func() {
				buf := msg.buf
				s.listenerMutex.RLock()
				defer s.listenerMutex.RUnlock()

				if s.firstSendTime.IsZero() {
					s.firstTimeStamp = rand.Uint32() % 90000 // do not start at zero
					s.firstSendTime = time.Now()
					// prevent late video play start
					for _, listener := range s.listeners {
						s.surface.NotifyData(listener, s.firstTimeStamp, buf)
					}
				}

				currentTimestamp := uint32(time.Since(s.firstSendTime).Seconds()*90000) + s.firstTimeStamp
				for _, listener := range s.listeners {
					s.surface.NotifyData(listener, currentTimestamp, buf)
				}
			}()
		}
	}
}

func (s *SurfaceConnector) notifySurfaceReconnect(serial string) error {
	log.Inst.Info("surfaceConnector.notifySurfaceReconnect", zap.String("serial", s.serial))
	deltaTimeMillisecond := 1000 - time.Since(s.lastReconnectTime).Milliseconds()
	if 0 < deltaTimeMillisecond {
		log.Inst.Warn("surfaceConnector.notifySurfaceReconnect too fast", zap.String("serial", s.serial))
		time.Sleep(time.Millisecond * time.Duration(deltaTimeMillisecond))
	}
	s.lastReconnectTime = time.Now()
	err := s.surface.Reconnect(serial, s.option)
	if err != nil {
		log.Inst.Warn("surfaceConnector.notifySurfaceReconnect failed", zap.String("serial", s.serial), zap.Error(err))
		return err
	}

	s.isSurfaceConnected = true
	return nil
}

func (s *SurfaceConnector) startRecvRoutine() {
	for {
		if !s.isSurfaceConnected {
			time.Sleep(time.Millisecond * 200)
			continue
		}

		buf, err := s.surface.Receive()
		if err != nil {
			log.Inst.Warn("surfaceConnector.startRecvRoutine failed", zap.String("serial", s.serial), zap.Error(err))
			s.msgChan <- SurfaceMessage{msgType: close, err: err}
			s.msgChan <- SurfaceMessage{msgType: connect}
			time.Sleep(time.Millisecond * 3000) // to prevent close, connect msg burst
			continue
		}
		s.Profile.ReadSizePerPeriod += len(buf)
		s.Profile.ReadCountPerPeriod += 1
		s.msgChan <- SurfaceMessage{msgType: receive, buf: buf}
	}
}

func (s *SurfaceConnector) notifySurfaceClose(reason string) {
	// log.Inst.Info("surfaceConnector.notifySurfaceClose", zap.String("serial", s.serial))
	s.isSurfaceConnected = false
	if s.isSurfaceConnected {
		log.Inst.Info("surfaceConnector.notifySurfaceClose closed", zap.String("serial", s.serial), zap.String("reason", reason))
		s.surface.Close()
	}
	// s.firstSendTime = time.Time{} <- Resetting timestamp make lack to pre-watchers
}
