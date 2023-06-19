package device

import (
	"go-device-controller/types/protocol/generated/proto/inner/types"

	"go-device-controller/internal/pkg/device/datachannel"
	"go-device-controller/internal/pkg/device/surface"
	"go-device-controller/internal/pkg/structs"
)

type windowsDevice struct {
	context            *types.DcGdcDeviceContext
	surfaceConn        surface.SurfaceConnector
	datachannelDemuxer datachannel.DatachannelDemuxer
}

var _wd device = &windowsDevice{}

func (d *windowsDevice) Context() *types.DcGdcDeviceContext {
	return d.context
}

func (d *windowsDevice) UpdateUrl(screenUrl string, inputUrl string) {
}

func (d *windowsDevice) Surface() *surface.SurfaceConnector {
	return &d.surfaceConn
}

func (d *windowsDevice) OnDataChannel(ctx *structs.DatachannelContext) error {
	return d.datachannelDemuxer.OnDataChannel(ctx)
}

func (d *windowsDevice) OnMessageFromPeer(data []byte) error {
	return d.datachannelDemuxer.OnMessage(data)
}

func (d *windowsDevice) GetSurfaceProfile() *surface.SurfaceProfile {
	return &d.surfaceConn.Profile
}
