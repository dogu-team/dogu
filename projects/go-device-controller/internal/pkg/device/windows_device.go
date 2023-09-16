package device

import (
	"go-device-controller/types/protocol/generated/proto/inner/types"
	"go-device-controller/types/protocol/generated/proto/outer"

	"go-device-controller/internal/pkg/device/datachannel"
	"go-device-controller/internal/pkg/device/robot"
	"go-device-controller/internal/pkg/device/surface"
	"go-device-controller/internal/pkg/structs"
)

type windowsDevice struct {
	context            *types.DcGdcDeviceContext
	surfaces           surface.Surfaces
	datachannelDemuxer datachannel.DatachannelDemuxer
}

var _wd device = &windowsDevice{}

func newWindowsDevice(context *types.DcGdcDeviceContext) (device, error) {
	d := windowsDevice{}
	d.context = context
	surfaceSourceFactory := func() surface.SurfaceSource {
		return surface.NewDesktopLibwebrtcSurfaceSource()
	}
	surfaceFactory := func(conn *surface.Surface, surfaceType surface.SurfaceType, screenId surface.ScreenId, pid surface.Pid) {
		surface.NewSurface(conn, context.Serial, outer.Platform_PLATFORM_WINDOWS, surfaceType, screenId, pid, surfaceSourceFactory)
	}
	surface.NewSurfaces(&d.surfaces, context.Serial, outer.Platform_PLATFORM_WINDOWS, surfaceFactory)

	datachannel.NewDatachannelDemuxer(&d.datachannelDemuxer,
		[]datachannel.DatachannelHandler{
			robot.NewDesktopControlHandler(outer.Platform_PLATFORM_WINDOWS),
		}, true)

	return &d, nil
}

func (d *windowsDevice) Context() *types.DcGdcDeviceContext {
	return d.context
}

func (d *windowsDevice) UpdateUrl(screenUrl string, inputUrl string) {
}

func (d *windowsDevice) Surfaces() *surface.Surfaces {
	return &d.surfaces
}

func (d *windowsDevice) OnDataChannel(ctx *structs.DatachannelContext) error {
	return d.datachannelDemuxer.OnDataChannel(ctx)
}

func (d *windowsDevice) OnMessageFromPeer(data []byte) error {
	return d.datachannelDemuxer.OnMessage(data)
}
