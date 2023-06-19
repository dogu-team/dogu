package streamer

import (
	"time"

	log "go-device-controller/internal/pkg/log"

	"go.uber.org/zap"
)

var periodSec int64 = 5

type StreamMonitor struct {
	streamers *[]*Streamer
	befTime   time.Time
}

func newStreamMonitor(streamers *[]*Streamer) *StreamMonitor {
	sm := StreamMonitor{}
	sm.streamers = streamers
	sm.befTime = time.Now()
	return &sm
}

func (sm *StreamMonitor) startRoutine() {
	log.Inst.Info("StreamMonitor.startRoutine")
	go func() {
		for {
			time.Sleep(time.Duration(periodSec/2) * time.Second)
			sm.update()
		}
	}()
}

func (sm *StreamMonitor) update() {
	curTime := time.Now()
	diffTime := curTime.Sub(sm.befTime).Seconds()
	if diffTime < float64(periodSec) {
		return
	}
	defer func() { sm.befTime = curTime }()

	allStreamProfile := streamProfile{Serial: "all", Seq: 0}
	streamProfiles := []*streamProfile{}
	for _, streamer := range *sm.streamers {
		streamProfile := newStreamProfile(streamer, diffTime)

		allStreamProfile.SendMBytesPerSec += streamProfile.SendMBytesPerSec
		allStreamProfile.SendCountPerSec += streamProfile.SendCountPerSec
		allStreamProfile.SendMilisecPerSec += streamProfile.SendMilisecPerSec

		streamProfiles = append(streamProfiles, streamProfile)

		streamer.sentBytePerPeriod = 0
		streamer.sentCountPerPeriod = 0
		streamer.sendMillisecPerPeriod = 0
	}
	streamProfiles = append(streamProfiles, &allStreamProfile)

	if 0 < allStreamProfile.SendMBytesPerSec {
		log.Inst.Info("streamMonitor.update", zap.Any("streamProfiles", streamProfiles))
	}
}

type streamProfile struct {
	Serial            string
	Seq               int
	SendMBytesPerSec  float64
	SendCountPerSec   float64
	SendMilisecPerSec float64
}

func newStreamProfile(streamer *Streamer, diffTime float64) *streamProfile {
	sp := streamProfile{}
	sp.Serial = streamer.serial
	sp.Seq = streamer.seq
	sp.SendMBytesPerSec = (float64(streamer.sentBytePerPeriod) / 1024.0 / 1024.0 / diffTime)
	sp.SendCountPerSec = (float64(streamer.sentCountPerPeriod) / diffTime)
	sp.SendMilisecPerSec = (float64(streamer.sendMillisecPerPeriod) / diffTime)
	return &sp
}
