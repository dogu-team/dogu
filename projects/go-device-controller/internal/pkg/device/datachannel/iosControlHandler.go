package datachannel

import (
	"go-device-controller/types/protocol/generated/proto/inner/params"

	log "go-device-controller/internal/pkg/log"
	"go-device-controller/internal/pkg/relayer"

	"go.uber.org/zap"
)

type IosControlHandler struct {
	sendFunc           func(*params.CfGdcDaResult, error)
	deviceAgentRelayer relayer.IosDeviceAgentService
}

var _ich DatachannelHandler = &IosControlHandler{}

func NewIosControlHandler(serial string, getDeviceAgentUrlFunc func() string) *IosControlHandler {
	ach := IosControlHandler{}
	relayer.NewIosDeviceAgentService(&ach.deviceAgentRelayer, serial, getDeviceAgentUrlFunc, func(results *params.CfGdcDaResultList) {
		for _, r := range results.Results {
			ach.sendFunc(r, nil)
		}
	})
	return &ach
}

func (h *IosControlHandler) SetSendFunc(sendFunc func(*params.CfGdcDaResult, error)) {
	h.sendFunc = sendFunc
}

func (h *IosControlHandler) OnEachParam(param *params.CfGdcDaParam) bool {
	return false
}

func (h *IosControlHandler) OnParamList(param *params.CfGdcDaParamList) bool {
	err := h.deviceAgentRelayer.SendMessage(param)
	if err != nil {
		log.Inst.Error("IosControlHandler.OnParamList", zap.Error(err))
		return true
	}
	return true
}
