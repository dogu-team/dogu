package surface

import (
	"errors"
	"math/rand"
	"sync"
	"sync/atomic"
	"time"

	"go-device-controller/types/protocol/generated/proto/outer/streaming"

	log "go-device-controller/internal/pkg/log"

	"go.uber.org/zap"
)

type surface interface {
	Reconnect(serial string, retryCount int, sleepSec int, screenCaptureOption *streaming.ScreenCaptureOption) error
	Receive() ([]byte, error)
	NotifyData(listener SurfaceListener, timeStamp uint32, data []byte)
	Close()
}

type SurfaceProfile struct {
	ReadSizePerPeriod     int
	ReadCountPerPeriod    int
	ReadMillisecPerPeriod int64
}

type SurfaceConnector struct {
	serial             string
	surface            surface
	isSurfaceConnected bool
	listeners          []SurfaceListener
	listenerMutex      sync.RWMutex

	// send timestamp
	firstTimeStamp uint32
	firstSendTime  time.Time

	isRoutineAlive   atomic.Value
	isForceReconnect bool

	option  *streaming.ScreenCaptureOption
	Profile SurfaceProfile
}

func NewSurfaceConnectorBase(s *SurfaceConnector, serial string) {
	s.serial = serial
	s.listeners = make([]SurfaceListener, 0)
	s.listenerMutex = sync.RWMutex{}
	s.isRoutineAlive.Store(false)
	s.isForceReconnect = false
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
	log.Inst.Info("surfaceConnector.addListener", zap.String("serial", s.serial), zap.Int("listenerCount", len(s.listeners)), zap.Bool("isAlive", s.isRoutineAlive.Load().(bool)))

	s.listeners = append(s.listeners, listener)
	s.isForceReconnect = true

	if s.isRoutineAlive.CompareAndSwap(false, true) {
		err := s.startRoutine()
		if nil != err {
			log.Inst.Error("surfaceConnector.addListener startRoutine error", zap.Error(err))
		}
	}
}

// remove listener
func (s *SurfaceConnector) RemoveListener(listener SurfaceListener) {
	s.listenerMutex.Lock()
	defer s.listenerMutex.Unlock()
	log.Inst.Info("surfaceConnector.removeListener ", zap.String("serial", s.serial), zap.Int("listenerCount", len(s.listeners)))

	for i, l := range s.listeners {
		if l == listener {
			l.OnRemove()
			s.listeners = append(s.listeners[:i], s.listeners[i+1:]...)
			break
		}
	}
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

func (s *SurfaceConnector) startRoutine() error {
	go func() {
		log.Inst.Info("surfaceConnector.startRoutine", zap.String("serial", s.serial))
		var err error
		var buf []byte = []byte{}
		for {
			err = nil
			if len(s.listeners) <= 0 {
				if s.isSurfaceConnected {
					s.notifySurfaceClose()
				}
				time.Sleep(time.Millisecond * 200)
				continue
			}
			if !s.isForceReconnect && s.isSurfaceConnected {
				buf, err = s.notifySurfaceReceive()
			} else {
				err = errors.New("force reconnect")
			}

			if err != nil {
				s.notifySurfaceClose()
				err = s.notifySurfaceReconnect(s.serial, 9999, 1)
				if err != nil {
					log.Inst.Error("surfaceConnector.startRoutine reconnect error", zap.Error(err))
				}
				continue
			}
			func() {
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
	}()

	return nil
}

func (s *SurfaceConnector) notifySurfaceReconnect(serial string, retryCount int, sleepSec int) error {
	log.Inst.Info("surfaceConnector.notifySurfaceReconnect", zap.String("serial", s.serial))
	err := s.surface.Reconnect(serial, retryCount, sleepSec, s.option)
	if err != nil {
		time.Sleep(time.Second * 1)
		return err
	}

	s.isSurfaceConnected = true
	s.isForceReconnect = false
	return nil
}

func (s *SurfaceConnector) notifySurfaceReceive() ([]byte, error) {
	startTime := time.Now()

	buf, err := s.surface.Receive()

	s.Profile.ReadSizePerPeriod += len(buf)
	s.Profile.ReadCountPerPeriod += 1
	s.Profile.ReadMillisecPerPeriod += time.Since(startTime).Milliseconds()
	return buf, err
}

func (s *SurfaceConnector) notifySurfaceClose() {
	// log.Inst.Info("surfaceConnector.notifySurfaceClose", zap.String("serial", s.serial))
	if s.isSurfaceConnected {
		log.Inst.Info("surfaceConnector.notifySurfaceClose closed", zap.String("serial", s.serial))
		s.surface.Close()
	}
	s.isSurfaceConnected = false
	// s.firstSendTime = time.Time{} <- Resetting timestamp make lack to pre-watchers
}
