package robot

import (
	"fmt"
	"runtime"
	"time"

	"go-device-controller/types/protocol/generated/proto/inner/types"
	"go-device-controller/types/protocol/generated/proto/outer"
	gotypes "go-device-controller/types/types"

	"go-device-controller/internal/pkg/log"

	"github.com/atotto/clipboard"
	"github.com/dogu-team/keybd_event"
	"go.uber.org/zap"
)

type PseudoKey struct {
	key       int
	hasCTRL   bool
	hasALT    bool
	hasSHIFT  bool
	hasRCTRL  bool
	hasRSHIFT bool
	hasALTGR  bool
	hasSuper  bool
}

var emptyPseudoKey = PseudoKey{}

func newPseudoKeyWithKey(key int) (PseudoKey, error) {
	return PseudoKey{
		key: key,
	}, nil
}

func (p *PseudoKey) applyToKeyBonding(kb *keybd_event.KeyBonding) {
	if p.hasALT {
		kb.HasALT(true)
	}
	if p.hasALTGR {
		kb.HasALTGR(true)
	}
	if p.hasCTRL {
		kb.HasCTRL(true)
	}
	if p.hasRCTRL {
		kb.HasCTRLR(true)
	}
	if p.hasSHIFT {
		kb.HasSHIFT(true)
	}
	if p.hasRSHIFT {
		kb.HasSHIFTR(true)
	}
	if p.hasSuper {
		kb.HasSuper(true)
	}
	if p.key >= 0 {
		kb.SetKeys(p.key)
	}
}

func (p *PseudoKey) revertToKeyBonding(kb *keybd_event.KeyBonding) {
	if p.hasALT {
		kb.HasALT(false)
	}
	if p.hasALTGR {
		kb.HasALTGR(false)
	}
	if p.hasCTRL {
		kb.HasCTRL(false)
	}
	if p.hasRCTRL {
		kb.HasCTRLR(false)
	}
	if p.hasSHIFT {
		kb.HasSHIFT(false)
	}
	if p.hasRSHIFT {
		kb.HasSHIFTR(false)
	}
	if p.hasSuper {
		kb.HasSuper(false)
	}
	kb.RemoveKey(p.key)
}

// keyboard
func handleControlInjectKeyCode(c *types.DeviceControl, platform outer.Platform, kb *keybd_event.KeyBonding) *outer.ErrorResult {
	if c.Type != types.DeviceControlType_DEVICE_CONTROL_TYPE_DESKTOP_INJECT_KEYCODE {
		return &outer.ErrorResult{
			Code:    outer.Code_CODE_DEVICE_CONTROLLER_INPUT_NOTSUPPORTED,
			Message: fmt.Sprintf("MessageHandler.handleControlInjectKeyCode invalid type %s", c.Type.String()),
		}
	}

	pseudoKey, error := getKeyCode(c.Keycode, platform)
	if nil != error {
		return &outer.ErrorResult{
			Code:    outer.Code_CODE_DEVICE_CONTROLLER_INPUT_UNKNOWN,
			Message: fmt.Sprintf("MessageHandler.handleControlInjectKeyCode unknown msg:%s", error.Error()),
		}
	}
	pseudoKey.applyToKeyBonding(kb)

	log.Inst.Debug("MessageHandler.handleControlInjectKeyCode", zap.String("key", c.Keycode.String()), zap.Int("action", int(c.Action.Number())))
	switch c.Action {
	case types.DeviceControlAction_DEVICE_CONTROL_ACTION_DESKTOP_ACTION_DOWN_UNSPECIFIED:
		error = kb.Press()
	case types.DeviceControlAction_DEVICE_CONTROL_ACTION_DESKTOP_ACTION_UP:
		error = kb.Release()
		pseudoKey.revertToKeyBonding(kb)
	}

	if nil != error {
		return &outer.ErrorResult{
			Code:    outer.Code_CODE_DEVICE_CONTROLLER_INPUT_UNKNOWN,
			Message: fmt.Sprintf("MessageHandler.handleControlInjectKeyCode unknown msg:%s", error.Error()),
		}
	}
	return gotypes.Success
}

var lastPasteTime = time.Now()

func handleSetClipboard(c *types.DeviceControl, platform outer.Platform, kb *keybd_event.KeyBonding) *outer.ErrorResult {
	log.Inst.Debug("MessageHandler.handleSetClipboard start")
	delta := time.Now().Sub(lastPasteTime)
	if delta < 2000*time.Second {
		log.Inst.Debug("MessageHandler.handleSetClipboard too fast", zap.Duration("delta", delta))
		return &outer.ErrorResult{
			Code:    outer.Code_CODE_DEVICE_CONTROLLER_INPUT_NOTSUPPORTED,
			Message: fmt.Sprintf("MessageHandler.handleControl clipboard too fast %s", delta.String()),
		}
	}

	log.Inst.Info("MessageHandler.clearAllMetaKeys")
	err := clipboard.WriteAll(c.GetText())
	if nil != err {
		log.Inst.Debug("MessageHandler.handleSetClipboard fail", zap.String("err", err.Error()))
		return &outer.ErrorResult{
			Code:    outer.Code_CODE_DEVICE_CONTROLLER_INPUT_NOTSUPPORTED,
			Message: fmt.Sprintf("MessageHandler.handleControl clipboard set failed %s", err.Error()),
		}
	}
	kb.Clear()
	lastPasteTime = time.Now()

	if runtime.GOOS == "darwin" {
		kb.HasSuper(true)
	} else {
		kb.HasCTRL(true)
	}
	kb.SetKeys(keybd_event.VK_V)

	kb.Press()
	time.Sleep(100 * time.Millisecond)
	kb.Release()

	log.Inst.Debug("MessageHandler.handleSetClipboard done")

	kb.Clear()

	return gotypes.Success
}

func clearAllMetaKeys(kb *keybd_event.KeyBonding) {
	kb.Clear()
}
