package surface

import (
	"math/rand"
	"sync"
	"time"

	"go-device-controller/types/protocol/generated/proto/outer"
	"go-device-controller/types/protocol/generated/proto/outer/streaming"

	log "go-device-controller/internal/pkg/log"

	"github.com/pkg/errors"
	"go.uber.org/zap"
)

type surface interface {
	Connect(serial string, screenCaptureOption *streaming.ScreenCaptureOption) error
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
	reconnect SurfaceMessageType = "reconnect"
	close     SurfaceMessageType = "close"
)

type SurfaceMessage struct {
	time    time.Time
	msgType SurfaceMessageType
	err     error
}

type SurfaceConnector struct {
	serial          string
	platform        outer.Platform
	surfaceFactory  func() surface
	listernerIdSeed int
	listeners       []SurfaceListener
	listenerMutex   sync.RWMutex

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
}

func NewAosSurfaceConnector(s *SurfaceConnector, serial string, agentUrl *string) {
	log.Inst.Info("surfaceConnector.newAosSurfaceConnector ", zap.String("serial", serial), zap.String("url", *agentUrl))
	NewSurfaceConnectorBase(s, serial)
	s.platform = outer.Platform_PLATFORM_ANDROID
	s.surfaceFactory = func() surface {
		return newAosSurface(agentUrl)
	}
}

func NewIosSurfaceConnector(s *SurfaceConnector, serial string, agentUrl *string) {
	log.Inst.Info("surfaceConnector.NewIosSurfaceConnector ", zap.String("serial", serial), zap.String("url", *agentUrl))
	NewSurfaceConnectorBase(s, serial)
	s.platform = outer.Platform_PLATFORM_IOS
	s.surfaceFactory = func() surface {
		return newiosSurface(agentUrl)
	}
}

func NewWindowsSurfaceConnector(s *SurfaceConnector, serial string) {
	log.Inst.Info("surfaceConnector.NewWindowsSurfaceConnector", zap.String("serial", serial))
	NewSurfaceConnectorBase(s, serial)
	s.platform = outer.Platform_PLATFORM_WINDOWS
	s.surfaceFactory = func() surface {
		return newDesktopLibwebrtcSurface()
	}
}

func NewMacSurfaceConnector(s *SurfaceConnector, serial string) {
	log.Inst.Info("surfaceConnector.NewMacSurfaceConnector", zap.String("serial", serial))
	NewSurfaceConnectorBase(s, serial)
	s.platform = outer.Platform_PLATFORM_MACOS
	s.surfaceFactory = func() surface {
		return newDesktopLibwebrtcSurface()
	}
}

// add listener
func (s *SurfaceConnector) AddListener(listener SurfaceListener) {
	s.listenerMutex.Lock()
	defer s.listenerMutex.Unlock()

	listener.SetId(s.listernerIdSeed)
	log.Inst.Info("surfaceConnector.addListener", zap.String("serial", s.serial), zap.Int("id", listener.GetId()), zap.String("type", listener.GetSurfaceListenerType()), zap.Int("listenerCount", len(s.listeners)))
	s.listernerIdSeed++

	s.listeners = append(s.listeners, listener)

	s.msgChan <- SurfaceMessage{time: time.Now(), msgType: close, err: errors.Errorf("listener added")}
	s.msgChan <- SurfaceMessage{time: time.Now(), msgType: reconnect}

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
		s.msgChan <- SurfaceMessage{time: time.Now(), msgType: close, err: errors.Errorf("no listener")}
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
	var lastSurface surface
	var lastSurfaceReconnectCompleteTime time.Time = time.Now()
	var lastReconnectTryTime time.Time = time.Now()
	var lastSurfaceClosedTime time.Time = time.Now()
	for msg := range s.msgChan {
		switch msg.msgType {
		case reconnect:
			if s.listeners == nil || len(s.listeners) == 0 {
				continue
			}
			if msg.time.Before(lastSurfaceReconnectCompleteTime) {
				log.Inst.Warn("surfaceConnector.startRoutine reconnect ignored", zap.String("serial", s.serial), zap.Int64("msg.time", msg.time.Unix()), zap.Int64("surfaceCreatedTime", lastSurfaceReconnectCompleteTime.Unix()))
				continue
			}
			log.Inst.Debug("surfaceConnector.startRoutine reconnect", zap.String("serial", s.serial))

			log.Inst.Debug("surfaceConnector.startRoutine reconnect called", zap.String("serial", s.serial))
			deltaTimeMillisecond := 1000 - time.Since(lastReconnectTryTime).Milliseconds()
			if 0 < deltaTimeMillisecond {
				log.Inst.Warn("surfaceConnector.notifySurfaceReconnect too fast. so wait", zap.String("serial", s.serial), zap.Int64("deltaTimeMillisecond", deltaTimeMillisecond))
				time.Sleep(time.Millisecond * time.Duration(deltaTimeMillisecond))
			}
			lastReconnectTryTime = time.Now()
			newSurface := s.surfaceFactory()
			err := notifySurfaceReconnect(s.serial, s.option, newSurface)
			if err != nil {
				log.Inst.Error("surfaceConnector.startRoutine reconnect error", zap.Error(err))
				s.msgChan <- SurfaceMessage{time: time.Now(), msgType: reconnect}
				continue
			}
			lastSurfaceReconnectCompleteTime = time.Now()
			recvRoutineStartTime := lastSurfaceReconnectCompleteTime
			recvRoutineStartTime = recvRoutineStartTime.Add(time.Millisecond * 100)
			go startRecvRoutine(newSurface,
				func(err error) {
					log.Inst.Warn("surfaceConnector.startRecvRoutine failed", zap.String("serial", s.serial), zap.Error(err))
					s.msgChan <- SurfaceMessage{time: recvRoutineStartTime, msgType: close, err: err}
					s.msgChan <- SurfaceMessage{time: recvRoutineStartTime, msgType: reconnect}
				},
				func(buf []byte) {
					s.Profile.ReadSizePerPeriod += len(buf)
					s.Profile.ReadCountPerPeriod += 1

					func() {
						s.listenerMutex.RLock()
						defer s.listenerMutex.RUnlock()

						if s.firstSendTime.IsZero() {
							s.firstTimeStamp = rand.Uint32() % 90000 // do not start at zero
							s.firstSendTime = time.Now()
							// prevent late video play start
							for _, listener := range s.listeners {
								newSurface.NotifyData(listener, s.firstTimeStamp, buf)
							}
						}

						currentTimestamp := uint32(time.Since(s.firstSendTime).Seconds()*90000) + s.firstTimeStamp
						for _, listener := range s.listeners {
							newSurface.NotifyData(listener, currentTimestamp, buf)
						}
					}()
				})

			lastSurface = newSurface
		case close:
			if nil == msg.err {
				msg.err = errors.Errorf("unknown")
			}
			if nil == lastSurface {
				log.Inst.Warn("surfaceConnector.startRoutine close. passed surface nil", zap.String("serial", s.serial))
				continue
			}
			log.Inst.Error("surfaceConnector.startRoutine close", zap.String("serial", s.serial), zap.String("reason", msg.err.Error()))
			if msg.time.Before(lastSurfaceClosedTime) {
				log.Inst.Warn("surfaceConnector.startRoutine close ignored", zap.String("serial", s.serial), zap.Int64("msg.time", msg.time.Unix()), zap.Int64("surfaceClosedTime", lastSurfaceClosedTime.Unix()))
				continue
			}

			notifySurfaceClose(s.serial, lastSurface, "close")

			lastSurface = nil
			lastSurfaceClosedTime = time.Now()
		}
	}
}

func notifySurfaceReconnect(serial string, option *streaming.ScreenCaptureOption, surface surface) error {
	log.Inst.Info("surfaceConnector.notifySurfaceReconnect", zap.String("serial", serial))

	err := surface.Connect(serial, option)
	if err != nil {
		log.Inst.Warn("surfaceConnector.notifySurfaceReconnect failed", zap.String("serial", serial), zap.Error(err))
		return err
	}

	return nil
}

func notifySurfaceClose(serial string, surface surface, reason string) {
	log.Inst.Info("surfaceConnector.notifySurfaceClose", zap.String("serial", serial))
	log.Inst.Info("surfaceConnector.notifySurfaceClose closed", zap.String("serial", serial), zap.String("reason", reason))
	surface.Close()
}

func startRecvRoutine(surface surface, onError func(err error), onRead func(buf []byte)) {
	for {
		buf, err := surface.Receive()
		if err != nil {
			onError(err)
			return
		}
		onRead(buf)
	}
}
