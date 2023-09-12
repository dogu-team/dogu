package robot

import (
	"fmt"
	"runtime"

	"go-device-controller/types/protocol/generated/proto/inner/types"
	"go-device-controller/types/protocol/generated/proto/outer"
	gotypes "go-device-controller/types/types"

	"go-device-controller/internal/pkg/log"

	"github.com/go-vgo/robotgo"
	"go.uber.org/zap"
)

type ShouldTypeKeys struct {
	keycode  types.DeviceControlKeycode
	key      string
	shiftKey string
}

// keyboard
func handleControlInjectKeyCode(c *types.DeviceControl, platform outer.Platform, keyMaps map[string]bool) *outer.ErrorResult {
	var inputError error
	if c.Type != types.DeviceControlType_DEVICE_CONTROL_TYPE_DESKTOP_INJECT_KEYCODE {
		return &outer.ErrorResult{
			Code:    outer.Code_CODE_DEVICE_CONTROLLER_INPUT_NOTSUPPORTED,
			Message: fmt.Sprintf("MessageHandler.handleControlInjectKeyCode invalid type %s", c.Type.String()),
		}
	}

	key := getKeyCode(c.Keycode, platform)
	if len(key) == 0 {
		return &outer.ErrorResult{
			Code:    outer.Code_CODE_DEVICE_CONTROLLER_INPUT_NOTSUPPORTED,
			Message: fmt.Sprintf("MessageHandler.handleControlInjectKeyCode invalid keycode %s", c.Keycode.String()),
		}
	}
	metaInterfaces := calculateKeyMetas(c)
	log.Inst.Debug("MessageHandler.handleControlInjectKeyCode", zap.String("key", key),
		zap.Int("action", int(c.Action.Number())),
		zap.String("meta", fmt.Sprintf("%v", metaInterfaces)),
		zap.Strings("pressedKeys", getPressedKeys(keyMaps)))
	markKeyPress(c.Action, key, keyMaps)
	inputError = robotgo.KeyToggle(key, metaInterfaces...)

	if nil != inputError {
		return &outer.ErrorResult{
			Code:    outer.Code_CODE_DEVICE_CONTROLLER_INPUT_UNKNOWN,
			Message: fmt.Sprintf("MessageHandler.handleControlInjectKeyCode unknown msg:%s", inputError.Error()),
		}
	}
	return gotypes.Success
}

func handleSetClipboard(c *types.DeviceControl, platform outer.Platform, keyMaps map[string]bool) *outer.ErrorResult {
	log.Inst.Debug("MessageHandler.handleSetClipboard start")
	clearAllMetaKeys(keyMaps)
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

	clearAllMetaKeys(keyMaps)

	log.Inst.Debug("MessageHandler.handleSetClipboard done")

	return gotypes.Success
}

func clearPressedMetaKeys(keyMaps map[string]bool) {
	for key, pressed := range keyMaps {
		if pressed {
			robotgo.KeyToggle(key, "up")
			log.Inst.Info("MessageHandler.clearPressedMetaKeys", zap.String("key", key), zap.Bool("pressed", pressed))
			keyMaps[key] = false
		}
	}
	robotgo.MilliSleep(50)
}

func clearAllMetaKeys(keyMaps map[string]bool) {
	log.Inst.Info("MessageHandler.clearAllMetaKeys")
	metaKeys := []string{"cmd", "lcmd", "rcmd", "alt", "lalt", "ralt", "ctrl", "lctrl", "rctrl", "shift", "lshift", "rshift"}
	for _, key := range metaKeys {
		robotgo.KeyToggle(key, "up")
		keyMaps[key] = false
	}
}

func getPressedKeys(keyMaps map[string]bool) []string {
	var pressedKeys []string
	for key, pressed := range keyMaps {
		if pressed {
			pressedKeys = append(pressedKeys, key)
		}
	}
	return pressedKeys
}

func calculateKeyMetas(c *types.DeviceControl) []interface{} {
	var metaInterfaces []interface{}
	switch c.Action {
	case types.DeviceControlAction_DEVICE_CONTROL_ACTION_DESKTOP_ACTION_UP:
		metaInterfaces = append(metaInterfaces, "up")
	}

	return metaInterfaces
}

func markKeyPress(action types.DeviceControlAction, keyStr string, keyMaps map[string]bool) {
	switch action {
	case types.DeviceControlAction_DEVICE_CONTROL_ACTION_DESKTOP_ACTION_UP:
		keyMaps[keyStr] = false
	default:
		keyMaps[keyStr] = true
	}
}

func getKeyCode(code types.DeviceControlKeycode, platform outer.Platform) string {
	// ref: https://github.com/go-vgo/robotgo/blob/master/doc.go, https://github.com/vcaesar/keycode/blob/main/keycode.go#L146
	switch code {
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_A:
		return "a"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_B:
		return "b"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_C:
		return "c"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_D:
		return "d"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_E:
		return "e"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F:
		return "f"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_G:
		return "g"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_H:
		return "h"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_I:
		return "i"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_J:
		return "j"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_K:
		return "k"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_L:
		return "l"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_M:
		return "m"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_N:
		return "n"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_O:
		return "o"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_P:
		return "p"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_Q:
		return "q"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_R:
		return "r"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_S:
		return "s"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_T:
		return "t"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_U:
		return "u"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_V:
		return "v"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_W:
		return "w"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_X:
		return "x"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_Y:
		return "y"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_Z:
		return "z"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_0:
		return "0"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_1:
		return "1"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_2:
		return "2"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_3:
		return "3"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_4:
		return "4"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_5:
		return "5"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_6:
		return "6"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_7:
		return "7"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_8:
		return "8"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_9:
		return "9"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F1:
		return "f1"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F2:
		return "f2"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F3:
		return "f3"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F4:
		return "f4"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F5:
		return "f5"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F6:
		return "f6"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F7:
		return "f7"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F8:
		return "f8"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F9:
		return "f9"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F10:
		return "f10"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F11:
		return "f11"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_F12:
		return "f12"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_DEL:
		return "backspace"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_FORWARD_DEL:
		return "delete"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_ENTER:
		return "enter"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_TAB:
		return "tab"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_ESCAPE:
		return "escape"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_DPAD_UP:
		return "up"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_DPAD_DOWN:
		return "down"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_DPAD_RIGHT:
		return "right"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_DPAD_LEFT:
		return "left"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_MOVE_HOME:
		return "home"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_MOVE_END:
		return "end"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_PAGE_UP:
		return "pageup"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_PAGE_DOWN:
		return "pagedown"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_META_LEFT:
		switch platform {
		case outer.Platform_PLATFORM_MACOS:
			return "lcmd"
		case outer.Platform_PLATFORM_WINDOWS:
			return "cmd"
		}
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_META_RIGHT:
		switch platform {
		case outer.Platform_PLATFORM_MACOS:
			return "rcmd"
		case outer.Platform_PLATFORM_WINDOWS:
			return "cmd"
		}
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_ALT_LEFT:
		return "lalt"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_ALT_RIGHT:
		return "ralt"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_CTRL_LEFT:
		return "lctrl"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_CTRL_RIGHT:
		return "rctrl"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_SHIFT_LEFT:
		return "lshift"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_SHIFT_RIGHT:
		return "rshift"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_SWITCH_CHARSET:
		return "capslock"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_CAPS_LOCK:
		return "capslock"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_SPACE:
		return "space"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_SYSRQ:
		return "printscreen"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_VOLUME_MUTE:
		return "audio_mute"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_VOLUME_DOWN:
		return "audio_vol_down"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_VOLUME_UP:
		return "audio_vol_up"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_INSERT:
		return "insert"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_0:
		return "num0"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_1:
		return "num1"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_2:
		return "num2"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_3:
		return "num3"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_4:
		return "num4"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_5:
		return "num5"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_6:
		return "num6"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_7:
		return "num7"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_8:
		return "num8"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_9:
		return "num9"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUM_LOCK:
		return "num_lock"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_PERIOD:
		return "num."
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_DOT:
		return "num."
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_ADD:
		return "num+"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_SUBTRACT:
		return "num-"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_MULTIPLY:
		return "num*"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_DIVIDE:
		return "num/"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_CLEAR:
		return "num_clear"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_ENTER:
		return "num_enter"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_NUMPAD_EQUALS:
		return "num_eqaul"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_COMMA:
		return ","
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_SLASH:
		return "/"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_BACKSLASH:
		return "\\"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_PLUS:
		return "+"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_MINUS:
		return "-"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_EQUALS:
		return "="
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_SEMICOLON:
		return ";"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_LEFT_BRACKET:
		return "["
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_RIGHT_BRACKET:
		return "]"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_GRAVE:
		return "`"
	case types.DeviceControlKeycode_DEVICE_CONTROL_KEYCODE_APOSTROPHE:
		return "'"
	}
	return ""
}
