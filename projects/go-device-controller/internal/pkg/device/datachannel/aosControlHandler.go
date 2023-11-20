package datachannel

import (
	"go-device-controller/types/protocol/generated/proto/inner/params"

	log "go-device-controller/internal/pkg/log"
	"go-device-controller/internal/pkg/relayer"

	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"
)

type AosControlHandler struct {
	sendFunc           func(*params.CfGdcDaResult, error)
	deviceAgentRelayer relayer.WebsocketRelayer
}

var _ach DatachannelHandler = &AosControlHandler{}

func NewAosControlHandler(serial string, getDeviceAgentUrlFunc func() string) *AosControlHandler {
	h := AosControlHandler{}
	relayer.NewWebsocketRelayer(&h.deviceAgentRelayer, serial, getDeviceAgentUrlFunc, func(bytes []byte) {
		result := &params.CfGdcDaResult{}
		if err := proto.Unmarshal(bytes, result); err != nil {
			log.Inst.Error("AosControlHandler.onEach proto.Unmarshal error", zap.Error(err))
			return
		}
		h.sendFunc(result, nil)
	})

	return &h
}

func (h *AosControlHandler) OnOpen() error {
	h.deviceAgentRelayer.Close() // force reconnect
	return nil
}

func (h *AosControlHandler) Reconnect() error {
	h.deviceAgentRelayer.Close() // force reconnect
	return nil
}

func (h *AosControlHandler) SetSendFunc(sendFunc func(*params.CfGdcDaResult, error)) {
	h.sendFunc = sendFunc
}

func (h *AosControlHandler) OnEachParam(param *params.CfGdcDaParam) bool {
	if param.GetCfGdcDaControlParam() == nil {
		return false
	}
	out, err := proto.Marshal(param)
	if err != nil {
		log.Inst.Error("AosControlHandler.onEach", zap.Error(err))
		return true
	}
	err = h.deviceAgentRelayer.SendMessage(out)
	if err != nil {
		log.Inst.Error("AosControlHandler.onEach", zap.Error(err))
		return true
	}

	return true
}

func (h *AosControlHandler) OnParamList(param *params.CfGdcDaParamList) bool {
	return false
}
