package device

import (
	"go-device-controller/types/protocol/generated/proto/inner/types"
	"go-device-controller/types/protocol/generated/proto/outer"

	"go-device-controller/internal/pkg/device/datachannel"
	"go-device-controller/internal/pkg/device/robot"
	"go-device-controller/internal/pkg/device/surface"
	"go-device-controller/internal/pkg/structs"
)

type macosDevice struct {
	context            *types.DcGdcDeviceContext
	surfaces           surface.Surfaces
	datachannelDemuxer datachannel.DatachannelDemuxer
}

var _md device = &macosDevice{}

func newMacOSDevice(context *types.DcGdcDeviceContext) (device, error) {
	d := macosDevice{}
	d.context = context

	surfaceSourceFactory := func() surface.SurfaceSource {
		return surface.NewDesktopLibwebrtcSurfaceSource()
	}
	surfaceFactory := func(conn *surface.Surface, surfaceType surface.SurfaceType, screenId surface.ScreenId, pid surface.Pid) {
		surface.NewSurface(conn, context.Serial, outer.Platform_PLATFORM_MACOS, surfaceType, screenId, pid, surfaceSourceFactory)
	}
	surface.NewSurfaces(&d.surfaces, context.Serial, outer.Platform_PLATFORM_MACOS, surfaceFactory)

	datachannel.NewDatachannelDemuxer(&d.datachannelDemuxer,
		[]datachannel.DatachannelHandler{
			robot.NewDesktopControlHandler(outer.Platform_PLATFORM_MACOS),
		}, true)

	return &d, nil
}

func (d *macosDevice) Context() *types.DcGdcDeviceContext {
	return d.context
}

func (d *macosDevice) UpdateUrl(screenUrl string, inputUrl string) {
}

func (d *macosDevice) Surfaces() *surface.Surfaces {
	return &d.surfaces
}

func (d *macosDevice) OnDataChannel(ctx *structs.DatachannelContext) error {
	return d.datachannelDemuxer.OnDataChannel(ctx)
}

func (d *macosDevice) OnMessageFromPeer(data []byte) error {
	return d.datachannelDemuxer.OnMessage(data)
}
