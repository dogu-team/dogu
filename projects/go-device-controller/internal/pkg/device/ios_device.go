package device

import (
	"go-device-controller/types/protocol/generated/proto/inner/types"
	"go-device-controller/types/protocol/generated/proto/outer"

	"go-device-controller/internal/pkg/device/datachannel"
	"go-device-controller/internal/pkg/device/surface"
	"go-device-controller/internal/pkg/structs"
)

type iosDevice struct {
	context            *types.DcGdcDeviceContext
	surfaces           surface.Surfaces
	datachannelDemuxer datachannel.ControlDatachannelDemuxer
}

var _id device = &iosDevice{}

func newIosDevice(context *types.DcGdcDeviceContext) (device, error) {
	d := iosDevice{}
	d.context = context
	surfaceSourceFactory := func() surface.SurfaceSource {
		return surface.NewIosSurfaceSource(&d.context.ScreenUrl)
	}
	surfaceFactory := func(conn *surface.Surface, surfaceType surface.SurfaceType, screenId surface.ScreenId, pid surface.Pid) {
		surface.NewSurface(conn, context.Serial, outer.Platform_PLATFORM_IOS, surfaceType, screenId, pid, surfaceSourceFactory)
	}
	surface.NewSurfaces(&d.surfaces, context.Serial, outer.Platform_PLATFORM_IOS, surfaceFactory)

	datachannel.NewDatachannelDemuxer(&d.datachannelDemuxer,
		[]datachannel.DatachannelHandler{
			datachannel.NewIosControlHandler(context.Serial, func() string {
				return d.context.InputUrl
			}),
		}, false)

	return &d, nil
}

func (d *iosDevice) Context() *types.DcGdcDeviceContext {
	return d.context
}

func (d *iosDevice) UpdateUrl(screenUrl string, inputUrl string) {
	d.context.ScreenUrl = screenUrl
	d.context.InputUrl = inputUrl
}

func (d *iosDevice) Surfaces() *surface.Surfaces {
	return &d.surfaces
}

func (d *iosDevice) OnDataChannel(ctx *structs.DatachannelContext) error {
	return d.datachannelDemuxer.OnDataChannel(ctx)
}

func (d *iosDevice) ReconnectControlSession() error {
	return d.datachannelDemuxer.Reconnect()
}

func (d *iosDevice) OnMessageFromPeer(data []byte) error {
	return d.datachannelDemuxer.OnMessage(data)
}
