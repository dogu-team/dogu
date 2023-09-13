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
	seq                uint32
}

var _ich DatachannelHandler = &IosControlHandler{}

func NewIosControlHandler(serial string, getDeviceAgentUrlFunc func() string) *IosControlHandler {
	ach := IosControlHandler{}
	relayer.NewIosDeviceAgentService(&ach.deviceAgentRelayer, serial, getDeviceAgentUrlFunc, func(results *params.DcIdaResultList) {
		for _, r := range results.Results {
			switch a := r.Value.(type) {
			case *params.DcIdaResult_DcGdcDaControlResult:
				log.Inst.Debug("IosControlHandler.onEach", zap.String("serial", serial), zap.String("result", a.DcGdcDaControlResult.String()))
				ach.sendFunc(&params.CfGdcDaResult{
					Value: &params.CfGdcDaResult_CfGdcDaControlResult{
						CfGdcDaControlResult: a.DcGdcDaControlResult,
					},
				}, nil)
			default:
				log.Inst.Error("IosControlHandler.onEach not handleable type", zap.String("serial", serial), zap.String("result", r.String()))
			}
		}
	})
	return &ach
}

func (h *IosControlHandler) OnOpen() error {
	return nil
}

func (h *IosControlHandler) SetSendFunc(sendFunc func(*params.CfGdcDaResult, error)) {
	h.sendFunc = sendFunc
}

func (h *IosControlHandler) OnEachParam(param *params.CfGdcDaParam) bool {
	return false
}

func (h *IosControlHandler) OnParamList(param *params.CfGdcDaParamList) bool {
	paramsToSend := &params.DcIdaParamList{
		Params: []*params.DcIdaParam{},
	}
	for i := 0; i < len(param.Params); i++ {
		switch a := param.Params[i].Value.(type) {
		case *params.CfGdcDaParam_CfGdcDaControlParam:
			h.seq++
			paramsToSend.Params = append(paramsToSend.Params, &params.DcIdaParam{
				Seq: h.seq,
				Value: &params.DcIdaParam_DcGdcDaControlParam{
					DcGdcDaControlParam: a.CfGdcDaControlParam,
				},
			})
		default:
			log.Inst.Error("IosControlHandler.OnParamList not handleable type", zap.String("param", param.Params[i].String()))
		}
	}
	err := h.deviceAgentRelayer.SendMessage(paramsToSend)
	if err != nil {
		log.Inst.Error("IosControlHandler.OnParamList", zap.Error(err))
		return true
	}
	return true
}
