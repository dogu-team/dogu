package robot

import (
	"errors"
	"fmt"

	"go-device-controller/types/protocol/generated/proto/inner/types"
	"go-device-controller/types/protocol/generated/proto/outer"
	gotypes "go-device-controller/types/types"

	log "go-device-controller/internal/pkg/log"

	"github.com/go-vgo/robotgo"
	"go.uber.org/zap"
)

type mouseInjectOption struct {
	isAllowRepeatClick bool
}

func newMouseInjectOption() *mouseInjectOption {
	return &mouseInjectOption{
		isAllowRepeatClick: false,
	}
}

// mouse
func handleControlInjectMouse(c *types.DeviceControl, screenSize *robotgo.Size, mousePressMap map[string]bool, option *mouseInjectOption) *outer.ErrorResult {
	if c.Type != types.DeviceControlType_DEVICE_CONTROL_TYPE_DESKTOP_INJECT_MOUSE_EVENT {
		return &outer.ErrorResult{
			Code:    outer.Code_CODE_DEVICE_CONTROLLER_INPUT_NOTSUPPORTED,
			Message: fmt.Sprintf("MessageHandler.handleControlInjectMouse invalid type %s", c.Type.String()),
		}
	}
	robotgo.MouseSleep = 2

	posX, posY, err := calculateMousePosition(c, screenSize)
	if nil != err {
		return &outer.ErrorResult{
			Code: outer.Code_CODE_DEVICE_CONTROLLER_INPUT_UNKNOWN,
			Message: fmt.Sprintf("MessageHandler.handleControlInjectMouse invalid position:%s, x:%f, y:%f",
				err.Error(),
				posX, posY),
		}
	}

	buttonName := calculateMouseButtonName(c)

	var inputError error
	switch c.Action {
	case types.DeviceControlAction_DEVICE_CONTROL_ACTION_DESKTOP_ACTION_DOWN_UNSPECIFIED:
		mousePressMap[buttonName] = true
		robotgo.Move(int(posX), int(posY))
		inputError = robotgo.Toggle(buttonName)
	case types.DeviceControlAction_DEVICE_CONTROL_ACTION_DESKTOP_ACTION_UP:
		mousePressMap[buttonName] = false
		robotgo.Move(int(posX), int(posY))
		inputError = robotgo.Toggle(buttonName, "up")
	case types.DeviceControlAction_DEVICE_CONTROL_ACTION_DESKTOP_ACTION_MOVE:
		if mousePressMap["left"] {
			robotgo.Drag(int(posX), int(posY))
		} else {
			robotgo.Move(int(posX), int(posY))
		}
	case types.DeviceControlAction_DEVICE_CONTROL_ACTION_DESKTOP_ACTION_DOWNUP:
		mousePressMap[buttonName] = false
		isDouble := false
		if 1 < c.Repeat && !option.isAllowRepeatClick {
			break
		}
		if option.isAllowRepeatClick && c.Repeat == 2 {
			isDouble = true
		}

		robotgo.Move(int(posX), int(posY))
		robotgo.Click(buttonName, isDouble)
	}

	log.Inst.Debug("MessageHandler.handleControlInjectMouse", zap.String("button", buttonName), zap.String("action", c.Action.String()))

	if nil != inputError {
		return &outer.ErrorResult{
			Code:    outer.Code_CODE_DEVICE_CONTROLLER_INPUT_UNKNOWN,
			Message: fmt.Sprintf("MessageHandler.handleControlInjectMouse unknown msg:%s", inputError.Error()),
		}
	}

	return gotypes.Success
}

func calculateMouseButtonName(c *types.DeviceControl) string {
	buttonName := "left"
	leftMasked := c.Buttons & int32(types.DeviceControlButton_DEVICE_CONTROL_BUTTON_PRIMARY)
	rightMasked := c.Buttons & int32(types.DeviceControlButton_DEVICE_CONTROL_BUTTON_SECONDARY)
	middleMasked := c.Buttons & int32(types.DeviceControlButton_DEVICE_CONTROL_BUTTON_TERTIARY)
	if 0 < leftMasked {
		buttonName = "left"
	} else if 0 < rightMasked {
		buttonName = "right"
	} else if 0 < middleMasked {
		buttonName = "center"
	}
	return buttonName
}

func handleControlInjectScroll(c *types.DeviceControl, screenSize *robotgo.Size) *outer.ErrorResult {
	if c.Type != types.DeviceControlType_DEVICE_CONTROL_TYPE_DESKTOP_INJECT_SCROLL_EVENT {
		return &outer.ErrorResult{
			Code:    outer.Code_CODE_DEVICE_CONTROLLER_INPUT_NOTSUPPORTED,
			Message: fmt.Sprintf("MessageHandler.handleControlInjectScroll invalid type %s", c.Type.String()),
		}
	}
	robotgo.MouseSleep = 1

	posX, posY, err := calculateMousePosition(c, screenSize)
	if nil != err {
		return &outer.ErrorResult{
			Code: outer.Code_CODE_DEVICE_CONTROLLER_INPUT_UNKNOWN,
			Message: fmt.Sprintf("MessageHandler.handleControlInjectScroll invalid position:%s, x:%f, y:%f",
				err.Error(),
				posX, posY),
		}
	}

	robotgo.Scroll(int(c.HScroll), int(c.VScroll))

	return gotypes.Success
}

func calculateMousePosition(c *types.DeviceControl, screenSize *robotgo.Size) (float64, float64, error) {
	ratioOfX := float64(c.Position.X) / float64(c.Position.ScreenWidth)
	ratioOfY := float64(c.Position.Y) / float64(c.Position.ScreenHeight)

	posX := ratioOfX * float64(screenSize.W)
	posY := ratioOfY * float64(screenSize.H)
	if ratioOfX < 0 || ratioOfY < 0 || ratioOfX > 1 || ratioOfY > 1 {
		log.Inst.Error("calculateMousePosition invalid position",
			zap.Float64("posX", posX),
			zap.Float64("posY", posY))

		return posX, posY, errors.New("invalid position")
	}
	return posX, posY, nil
}
