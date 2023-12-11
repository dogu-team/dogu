package labeled_datachannel

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"sync"

	"go-device-controller/types/protocol/generated/proto/inner/types"
	"go-device-controller/types/protocol/generated/proto/outer"

	log "go-device-controller/internal/pkg/log"
	"go-device-controller/internal/pkg/utils"

	"github.com/pion/webrtc/v3"
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"
)

type DeviceServerHttpLabeledDatachannel struct {
	*types.DataChannelLabel
	channel          *webrtc.DataChannel
	recvQueue        utils.SizePrefixedRecvQueue
	deviceServerPort int32
	sendResult       func(sequenceId int32, result *outer.HttpRequestResult) error
}

var _ LabeledDatachannel = &DeviceServerHttpLabeledDatachannel{}

func (ldc *DeviceServerHttpLabeledDatachannel) label() *types.DataChannelLabel {
	return ldc.DataChannelLabel
}

func (ldc *DeviceServerHttpLabeledDatachannel) onOpen() {
	log.Inst.Info("DeviceServerHttpLabeledDatachannel OnOpen", zap.String("label", ldc.label().Name), zap.Uint16p("id", ldc.channel.ID()))
}

func (ldc *DeviceServerHttpLabeledDatachannel) onError(err error) {
	log.Inst.Error("DeviceServerHttpLabeledDatachannel OnError", zap.String("label", ldc.label().Name), zap.Uint16p("id", ldc.channel.ID()), zap.Error(err))
}

func (ldc *DeviceServerHttpLabeledDatachannel) onClose() {
	log.Inst.Info("DeviceServerHttpLabeledDatachannel OnClose", zap.String("label", ldc.label().Name), zap.Uint16p("id", ldc.channel.ID()))
}

func (ldc *DeviceServerHttpLabeledDatachannel) onMessage(msg webrtc.DataChannelMessage) {
	log.Inst.Debug("DeviceServerHttpLabeledDatachannel OnMessage", zap.Int("len", len(msg.Data)))

	ldc.recvQueue.PushBytes(msg.Data)
	ldc.recvQueue.PopLoop(func(buf []byte, err error) {
		if err != nil {
			ldc.channel.Close()
			return
		}
		httpRequestParam := &outer.HttpRequestParam{}
		if err := proto.Unmarshal(buf, httpRequestParam); err != nil {
			log.Inst.Error("DeviceServerHttpLabeledDatachannel Unmarshal error", zap.Error(err))
			ldc.channel.Close()
			return
		}
		sequenceId := httpRequestParam.GetSequenceId()
		request := httpRequestParam.GetRequest()
		if request == nil {
			log.Inst.Error("DeviceServerHttpLabeledDatachannel request is nil")
			if err := ldc.sendResult(sequenceId, &outer.HttpRequestResult{
				Value: &outer.HttpRequestResult_Error{
					Error: &outer.ErrorResult{
						Code:    outer.Code_CODE_STRING_PARSE_FAILED,
						Message: "request is nil",
					},
				},
			}); err != nil {
				log.Inst.Error("DeviceServerHttpLabeledDatachannel sendResult error", zap.Error(err))
			}
			ldc.channel.Close()
			return
		}

		rawQuery := ""
		if query := request.GetQuery(); query != nil {
			queryMap := url.Values{}
			for k, v := range query.AsMap() {
				queryMap.Add(k, fmt.Sprintf("%v", v))
			}
			rawQuery = queryMap.Encode()
		}

		url := url.URL{Scheme: "http", Host: fmt.Sprintf("127.0.0.1:%d", ldc.deviceServerPort), Path: request.GetPath(), RawQuery: rawQuery}

		var rawBody *bytes.Buffer = nil
		if body := request.GetBody(); body != nil {
			switch body.Value.(type) {
			case *outer.Body_BytesValue:
				rawBody = bytes.NewBuffer(body.GetBytesValue())
			case *outer.Body_StringValue:
				rawBody = bytes.NewBufferString(body.GetStringValue())
			default:
				log.Inst.Error("DeviceServerHttpLabeledDatachannel body type error")
				if err := ldc.sendResult(sequenceId, &outer.HttpRequestResult{
					Value: &outer.HttpRequestResult_Error{
						Error: &outer.ErrorResult{
							Code:    outer.Code_CODE_STRING_PARSE_FAILED,
							Message: "body type error",
						},
					},
				}); err != nil {
					log.Inst.Error("DeviceServerHttpLabeledDatachannel sendResult error", zap.Error(err))
				}
				ldc.channel.Close()
				return
			}
		}
		var req *http.Request = nil
		if rawBody == nil {
			req, err = http.NewRequest(request.GetMethod(), url.String(), nil)
		} else {
			req, err = http.NewRequest(request.GetMethod(), url.String(), rawBody)
		}
		if err != nil {
			log.Inst.Error("DeviceServerHttpLabeledDatachannel NewRequest error", zap.Error(err))
			if err := ldc.sendResult(sequenceId, &outer.HttpRequestResult{
				Value: &outer.HttpRequestResult_Error{
					Error: &outer.ErrorResult{
						Code:    outer.Code_CODE_STRING_PARSE_FAILED,
						Message: err.Error(),
					},
				},
			}); err != nil {
				log.Inst.Error("DeviceServerHttpLabeledDatachannel sendResult error", zap.Error(err))
			}
			ldc.channel.Close()
			return
		}

		if headers := request.GetHeaders(); headers != nil {
			for _, v := range headers.GetValues() {
				req.Header.Add(v.GetKey(), v.GetValue())
			}
		}

		log.Inst.Debug("DeviceServerHttpLabeledDatachannel OnMessage", zap.String("url", url.String()), zap.String("method", request.GetMethod()), zap.String("rawQuery", rawQuery), zap.Int("bodyLen", len(rawBody.String())))
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			log.Inst.Error("DeviceServerHttpLabeledDatachannel Do error", zap.Error(err))
			if err := ldc.sendResult(sequenceId, &outer.HttpRequestResult{
				Value: &outer.HttpRequestResult_Error{
					Error: &outer.ErrorResult{
						Code:    outer.Code_CODE_STRING_PARSE_FAILED,
						Message: err.Error(),
					},
				},
			}); err != nil {
				log.Inst.Error("DeviceServerHttpLabeledDatachannel sendResult error", zap.Error(err))
			}
			ldc.channel.Close()
			return
		}
		defer resp.Body.Close()

		bodyBytes, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			log.Inst.Error("DeviceServerHttpLabeledDatachannel ReadAll error", zap.Error(err))
			if err := ldc.sendResult(sequenceId, &outer.HttpRequestResult{
				Value: &outer.HttpRequestResult_Error{
					Error: &outer.ErrorResult{
						Code:    outer.Code_CODE_STRING_PARSE_FAILED,
						Message: err.Error(),
					},
				},
			}); err != nil {
				log.Inst.Error("DeviceServerHttpLabeledDatachannel sendResult error", zap.Error(err))
			}
			ldc.channel.Close()
			return
		}

		headers := &outer.Headers{}
		for k, v := range resp.Header {
			for _, vv := range v {
				headers.Values = append(headers.Values, &outer.HeaderValue{
					Key:   k,
					Value: vv,
				})
			}
		}

		if err := ldc.sendResult(sequenceId, &outer.HttpRequestResult{
			Value: &outer.HttpRequestResult_Response{
				Response: &outer.HttpResponse{
					StatusCode: int32(resp.StatusCode),
					Headers:    headers,
					Body: &outer.Body{
						Value: &outer.Body_BytesValue{
							BytesValue: bodyBytes,
						},
					},
				},
			},
		}); err != nil {
			log.Inst.Error("DeviceServerHttpLabeledDatachannel sendResult error", zap.Error(err))
			ldc.channel.Close()
		}
	})
}

func newDeviceServerHttpLabeledDatachannel(label *types.DataChannelLabel, d *webrtc.DataChannel, deviceServerPort int32) *DeviceServerHttpLabeledDatachannel {
	sendMutex := sync.Mutex{}
	sendResult := func(sequenceId int32, result *outer.HttpRequestResult) error {
		httpWebSocketResult := &outer.HttpRequestWebSocketResult{
			SequenceId: sequenceId,
			Value: &outer.HttpRequestWebSocketResult_HttpRequestResult{
				HttpRequestResult: result,
			},
		}
		buf, err := proto.Marshal(httpWebSocketResult)
		if err != nil {
			log.Inst.Error("DeviceServerHttpLabeledDatachannel Marshal error", zap.Error(err))
			return err
		}
		sendMutex.Lock()
		defer sendMutex.Unlock()
		if err := send(d, buf); err != nil {
			log.Inst.Error("DeviceServerHttpLabeledDatachannel send error", zap.Error(err))
			return err
		}
		return nil
	}
	ldc := &DeviceServerHttpLabeledDatachannel{
		DataChannelLabel: label,
		channel:          d,
		deviceServerPort: deviceServerPort,
		sendResult:       sendResult,
	}

	log.Inst.Info("DeviceServerHttpLabeledDatachannel start")
	return ldc
}
