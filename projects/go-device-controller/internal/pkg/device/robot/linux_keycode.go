//go:build darwin || linux

package robot

import (
	"errors"

	"go-device-controller/types/protocol/generated/proto/inner/types"
	"go-device-controller/types/protocol/generated/proto/outer"

)

func getKeyCode(code types.DeviceControlKeycode, platform outer.Platform) (PseudoKey, error) {
	return emptyPseudoKey, errors.New("not supported")
}
