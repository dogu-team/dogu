package device

import (
	"fmt"
	"sync"

	"go-device-controller/types/protocol/generated/proto/inner/types"
	"go-device-controller/types/protocol/generated/proto/outer"
	"go-device-controller/types/protocol/generated/proto/outer/streaming"

	"go-device-controller/internal/pkg/device/surface"
	log "go-device-controller/internal/pkg/log"
	"go-device-controller/internal/pkg/structs"

	gotypes "go-device-controller/types/types"

	"go.uber.org/zap"
)

type Devices struct {
	devicesMap    map[string]device
	devicesMutex  sync.RWMutex
	deviceMonitor *deviceMonitor
}

// NewSurfaceForwarder creates a new SurfaceForwarder
func NewDevices() *Devices {
	ds := Devices{}
	ds.devicesMap = make(map[string]device)
	ds.devicesMutex = sync.RWMutex{}
	ds.deviceMonitor = newDeviceMonitor(&ds.devicesMap)
	ds.deviceMonitor.startRoutine()
	return &ds
}

func (ds *Devices) OnDevicelistUpdated(devices []*types.DcGdcDeviceContext) {
	ds.devicesMutex.Lock()
	defer ds.devicesMutex.Unlock()

	for _, deviceContext := range devices {
		if device, ok := ds.devicesMap[deviceContext.Serial]; !ok {
			// added
			ds.onDeviceConnected(deviceContext)
		} else {
			// updated
			ds.onDeviceUpdated(device, deviceContext.ScreenUrl, deviceContext.InputUrl)
		}
	}

	for serial := range ds.devicesMap {
		found := false
		for _, deviceContext := range devices {
			if deviceContext.Serial == serial {
				found = true
				break
			}
		}
		if !found {
			// deleted
			ds.onDeviceDisconnected(serial)
		}
	}
}

func (ds *Devices) onDeviceConnected(context *types.DcGdcDeviceContext) {
	log.Inst.Info("Devices.OnDeviceConnected ",
		zap.String("serial", context.Serial),
		zap.String("platform", context.Platform.String()),
		zap.String("screenUrl", context.ScreenUrl),
		zap.String("inputUrl", context.InputUrl),
		zap.Uint32("screenWidth", context.ScreenWidth),
		zap.Uint32("screenHeight", context.ScreenHeight))
	var err error

	device := ds.devicesMap[context.Serial]
	if nil == device {
		device, err = newDevice(context)
		if nil == device {
			log.Inst.Error("Devices.OnDeviceConnected device create failed",
				zap.String("serial", context.Serial),
				zap.String("platform", context.Platform.String()),
				zap.Error(err))
			return
		}
		ds.devicesMap[context.Serial] = device
	}
}

// onDeviceUpdated
func (ds *Devices) onDeviceUpdated(d device, screenUrl string, inputUrl string) {
	// log.Inst.Debug("Devices.onDeviceUpdated ", zap.String("serial", d.Serial()), zap.String("url", agentUrl))

	d.UpdateUrl(screenUrl, inputUrl)
}

func (ds *Devices) onDeviceDisconnected(serial string) {
	log.Inst.Info("Devices.OnDeviceDisconnected", zap.String("serial", serial))

	device := ds.devicesMap[serial]
	if nil == device {
		log.Inst.Error("Devices.OnDeviceDisconnected device not found", zap.String("serial", serial))
		return
	}

	device.Surfaces().Remove()
	delete(ds.devicesMap, serial)
}

func (ds *Devices) AddSurfaceListener(serial string, listener surface.SurfaceListener, option *streaming.ScreenCaptureOption) *outer.ErrorResult {
	device := ds.findDevice(serial)
	if nil == device {
		log.Inst.Error("Devices.AddSurfaceListener device not found", zap.String("serial", serial), zap.Int32("type", option.GetScreenId()), zap.Int32("pid", option.GetPid()))
		return &outer.ErrorResult{
			Code:    outer.Code_CODE_DEVICE_NOTFOUND,
			Message: "device not found",
		}
	}
	screenId := surface.ScreenId(option.GetScreenId())
	pid := surface.Pid(option.GetPid())
	surfaceType := surface.NewSurfaceType(screenId, pid)

	surface := device.Surfaces().GetOrCreateSurface(surfaceType, surface.ScreenId(screenId), surface.Pid(pid))
	surface.SetScreenCaptureOption(option)
	surface.AddListener(listener)

	return gotypes.Success
}

func (ds *Devices) RemoveSurfaceListener(serial string, listener surface.SurfaceListener) bool {
	device := ds.findDevice(serial)
	if nil == device {
		log.Inst.Error("Devices.RemoveSurfaceListener device not found", zap.String("serial", serial))
		return false
	}

	return device.Surfaces().RemoveSurfaceListener(listener)
}

func (ds *Devices) FindSurfaceListeners(serial string, listenerType surface.SurfaceListenerType) []surface.SurfaceListener {
	device := ds.findDevice(serial)
	if nil == device {
		log.Inst.Error("Devices.FindSurfaceListener device not found", zap.String("serial", serial), zap.String("type", listenerType.String()))
		return make([]surface.SurfaceListener, 0)
	}
	listeners := device.Surfaces().FindListeners(listenerType)
	return listeners
}

func (ds *Devices) GetSurfaceStatus(a *types.DcGdcGetSurfaceStatusParam) types.DcGdcGetSurfaceStatusResult {
	device := ds.findDevice(a.GetSerial())
	if nil == device {
		log.Inst.Error("Devices.GetSurfaceStatus device not found", zap.String("serial", a.GetSerial()), zap.Int32("type", a.GetScreenId()), zap.Int32("pid", a.GetPid()))
		return types.DcGdcGetSurfaceStatusResult{
			HasSurface:             false,
			IsPlaying:              false,
			LastFrameDeltaMillisec: 0,
		}
	}
	screenId := surface.ScreenId(a.GetScreenId())
	pid := surface.Pid(a.GetPid())
	surfaceType := surface.NewSurfaceType(screenId, pid)

	status := device.Surfaces().GetStatus(surfaceType, screenId, pid)
	if nil == status {
		return types.DcGdcGetSurfaceStatusResult{
			HasSurface:             false,
			IsPlaying:              false,
			LastFrameDeltaMillisec: 0,
		}
	}
	return types.DcGdcGetSurfaceStatusResult{
		HasSurface:             true,
		IsPlaying:              status.IsPlaying,
		LastFrameDeltaMillisec: uint32(status.LastFrameDeltaMillisec),
	}
}

func (ds *Devices) OnDataChannel(serial string, ctx *structs.DatachannelContext) error {
	device := ds.findDevice(serial)
	if nil == device {
		log.Inst.Error("Devices.OnDataChannel device not found", zap.String("serial", serial))
		return fmt.Errorf("Devices.OnDataChannel device not found for device id: " + serial)
	}
	return device.OnDataChannel(ctx)
}

func (ds *Devices) OnPeerMessage(serial string, data []byte) error {
	device := ds.findDevice(serial)
	if nil == device {
		log.Inst.Error("Devices.OnPeerMessage device not found", zap.String("serial", serial))
		return fmt.Errorf("Devices.OnPeerMessage device not found for device id: " + serial)
	}
	return device.OnMessageFromPeer(data)
}

func (ds *Devices) GetContext(serial string) (types.DcGdcDeviceContext, error) {
	device := ds.findDevice(serial)
	if nil == device {
		log.Inst.Error("Devices.OnPeerMessage device not found", zap.String("serial", serial))
		return types.DcGdcDeviceContext{}, fmt.Errorf("Devices.OnPeerMessage device not found for device id: " + serial)
	}
	return *device.Context(), nil
}

// find device
func (ds *Devices) findDevice(serial string) device {
	ds.devicesMutex.RLock()
	defer ds.devicesMutex.RUnlock()

	device := ds.devicesMap[serial]
	return device
}
