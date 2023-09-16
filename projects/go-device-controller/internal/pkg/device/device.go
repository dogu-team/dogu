package device

import (
	"errors"

	"go-device-controller/types/protocol/generated/proto/inner/types"
	"go-device-controller/types/protocol/generated/proto/outer"

	"go-device-controller/internal/pkg/device/surface"
	"go-device-controller/internal/pkg/structs"
)

type device interface {
	Context() *types.DcGdcDeviceContext
	UpdateUrl(screenUrl string, inputUrl string)

	Surfaces() *surface.Surfaces

	// datachannel
	OnDataChannel(ctx *structs.DatachannelContext) error
	OnMessageFromPeer(data []byte) error
}

func newDevice(context *types.DcGdcDeviceContext) (device, error) {
	switch context.Platform {
	case outer.Platform_PLATFORM_ANDROID:
		return newAosDevice(context)
	case outer.Platform_PLATFORM_IOS:
		return newIosDevice(context)
	case outer.Platform_PLATFORM_WINDOWS:
		return newWindowsDevice(context)
	case outer.Platform_PLATFORM_MACOS:
		return newMacOSDevice(context)
	}
	return nil, errors.New("invalid platform")
}
