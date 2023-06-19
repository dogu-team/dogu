package device

import (
	"errors"

	"go-device-controller/types/protocol/generated/proto/inner/types"
	"go-device-controller/types/protocol/generated/proto/outer"

	"go-device-controller/internal/pkg/device/datachannel"
	"go-device-controller/internal/pkg/device/robot"
	"go-device-controller/internal/pkg/device/surface"
	"go-device-controller/internal/pkg/structs"
)

type device interface {
	Context() *types.DcGdcDeviceContext
	UpdateUrl(screenUrl string, inputUrl string)

	Surface() *surface.SurfaceConnector

	// datachannel
	OnDataChannel(ctx *structs.DatachannelContext) error
	OnMessageFromPeer(data []byte) error
}

func newDevice(context *types.DcGdcDeviceContext) (device, error) {
	switch context.Platform {
	case outer.Platform_PLATFORM_ANDROID:
		d := aosDevice{}
		d.context = context
		surface.NewAosSurfaceConnector(&d.surfaceConn, context.Serial, &d.context.ScreenUrl)
		datachannel.NewDatachannelDemuxer(&d.datachannelDemuxer,
			[]datachannel.DatachannelHandler{
				datachannel.NewAosControlHandler(context.Serial, func() string {
					return d.context.InputUrl
				}),
			}, true)

		return &d, nil

	case outer.Platform_PLATFORM_IOS:
		d := iosDevice{}
		d.context = context
		surface.NewIosSurfaceConnector(&d.surfaceConn, context.Serial, &d.context.ScreenUrl)
		datachannel.NewDatachannelDemuxer(&d.datachannelDemuxer,
			[]datachannel.DatachannelHandler{
				datachannel.NewIosControlHandler(context.Serial, func() string {
					return d.context.InputUrl
				}),
			}, false)

		return &d, nil
	case outer.Platform_PLATFORM_WINDOWS:
		d := windowsDevice{}
		d.context = context
		surface.NewWindowsSurfaceConnector(&d.surfaceConn, context.Serial)

		datachannel.NewDatachannelDemuxer(&d.datachannelDemuxer,
			[]datachannel.DatachannelHandler{
				robot.NewDesktopControlHandler(),
			}, true)

		return &d, nil
	case outer.Platform_PLATFORM_MACOS:
		d := macosDevice{}
		d.context = context
		surface.NewMacSurfaceConnector(&d.surfaceConn, context.Serial)
		datachannel.NewDatachannelDemuxer(&d.datachannelDemuxer,
			[]datachannel.DatachannelHandler{
				robot.NewMacDesktopControlHandler(),
			}, true)

		return &d, nil
	}
	return nil, errors.New("invalid platform")
}
