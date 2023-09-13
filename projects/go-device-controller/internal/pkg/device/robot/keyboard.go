package robot

import (
	"errors"
	"fmt"
	"runtime"

	"go-device-controller/types/protocol/generated/proto/inner/types"
	"go-device-controller/types/protocol/generated/proto/outer"
	gotypes "go-device-controller/types/types"

	"go-device-controller/internal/pkg/log"

	"github.com/dogu-team/keybd_event"
	"github.com/go-vgo/robotgo"
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

func handleSetClipboard(c *types.DeviceControl, platform outer.Platform) *outer.ErrorResult {
	log.Inst.Debug("MessageHandler.handleSetClipboard start")

	log.Inst.Info("MessageHandler.clearAllMetaKeys")
	metaKeys := []string{"cmd", "lcmd", "rcmd", "alt", "lalt", "ralt", "ctrl", "lctrl", "rctrl", "shift", "lshift", "rshift"}
	for _, key := range metaKeys {
		robotgo.KeyToggle(key, "up")
	}
	err := robotgo.WriteAll(c.GetText())
	if nil != err {
		log.Inst.Debug("MessageHandler.handleSetClipboard fail", zap.String("err", err.Error()))
		return &outer.ErrorResult{
			Code:    outer.Code_CODE_DEVICE_CONTROLLER_INPUT_NOTSUPPORTED,
			Message: fmt.Sprintf("MessageHandler.handleControl clipboard set failed %s", err.Error()),
		}
	}

	metaKey := "ctrl"

	if runtime.GOOS == "darwin" {
		metaKey = "cmd"
	}
	robotgo.KeyToggle(metaKey)
	robotgo.MilliSleep(10)
	robotgo.KeyToggle("v")
	robotgo.MilliSleep(50)
	robotgo.KeyToggle("v", "up")
	robotgo.MilliSleep(10)
	robotgo.KeyToggle(metaKey, "up")

	log.Inst.Debug("MessageHandler.handleSetClipboard done")

	return gotypes.Success
}

func clearAllMetaKeys(kb *keybd_event.KeyBonding) {
	kb.Clear()
}

func getKeyCode(code types.DeviceControlKeycode, platform outer.Platform) (PseudoKey, error) {
	switch code {
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_A:
		return newPseudoKeyWithKey(keybd_event.VK_A)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_B:
		return newPseudoKeyWithKey(keybd_event.VK_B)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_C:
		return newPseudoKeyWithKey(keybd_event.VK_C)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_D:
		return newPseudoKeyWithKey(keybd_event.VK_D)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_E:
		return newPseudoKeyWithKey(keybd_event.VK_E)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F:
		return newPseudoKeyWithKey(keybd_event.VK_F)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_G:
		return newPseudoKeyWithKey(keybd_event.VK_G)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_H:
		return newPseudoKeyWithKey(keybd_event.VK_H)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_I:
		return newPseudoKeyWithKey(keybd_event.VK_I)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_J:
		return newPseudoKeyWithKey(keybd_event.VK_J)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_K:
		return newPseudoKeyWithKey(keybd_event.VK_K)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_L:
		return newPseudoKeyWithKey(keybd_event.VK_L)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_M:
		return newPseudoKeyWithKey(keybd_event.VK_M)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_N:
		return newPseudoKeyWithKey(keybd_event.VK_N)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_O:
		return newPseudoKeyWithKey(keybd_event.VK_O)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_P:
		return newPseudoKeyWithKey(keybd_event.VK_P)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_Q:
		return newPseudoKeyWithKey(keybd_event.VK_Q)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_R:
		return newPseudoKeyWithKey(keybd_event.VK_R)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_S:
		return newPseudoKeyWithKey(keybd_event.VK_S)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_T:
		return newPseudoKeyWithKey(keybd_event.VK_T)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_U:
		return newPseudoKeyWithKey(keybd_event.VK_U)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_V:
		return newPseudoKeyWithKey(keybd_event.VK_V)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_W:
		return newPseudoKeyWithKey(keybd_event.VK_W)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_X:
		return newPseudoKeyWithKey(keybd_event.VK_X)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_Y:
		return newPseudoKeyWithKey(keybd_event.VK_Y)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_Z:
		return newPseudoKeyWithKey(keybd_event.VK_Z)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_0:
		return newPseudoKeyWithKey(keybd_event.VK_0)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_1:
		return newPseudoKeyWithKey(keybd_event.VK_1)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_2:
		return newPseudoKeyWithKey(keybd_event.VK_2)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_3:
		return newPseudoKeyWithKey(keybd_event.VK_3)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_4:
		return newPseudoKeyWithKey(keybd_event.VK_4)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_5:
		return newPseudoKeyWithKey(keybd_event.VK_5)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_6:
		return newPseudoKeyWithKey(keybd_event.VK_6)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_7:
		return newPseudoKeyWithKey(keybd_event.VK_7)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_8:
		return newPseudoKeyWithKey(keybd_event.VK_8)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_9:
		return newPseudoKeyWithKey(keybd_event.VK_9)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F1:
		return newPseudoKeyWithKey(keybd_event.VK_F1)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F2:
		return newPseudoKeyWithKey(keybd_event.VK_F2)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F3:
		return newPseudoKeyWithKey(keybd_event.VK_F3)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F4:
		return newPseudoKeyWithKey(keybd_event.VK_F4)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F5:
		return newPseudoKeyWithKey(keybd_event.VK_F5)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F6:
		return newPseudoKeyWithKey(keybd_event.VK_F6)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F7:
		return newPseudoKeyWithKey(keybd_event.VK_F7)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F8:
		return newPseudoKeyWithKey(keybd_event.VK_F8)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F9:
		return newPseudoKeyWithKey(keybd_event.VK_F9)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F10:
		return newPseudoKeyWithKey(keybd_event.VK_F10)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F11:
		return newPseudoKeyWithKey(keybd_event.VK_F11)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F12:
		return newPseudoKeyWithKey(keybd_event.VK_F12)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_DEL:
		return newPseudoKeyWithKey(keybd_event.VK_DELETE)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_FORWARD_DEL:
		return newPseudoKeyWithKey(keybd_event.VK_ForwardDelete)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_ENTER:
		return newPseudoKeyWithKey(keybd_event.VK_ENTER)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_TAB:
		return newPseudoKeyWithKey(keybd_event.VK_TAB)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_ESCAPE:
		return newPseudoKeyWithKey(keybd_event.VK_ESC)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_DPAD_UP:
		return newPseudoKeyWithKey(keybd_event.VK_UP)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_DPAD_DOWN:
		return newPseudoKeyWithKey(keybd_event.VK_DOWN)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_DPAD_RIGHT:
		return newPseudoKeyWithKey(keybd_event.VK_RIGHT)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_DPAD_LEFT:
		return newPseudoKeyWithKey(keybd_event.VK_LEFT)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_MOVE_HOME:
		return newPseudoKeyWithKey(keybd_event.VK_HOME)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_MOVE_END:
		return newPseudoKeyWithKey(keybd_event.VK_END)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_PAGE_UP:
		return newPseudoKeyWithKey(keybd_event.VK_PAGEUP)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_PAGE_DOWN:
		return newPseudoKeyWithKey(keybd_event.VK_PAGEDOWN)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_META_LEFT:
		return PseudoKey{
			key:      -1,
			hasSuper: true,
		}, nil
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_META_RIGHT:
		return PseudoKey{
			key:      -1,
			hasSuper: true,
		}, nil
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_ALT_LEFT:
		return PseudoKey{
			key:    -1,
			hasALT: true,
		}, nil
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_ALT_RIGHT:
		return PseudoKey{
			key:      -1,
			hasALTGR: true,
		}, nil
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_CTRL_LEFT:
		return PseudoKey{
			key:     -1,
			hasCTRL: true,
		}, nil
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_CTRL_RIGHT:
		return PseudoKey{
			key:     -1,
			hasCTRL: true,
		}, nil
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_SHIFT_LEFT:
		return PseudoKey{
			key:      -1,
			hasSHIFT: true,
		}, nil
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_SHIFT_RIGHT:
		return PseudoKey{
			key:       -1,
			hasRSHIFT: true,
		}, nil
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_SWITCH_CHARSET:
		return emptyPseudoKey, errors.New("not supported")
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_CAPS_LOCK:
		return newPseudoKeyWithKey(keybd_event.VK_CAPSLOCK)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_SPACE:
		return newPseudoKeyWithKey(keybd_event.VK_SPACE)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_SYSRQ:
		return emptyPseudoKey, errors.New("not supported")
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_VOLUME_MUTE:
		return newPseudoKeyWithKey(keybd_event.VK_MUTE)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_VOLUME_DOWN:
		return newPseudoKeyWithKey(keybd_event.VK_VOLUMEDOWN)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_VOLUME_UP:
		return newPseudoKeyWithKey(keybd_event.VK_VOLUMEUP)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_INSERT:
		return emptyPseudoKey, errors.New("not supported")
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_0:
		return newPseudoKeyWithKey(keybd_event.VK_Keypad0)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_1:
		return newPseudoKeyWithKey(keybd_event.VK_Keypad1)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_2:
		return newPseudoKeyWithKey(keybd_event.VK_Keypad2)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_3:
		return newPseudoKeyWithKey(keybd_event.VK_Keypad3)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_4:
		return newPseudoKeyWithKey(keybd_event.VK_Keypad4)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_5:
		return newPseudoKeyWithKey(keybd_event.VK_Keypad5)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_6:
		return newPseudoKeyWithKey(keybd_event.VK_Keypad6)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_7:
		return newPseudoKeyWithKey(keybd_event.VK_Keypad7)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_8:
		return newPseudoKeyWithKey(keybd_event.VK_Keypad8)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_9:
		return newPseudoKeyWithKey(keybd_event.VK_Keypad9)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUM_LOCK:
		return emptyPseudoKey, errors.New("not supported")
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_PERIOD:
		return newPseudoKeyWithKey(keybd_event.VK_Period)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_DOT:
		return emptyPseudoKey, errors.New("not supported")
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_ADD:
		return newPseudoKeyWithKey(keybd_event.VK_KeypadPlus)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_SUBTRACT:
		return newPseudoKeyWithKey(keybd_event.VK_KeypadMinus)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_MULTIPLY:
		return newPseudoKeyWithKey(keybd_event.VK_KeypadMultiply)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_DIVIDE:
		return newPseudoKeyWithKey(keybd_event.VK_KeypadDivide)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_CLEAR:
		return newPseudoKeyWithKey(keybd_event.VK_KeypadClear)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_ENTER:
		return newPseudoKeyWithKey(keybd_event.VK_KeypadEnter)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_EQUALS:
		return newPseudoKeyWithKey(keybd_event.VK_KeypadEquals)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_COMMA:
		return newPseudoKeyWithKey(keybd_event.VK_COMMA)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_SLASH:
		return newPseudoKeyWithKey(keybd_event.VK_SLASH)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_BACKSLASH:
		return newPseudoKeyWithKey(keybd_event.VK_BACKSLASH)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_PLUS:
		return newPseudoKeyWithKey(keybd_event.VK_SP3)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_MINUS:
		return newPseudoKeyWithKey(keybd_event.VK_SP2)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_EQUALS:
		return newPseudoKeyWithKey(keybd_event.VK_SP3)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_SEMICOLON:
		return newPseudoKeyWithKey(keybd_event.VK_SP6)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_LEFT_BRACKET:
		return newPseudoKeyWithKey(keybd_event.VK_SP4)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_RIGHT_BRACKET:
		return newPseudoKeyWithKey(keybd_event.VK_SP5)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_GRAVE:
		return newPseudoKeyWithKey(keybd_event.VK_SP1)
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_APOSTROPHE:
		return newPseudoKeyWithKey(keybd_event.VK_SP7)
	}
	return emptyPseudoKey, errors.New("not supported")
}
