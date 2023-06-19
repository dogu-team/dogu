package device

import (
	"go-device-controller/types/protocol/generated/proto/inner/types"

	"go-device-controller/internal/pkg/device/datachannel"
	"go-device-controller/internal/pkg/device/surface"
	"go-device-controller/internal/pkg/structs"
)

type aosDevice struct {
	context            *types.DcGdcDeviceContext
	surfaceConn        surface.SurfaceConnector
	datachannelDemuxer datachannel.DatachannelDemuxer
}

var _ad device = &aosDevice{}

func (d *aosDevice) Context() *types.DcGdcDeviceContext {
	return d.context
}

func (d *aosDevice) UpdateUrl(screenUrl string, inputUrl string) {
	d.context.ScreenUrl = screenUrl
	d.context.InputUrl = inputUrl
}

func (d *aosDevice) Surface() *surface.SurfaceConnector {
	return &d.surfaceConn
}

func (d *aosDevice) OnDataChannel(ctx *structs.DatachannelContext) error {
	return d.datachannelDemuxer.OnDataChannel(ctx)
}

func (d *aosDevice) OnMessageFromPeer(data []byte) error {
	return d.datachannelDemuxer.OnMessage(data)
}
