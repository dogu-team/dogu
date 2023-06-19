package device

import (
	"go-device-controller/types/protocol/generated/proto/inner/types"

	"go-device-controller/internal/pkg/device/datachannel"
	"go-device-controller/internal/pkg/device/surface"
	"go-device-controller/internal/pkg/structs"
)

type iosDevice struct {
	context            *types.DcGdcDeviceContext
	surfaceConn        surface.SurfaceConnector
	datachannelDemuxer datachannel.DatachannelDemuxer
}

var _id device = &iosDevice{}

func (d *iosDevice) Context() *types.DcGdcDeviceContext {
	return d.context
}

func (d *iosDevice) UpdateUrl(screenUrl string, inputUrl string) {
	d.context.ScreenUrl = screenUrl
	d.context.InputUrl = inputUrl
}

func (d *iosDevice) Surface() *surface.SurfaceConnector {
	return &d.surfaceConn
}

func (d *iosDevice) OnDataChannel(ctx *structs.DatachannelContext) error {
	return d.datachannelDemuxer.OnDataChannel(ctx)
}

func (d *iosDevice) OnMessageFromPeer(data []byte) error {
	return d.datachannelDemuxer.OnMessage(data)
}
