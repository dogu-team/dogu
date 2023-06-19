package device

import (
	"go-device-controller/types/protocol/generated/proto/inner/types"

	"go-device-controller/internal/pkg/device/datachannel"
	"go-device-controller/internal/pkg/device/surface"
	"go-device-controller/internal/pkg/structs"
)

type macosDevice struct {
	context            *types.DcGdcDeviceContext
	surfaceConn        surface.SurfaceConnector
	datachannelDemuxer datachannel.DatachannelDemuxer
}

var _md device = &macosDevice{}

func (d *macosDevice) Context() *types.DcGdcDeviceContext {
	return d.context
}

func (d *macosDevice) UpdateUrl(screenUrl string, inputUrl string) {
}

func (d *macosDevice) Surface() *surface.SurfaceConnector {
	return &d.surfaceConn
}

func (d *macosDevice) OnDataChannel(ctx *structs.DatachannelContext) error {
	return d.datachannelDemuxer.OnDataChannel(ctx)
}

func (d *macosDevice) OnMessageFromPeer(data []byte) error {
	return d.datachannelDemuxer.OnMessage(data)
}

func (d *macosDevice) GetSurfaceProfile() *surface.SurfaceProfile {
	return &d.surfaceConn.Profile
}
