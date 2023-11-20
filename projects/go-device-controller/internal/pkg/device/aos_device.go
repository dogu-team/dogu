package device

import (
	"go-device-controller/types/protocol/generated/proto/inner/types"
	"go-device-controller/types/protocol/generated/proto/outer"

	"go-device-controller/internal/pkg/device/datachannel"
	"go-device-controller/internal/pkg/device/surface"
	"go-device-controller/internal/pkg/structs"
)

type aosDevice struct {
	context            *types.DcGdcDeviceContext
	surfaces           surface.Surfaces
	datachannelDemuxer datachannel.ControlDatachannelDemuxer
}

var _ad device = &aosDevice{}

func newAosDevice(context *types.DcGdcDeviceContext) (device, error) {
	d := aosDevice{}
	d.context = context
	surfaceSourceFactory := func() surface.SurfaceSource {
		return surface.NewAosSurfaceSource(&d.context.ScreenUrl)
	}
	surfaceFactory := func(conn *surface.Surface, surfaceType surface.SurfaceType, screenId surface.ScreenId, pid surface.Pid) {
		surface.NewSurface(conn, context.Serial, outer.Platform_PLATFORM_ANDROID, surfaceType, screenId, pid, surfaceSourceFactory)
	}
	surface.NewSurfaces(&d.surfaces, context.Serial, outer.Platform_PLATFORM_ANDROID, surfaceFactory)

	datachannel.NewDatachannelDemuxer(&d.datachannelDemuxer,
		[]datachannel.DatachannelHandler{
			datachannel.NewAosControlHandler(context.Serial, func() string {
				return d.context.InputUrl
			}),
		}, true)

	return &d, nil
}

func (d *aosDevice) Context() *types.DcGdcDeviceContext {
	return d.context
}

func (d *aosDevice) UpdateUrl(screenUrl string, inputUrl string) {
	d.context.ScreenUrl = screenUrl
	d.context.InputUrl = inputUrl
}

func (d *aosDevice) Surfaces() *surface.Surfaces {
	return &d.surfaces
}

func (d *aosDevice) OnDataChannel(ctx *structs.DatachannelContext) error {
	return d.datachannelDemuxer.OnDataChannel(ctx)
}

func (d *aosDevice) ReconnectControlSession() error {
	return d.datachannelDemuxer.Reconnect()
}

func (d *aosDevice) OnMessageFromPeer(data []byte) error {
	return d.datachannelDemuxer.OnMessage(data)
}
