package robot

import (
	"fmt"
	"time"

	"go-device-controller/types/protocol/generated/proto/inner/params"
	"go-device-controller/types/protocol/generated/proto/inner/types"
	"go-device-controller/types/protocol/generated/proto/outer"
	gotypes "go-device-controller/types/types"

	"go-device-controller/internal/pkg/device/datachannel"
	log "go-device-controller/internal/pkg/log"

	"github.com/dogu-team/keybd_event"
	"github.com/go-vgo/robotgo"
	"go.uber.org/zap"
)

const inputCheckTime time.Duration = time.Second * 10

type DevicControlProcess struct {
	control *types.DeviceControl
	result  chan *outer.ErrorResult
}

type DesktopControlHandler struct {
	controlChan       chan *DevicControlProcess
	screenSize        robotgo.Size
	mousePressMap     map[string]bool
	keyBonding        keybd_event.KeyBonding
	mouseInjectOption mouseInjectOption
	platform          outer.Platform

	// input idle check
	lastControlTime time.Time
	ticker          *time.Ticker

	// datachannel handler
	sendFunc func(*params.CfGdcDaResult, error)
}

var _ach datachannel.DatachannelHandler = &DesktopControlHandler{}

func NewDesktopControlHandler(platform outer.Platform) *DesktopControlHandler {
	dch := DesktopControlHandler{}
	dch.controlChan = make(chan *DevicControlProcess, 1000)
	dch.ticker = time.NewTicker(inputCheckTime)
	dch.screenSize.W, dch.screenSize.H = robotgo.GetScreenSize()

	dch.mousePressMap = make(map[string]bool)
	kb, err := keybd_event.NewKeyBonding()
	if err != nil {
		log.Inst.Error("NewDesktopControlHandler NewKeyBonding error", zap.Error(err))
	}
	dch.keyBonding = kb
	dch.mouseInjectOption.isAllowRepeatClick = false
	dch.platform = platform
	go dch.run()
	return &dch
}

func (h *DesktopControlHandler) OnOpen() error {
	clearAllMetaKeys(&h.keyBonding)
	return nil
}

func (h *DesktopControlHandler) SetSendFunc(sendFunc func(*params.CfGdcDaResult, error)) {
	h.sendFunc = sendFunc
}

func (dch *DesktopControlHandler) OnEachParam(param *params.CfGdcDaParam) bool {
	if param.GetCfGdcDaControlParam() == nil {
		return false
	}

	controlProcess := &DevicControlProcess{
		control: param.GetCfGdcDaControlParam().Control,
		result:  make(chan *outer.ErrorResult, 1),
	}
	dch.controlChan <- controlProcess
	errorResult := <-controlProcess.result

	ret := &params.CfGdcDaResult{}
	ret.Seq = param.Seq
	ret.Value = &params.CfGdcDaResult_CfGdcDaControlResult{
		CfGdcDaControlResult: &types.CfGdcDaControlResult{
			Error: errorResult,
		},
	}
	dch.sendFunc(ret, nil)
	dch.lastControlTime = time.Now()
	return true
}

func (dch *DesktopControlHandler) OnParamList(param *params.CfGdcDaParamList) bool {
	return false
}

func (dch *DesktopControlHandler) run() {
	log.Inst.Info("MessageHandler.run")

	for {
		select {
		case <-dch.ticker.C:
			curTime := time.Now()
			if curTime.Sub(dch.lastControlTime) > inputCheckTime {
				clearAllMetaKeys(&dch.keyBonding)
			}

		case c := <-dch.controlChan:
			c.result <- dch.handleControl(c.control, dch.platform)
			close(c.result)
		}
		// todo(yow) close goroutine when signaled
	}
}

func (dch *DesktopControlHandler) handleControl(c *types.DeviceControl, platform outer.Platform) *outer.ErrorResult {
	// log.Inst.Info("MessageHandler.handleControl", zap.String("type", c.Type.String()))
	switch c.Type {
	case types.DeviceControlType_DEVICE_CONTROL_TYPE_DESKTOP_INJECT_KEYCODE:
		return handleControlInjectKeyCode(c, platform, &dch.keyBonding)
	case types.DeviceControlType_DEVICE_CONTROL_TYPE_DESKTOP_INJECT_TEXT:
	case types.DeviceControlType_DEVICE_CONTROL_TYPE_DESKTOP_INJECT_MOUSE_EVENT:
		dch.screenSize.W, dch.screenSize.H = robotgo.GetScreenSize()
		return handleControlInjectMouse(c, &dch.screenSize, dch.mousePressMap, &dch.mouseInjectOption)
	case types.DeviceControlType_DEVICE_CONTROL_TYPE_DESKTOP_INJECT_SCROLL_EVENT:
		dch.screenSize.W, dch.screenSize.H = robotgo.GetScreenSize()
		return handleControlInjectScroll(c, &dch.screenSize)
	case types.DeviceControlType_DEVICE_CONTROL_TYPE_DESKTOP_SET_CLIPBOARD:
		return handleSetClipboard(c, platform, &dch.keyBonding)
	case types.DeviceControlType_DEVICE_CONTROL_TYPE_DESKTOP_ONSCREEN_FOCUSED:
		clearAllMetaKeys(&dch.keyBonding)
		return gotypes.Success
	case types.DeviceControlType_DEVICE_CONTROL_TYPE_DESKTOP_ONSCREEN_UNFOCUSED:
		clearAllMetaKeys(&dch.keyBonding)
		return gotypes.Success
	case types.DeviceControlType_DEVICE_CONTROL_TYPE_DESKTOP_GET_CLIPBOARD:
	}
	log.Inst.Error("MessageHandler.handleControl unknown", zap.Any("type", c.Type))
	return &outer.ErrorResult{
		Code:    outer.Code_CODE_DEVICE_CONTROLLER_INPUT_NOTSUPPORTED,
		Message: fmt.Sprintf("MessageHandler.handleControl unknown %s", c.Type.String()),
	}
}
