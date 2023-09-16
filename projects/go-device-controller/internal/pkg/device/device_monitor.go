package device

import (
	"time"

	"go-device-controller/internal/pkg/device/surface"
	log "go-device-controller/internal/pkg/log"

	"go.uber.org/zap"
)

var periodSec int64 = 5

type deviceMonitor struct {
	devices *map[string]device
	befTime time.Time
}

func newDeviceMonitor(devices *map[string]device) *deviceMonitor {
	sm := deviceMonitor{}
	sm.devices = devices
	sm.befTime = time.Now()
	return &sm
}

func (sm *deviceMonitor) startRoutine() {
	log.Inst.Info("deviceMonitor.startRoutine")
	go func() {
		for {
			time.Sleep(time.Duration(periodSec/2) * time.Second)
			sm.update()
		}
	}()
}

func (sm *deviceMonitor) update() {
	curTime := time.Now()
	diffTime := curTime.Sub(sm.befTime).Seconds()
	if diffTime < float64(periodSec) {
		return
	}
	allDeviceProfile := deviceProfile{Serial: "all"}
	deviceProfiles := []*deviceProfile{}
	for _, device := range *sm.devices {
		profiles := device.Surfaces().Profiles()
		for _, surfaceProfile := range profiles {
			deviceProfile := newDeviceProfile(device.Context().Serial, &surfaceProfile, diffTime)
			allDeviceProfile.ReadMBytesPerSec += deviceProfile.ReadMBytesPerSec
			allDeviceProfile.ReadCountPerSec += deviceProfile.ReadCountPerSec
			allDeviceProfile.ReadMilisecPerSec += deviceProfile.ReadMilisecPerSec

			surfaceProfile.ReadSizePerPeriod = 0
			surfaceProfile.ReadCountPerPeriod = 0
			surfaceProfile.ReadMillisecPerPeriod = 0
		}
	}
	deviceProfiles = append(deviceProfiles, &allDeviceProfile)

	if 0 < allDeviceProfile.ReadMBytesPerSec {
		log.Inst.Info("deviceMonitor.update", zap.Any("deviceProfiles", deviceProfiles))
	}

	sm.befTime = curTime
}

type deviceProfile struct {
	Serial            string
	ScreenId          surface.ScreenId
	Pid               surface.Pid
	ReadMBytesPerSec  float64
	ReadCountPerSec   float64
	ReadMilisecPerSec float64
}

func newDeviceProfile(serial string, surfaceProflile *surface.SurfaceProfile, diffTime float64) *deviceProfile {
	profile := deviceProfile{}
	profile.Serial = serial
	profile.ScreenId = surfaceProflile.ScreenId
	profile.Pid = surfaceProflile.Pid
	profile.ReadMBytesPerSec = float64(surfaceProflile.ReadSizePerPeriod) / 1024.0 / 1024.0 / diffTime
	profile.ReadCountPerSec = float64(surfaceProflile.ReadCountPerPeriod) / diffTime
	profile.ReadMilisecPerSec = float64(surfaceProflile.ReadMillisecPerPeriod) / diffTime
	return &profile
}
