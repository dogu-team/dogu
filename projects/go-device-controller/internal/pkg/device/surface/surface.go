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

type (
	SurfaceMessageType string
	Pid                int
	ScreenId           int
)

type SurfaceSource interface {
	Connect(serial string, screenCaptureOption *streaming.ScreenCaptureOption) error
	Receive() ([]byte, error)
	NotifyData(listener SurfaceListener, timeStamp uint32, data []byte)
	Close()
}

type SurfaceProfile struct {
	ScreenId              ScreenId
	Pid                   Pid
	ReadSizePerPeriod     int
	ReadCountPerPeriod    int
	ReadMillisecPerPeriod int64
}

const (
	Reconnect SurfaceMessageType = "reconnect"
	Close     SurfaceMessageType = "close"
)

type SurfaceMessage struct {
	time    time.Time
	msgType SurfaceMessageType
	err     error
}

type Surface struct {
	serial               string
	platform             outer.Platform
	surfaceType          SurfaceType
	screenId             ScreenId
	pid                  Pid
	surfaceSourceFactory func() SurfaceSource
	listernerIdSeed      int
	listeners            []SurfaceListener
	listenerMutex        sync.RWMutex

	msgChan chan SurfaceMessage

	// recv timestamp
	lastRecvTime time.Time

	// send timestamp
	firstTimeStamp uint32
	firstSendTime  time.Time

	option  *streaming.ScreenCaptureOption
	Profile SurfaceProfile
}

type SurfaceStatus struct {
	IsPlaying              bool
	LastFrameDeltaMillisec int64
}

func NewSurface(s *Surface, serial string, platform outer.Platform, surfaceType SurfaceType, screenId ScreenId, pid Pid, surfaceSourceFactory func() SurfaceSource) {
	now := time.Now()
	s.serial = serial
	s.listernerIdSeed = 0
	s.listeners = make([]SurfaceListener, 0)
	s.listenerMutex = sync.RWMutex{}
	s.msgChan = make(chan SurfaceMessage, 65535)
	s.platform = platform
	s.surfaceType = surfaceType
	s.screenId = screenId
	s.pid = pid
	s.Profile.ScreenId = screenId
	s.Profile.Pid = pid
	s.lastRecvTime = now
	s.surfaceSourceFactory = surfaceSourceFactory
	go s.startRoutine(now)
}

func (s *Surface) IsEqual(serial string, surfaceType SurfaceType, screenId ScreenId, pid Pid) bool {
	return s.serial == serial && s.surfaceType == surfaceType && s.screenId == screenId && s.pid == pid
}

// add listener
func (s *Surface) AddListener(listener SurfaceListener) {
	s.listenerMutex.Lock()
	defer s.listenerMutex.Unlock()

	listener.SetId(s.listernerIdSeed)
	log.Inst.Info("surface.addListener", zap.String("serial", s.serial), zap.Int("id", listener.GetId()), zap.String("type", listener.GetSurfaceListenerType().String()), zap.Int("listenerCount", len(s.listeners)))
	s.listernerIdSeed++

	s.listeners = append(s.listeners, listener)

	s.msgChan <- SurfaceMessage{time: time.Now(), msgType: Close, err: errors.Errorf("listener added")}
	s.msgChan <- SurfaceMessage{time: time.Now(), msgType: Reconnect}

	log.Inst.Info("surface.addListener done", zap.String("serial", s.serial), zap.Int("id", listener.GetId()), zap.String("type", listener.GetSurfaceListenerType().String()), zap.Int("listenerCount", len(s.listeners)))
}

func (s *Surface) ForceReconnect() {
	log.Inst.Info("surface.ForceReconnect", zap.String("serial", s.serial), zap.Int("listenerCount", len(s.listeners)))

	s.msgChan <- SurfaceMessage{time: time.Now(), msgType: Close, err: errors.Errorf("ForceReconnect")}
	s.msgChan <- SurfaceMessage{time: time.Now(), msgType: Reconnect}

	log.Inst.Info("surface.ForceReconnect done", zap.String("serial", s.serial), zap.Int("listenerCount", len(s.listeners)))
}

// remove listener
func (s *Surface) RemoveListener(listener SurfaceListener) bool {
	s.listenerMutex.Lock()
	defer s.listenerMutex.Unlock()
	log.Inst.Info("surface.removeListener ", zap.String("serial", s.serial), zap.Int("id", listener.GetId()), zap.String("type", listener.GetSurfaceListenerType().String()), zap.Int("listenerCount", len(s.listeners)))

	isFound := false
	for i, l := range s.listeners {
		if l == listener {
			isFound = true
			l.OnRemove()
			s.listeners = append(s.listeners[:i], s.listeners[i+1:]...)
			break
		}
	}
	if len(s.listeners) <= 0 {
		s.msgChan <- SurfaceMessage{time: time.Now(), msgType: Close, err: errors.Errorf("no listener")}
	}
	log.Inst.Info("surface.removeListener done", zap.String("serial", s.serial), zap.Int("id", listener.GetId()), zap.String("type", listener.GetSurfaceListenerType().String()), zap.Int("listenerCount", len(s.listeners)))

	return isFound
}

func (s *Surface) GetStatus() SurfaceStatus {
	return SurfaceStatus{
		IsPlaying:              s.IsListenerExist(),
		LastFrameDeltaMillisec: time.Since(s.lastRecvTime).Milliseconds(),
	}
}

func (s *Surface) IsListenerExist() bool {
	return 0 < len(s.listeners)
}

func (s *Surface) FindListeners(listenerType SurfaceListenerType) []SurfaceListener {
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

func (s *Surface) RemoveAllListeners() {
	s.listenerMutex.Lock()
	defer s.listenerMutex.Unlock()
	log.Inst.Info("surface.removeAllListeners ", zap.String("serial", s.serial), zap.Int("listenerCount", len(s.listeners)))

	for _, l := range s.listeners {
		l.OnRemove()
	}
	s.listeners = make([]SurfaceListener, 0)
}

func (s *Surface) SetScreenCaptureOption(option *streaming.ScreenCaptureOption) {
	s.option = option
}

func (s *Surface) startRoutine(startTime time.Time) {
	log.Inst.Info("surface.startRoutine", zap.String("serial", s.serial))
	var lastSurfaceSource SurfaceSource
	var lastSurfaceReconnectCompleteTime time.Time = startTime
	var lastReconnectTryTime time.Time = startTime
	var lastSurfaceClosedTime time.Time = startTime
	for msg := range s.msgChan {
		switch msg.msgType {
		case Reconnect:
			if s.listeners == nil || len(s.listeners) == 0 {
				continue
			}
			if msg.time.Before(lastSurfaceReconnectCompleteTime) {
				log.Inst.Warn("surface.startRoutine reconnect ignored", zap.String("serial", s.serial), zap.Int64("msg.time", msg.time.Unix()), zap.Int64("surfaceCreatedTime", lastSurfaceReconnectCompleteTime.Unix()))
				continue
			}
			log.Inst.Debug("surface.startRoutine reconnect", zap.String("serial", s.serial))

			log.Inst.Debug("surface.startRoutine reconnect called", zap.String("serial", s.serial))
			deltaTimeMillisecond := 1000 - time.Since(lastReconnectTryTime).Milliseconds()
			if 0 < deltaTimeMillisecond {
				log.Inst.Warn("surface.notifySurfaceReconnect too fast. so wait", zap.String("serial", s.serial), zap.Int64("deltaTimeMillisecond", deltaTimeMillisecond))
				time.Sleep(time.Millisecond * time.Duration(deltaTimeMillisecond))
			}
			lastReconnectTryTime = time.Now()
			newSurfaceSource := s.surfaceSourceFactory()
			err := notifySurfaceReconnect(s.serial, s.option, newSurfaceSource)
			if err != nil {
				log.Inst.Error("surface.startRoutine reconnect error", zap.Error(err))
				s.msgChan <- SurfaceMessage{time: time.Now(), msgType: Reconnect}
				continue
			}
			lastSurfaceReconnectCompleteTime = time.Now()
			recvRoutineStartTime := time.Now() // caution recvRoutineStartTime must be after lastSurfaceReconnectCompleteTime
			recvRoutineStartTime = recvRoutineStartTime.Add(time.Millisecond * 100)
			go startRecvRoutine(newSurfaceSource,
				func(err error) {
					log.Inst.Warn("surface.startRecvRoutine failed", zap.String("serial", s.serial), zap.Error(err))
					s.msgChan <- SurfaceMessage{time: recvRoutineStartTime, msgType: Close, err: err}
					s.msgChan <- SurfaceMessage{time: recvRoutineStartTime, msgType: Reconnect}
				},
				func(buf []byte) {
					s.lastRecvTime = time.Now()
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
								newSurfaceSource.NotifyData(listener, s.firstTimeStamp, buf)
							}
						}

						currentTimestamp := uint32(time.Since(s.firstSendTime).Seconds()*90000) + s.firstTimeStamp
						for _, listener := range s.listeners {
							newSurfaceSource.NotifyData(listener, currentTimestamp, buf)
						}
					}()
				})

			lastSurfaceSource = newSurfaceSource
		case Close:
			if nil == msg.err {
				msg.err = errors.Errorf("unknown")
			}
			if nil == lastSurfaceSource {
				log.Inst.Warn("surface.startRoutine close. passed surface nil", zap.String("serial", s.serial))
				continue
			}
			log.Inst.Error("surface.startRoutine close", zap.String("serial", s.serial), zap.String("reason", msg.err.Error()))
			if msg.time.Before(lastSurfaceClosedTime) {
				log.Inst.Warn("surface.startRoutine close ignored", zap.String("serial", s.serial), zap.Int64("msg.time", msg.time.Unix()), zap.Int64("surfaceClosedTime", lastSurfaceClosedTime.Unix()))
				continue
			}

			notifySurfaceClose(s.serial, lastSurfaceSource, "close")

			lastSurfaceSource = nil
			lastSurfaceClosedTime = time.Now()
		}
	}
}

func notifySurfaceReconnect(serial string, option *streaming.ScreenCaptureOption, surface SurfaceSource) error {
	log.Inst.Info("surface.notifySurfaceReconnect", zap.String("serial", serial))

	err := surface.Connect(serial, option)
	if err != nil {
		log.Inst.Warn("surface.notifySurfaceReconnect failed", zap.String("serial", serial), zap.Error(err))
		return err
	}

	return nil
}

func notifySurfaceClose(serial string, surface SurfaceSource, reason string) {
	log.Inst.Info("surface.notifySurfaceClose", zap.String("serial", serial))
	log.Inst.Info("surface.notifySurfaceClose closed", zap.String("serial", serial), zap.String("reason", reason))
	surface.Close()
}

func startRecvRoutine(surface SurfaceSource, onError func(err error), onRead func(buf []byte)) {
	for {
		buf, err := surface.Receive()
		if err != nil {
			onError(err)
			return
		}
		onRead(buf)
	}
}
