package datachannel

import (
	"go-device-controller/types/protocol/generated/proto/inner/params"

	log "go-device-controller/internal/pkg/log"
	"go-device-controller/internal/pkg/structs"

	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"
)

type DatachannelHandler interface {
	SetSendFunc(func(*params.CfGdcDaResult, error))
	OnEachParam(*params.CfGdcDaParam) bool
	OnParamList(*params.CfGdcDaParamList) bool
}

type DatachannelDemuxer struct {
	handlers            []DatachannelHandler
	ctx                 *structs.DatachannelContext
	callbackOnEachParam bool

	resultChan chan *params.CfGdcDaResult
}

func NewDatachannelDemuxer(demux *DatachannelDemuxer,
	handlers []DatachannelHandler, callbackOnEachParam bool,
) {
	demux.handlers = handlers
	demux.callbackOnEachParam = callbackOnEachParam
	for _, handler := range demux.handlers {
		handler.SetSendFunc(demux.sendResult)
	}
	demux.resultChan = make(chan *params.CfGdcDaResult, 1000)
	go demux.sendLoop()
}

func (demux *DatachannelDemuxer) OnDataChannel(ctx *structs.DatachannelContext) error {
	demux.ctx = ctx
	return nil
}

func (demux *DatachannelDemuxer) OnMessage(data []byte) error {
	var err error

	paramList := &params.CfGdcDaParamList{}
	if err = proto.Unmarshal(data, paramList); err != nil {
		log.Inst.Error("DatachannelDemux.onMessage proto.Unmarshal error", zap.Error(err))
		return err
	}
	paramListCopy := *paramList

	if !demux.callbackOnEachParam {
		for _, handler := range demux.handlers {
			isHandled := handler.OnParamList(&paramListCopy)
			if isHandled {
				break
			}
		}
	} else {
		// loop paramList
		for _, param := range paramListCopy.Params {
			for _, handler := range demux.handlers {
				isHandled := handler.OnEachParam(param)
				if isHandled {
					break
				}
			}
		}
	}

	return nil
}

func (demux *DatachannelDemuxer) sendResult(result *params.CfGdcDaResult, err error) {
	if demux.ctx == nil {
		log.Inst.Error("DatachannelDemuxer.sendResult demux.ctx is nil")
		return
	}
	if result == nil {
		log.Inst.Error("DatachannelDemuxer.sendResult result is nil", zap.Error(err))
		return
	}
	demux.resultChan <- result
}

func (demux *DatachannelDemuxer) sendLoop() {
	log.Inst.Info("DatachannelDemuxer.run")

	resultList := &params.CfGdcDaResultList{}
	resultList.Results = make([]*params.CfGdcDaResult, 0)

	flush := func() {
		if len(resultList.Results) == 0 {
			return
		}
		if demux.ctx == nil {
			log.Inst.Error("DatachannelDemuxer.sendResult demux.ctx is nil")
			return
		}
		out, err := proto.Marshal(resultList)
		if err != nil {
			log.Inst.Error("deviceagentRelayer.onMessage proto.Unmarshal error", zap.Error(err))
		}
		demux.ctx.SendFunc(out)
		resultList.Results = make([]*params.CfGdcDaResult, 0)
	}

	for {
		select {
		case c := <-demux.resultChan:
			resultList.Results = append(resultList.Results, c)
			flush()
		}
		// todo(yow) batching and close x(
	}
}
