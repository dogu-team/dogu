package labeled_datachannel

import (
	"fmt"
	"net/url"

	"go-device-controller/types/protocol/generated/proto/inner/types"
	"go-device-controller/types/protocol/generated/proto/outer"

	log "go-device-controller/internal/pkg/log"
	"go-device-controller/internal/pkg/utils"

	"github.com/gorilla/websocket"
	"github.com/pion/webrtc/v3"
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"
)

type DeviceServerWebSocketLabeledDatachannel struct {
	*types.DataChannelLabel
	channel             *webrtc.DataChannel
	conn                *websocket.Conn
	isWebSocketClosed   bool
	isDataChannelClosed bool
	deviceServerPort    int32
	recvQueue           utils.SizePrefixedRecvQueue
	sendResult          func(result *outer.WebSocketResult) error
	sendErrorAndClose   func(err error)
}

var _ LabeledDatachannel = &DeviceServerWebSocketLabeledDatachannel{}

func (ldc *DeviceServerWebSocketLabeledDatachannel) label() *types.DataChannelLabel {
	return ldc.DataChannelLabel
}

func (ldc *DeviceServerWebSocketLabeledDatachannel) onOpen() {
	connection := ldc.label().GetDeviceWebSocket().GetConnection()
	if connection == nil {
		log.Inst.Error("DeviceServerWebSocketLabeledDatachannel connection is nil", zap.String("name", ldc.label().Name))
		return
	}
	name := ldc.label().Name
	path := connection.GetPath()
	log.Inst.Info("DeviceServerWebSocketLabeledDatachannel datachannel open", zap.String("name", name), zap.String("path", path))

	queryMap := url.Values{}
	for k, v := range connection.GetQuery().AsMap() {
		queryMap.Add(k, v.(string))
	}

	var err error
	url := url.URL{Scheme: "ws", Host: fmt.Sprintf("127.0.0.1:%d", ldc.deviceServerPort), Path: connection.GetPath(), RawQuery: queryMap.Encode()}
	ldc.conn, _, err = websocket.DefaultDialer.Dial(url.String(), nil)
	if err != nil {
		log.Inst.Error("DeviceServerWebSocketLabeledDatachannel connection error", zap.String("name", name), zap.String("path", path), zap.Error(err))
		return
	}

	result := &outer.WebSocketResult{
		Value: &outer.WebSocketResult_OpenEvent{
			OpenEvent: &outer.WebSocketOpenEvent{},
		},
	}

	log.Inst.Info("DeviceServerWebSocketLabeledDatachannel send open event", zap.String("name", name), zap.String("path", path))
	if err := ldc.sendResult(result); err != nil {
		ldc.sendErrorAndClose(err)
	}

	ldc.conn.SetCloseHandler(func(code int, text string) error {
		log.Inst.Info("DeviceServerWebSocketLabeledDatachannel ws close", zap.String("name", name), zap.String("path", path), zap.Int("code", code), zap.String("text", text))
		ldc.isWebSocketClosed = true
		result := &outer.WebSocketResult{
			Value: &outer.WebSocketResult_CloseEvent{
				CloseEvent: &outer.WebSocketCloseEvent{
					Code:   int32(code),
					Reason: text,
				},
			},
		}
		if err := ldc.sendResult(result); err != nil {
			ldc.sendErrorAndClose(err)
			return nil
		}

		if !ldc.isDataChannelClosed {
			ldc.channel.Close()
		}
		return nil
	})

	go func() {
		for {
			_, message, err := ldc.conn.ReadMessage()
			if err != nil {
				switch err.(type) {
				case *websocket.CloseError:
					return
				default:
					result := &outer.WebSocketResult{
						Value: &outer.WebSocketResult_ErrorEvent{
							ErrorEvent: &outer.WebSocketErrorEvent{
								Reason: err.Error(),
							},
						},
					}
					if err := ldc.sendResult(result); err != nil {
						log.Inst.Error("DeviceServerWebSocketLabeledDatachannel send error", zap.String("name", name), zap.String("path", path), zap.Error(err))
					}
					log.Inst.Error("DeviceServerWebSocketLabeledDatachannel Read error", zap.String("name", name), zap.String("path", path), zap.Error(err))
					ldc.channel.Close()
					return
				}
			}

			result := &outer.WebSocketResult{
				Value: &outer.WebSocketResult_MessageEvent{
					MessageEvent: &outer.WebSocketMessageEvent{
						Value: &outer.WebSocketMessageEvent_BytesValue{
							BytesValue: message,
						},
					},
				},
			}
			if err := ldc.sendResult(result); err != nil {
				ldc.sendErrorAndClose(err)
				return
			}
		}
	}()
}

func (ldc *DeviceServerWebSocketLabeledDatachannel) onError(err error) {
	connection := ldc.label().GetDeviceWebSocket().GetConnection()
	if connection == nil {
		log.Inst.Error("DeviceServerWebSocketLabeledDatachannel connection is nil", zap.String("name", ldc.label().Name))
		return
	}
	name := ldc.label().Name
	path := connection.GetPath()
	log.Inst.Error("DeviceServerWebSocketLabeledDatachannel datachannel error", zap.String("name", name), zap.String("path", path), zap.Error(err))
	ldc.channel.Close()
}

func (ldc *DeviceServerWebSocketLabeledDatachannel) onClose() {
	connection := ldc.label().GetDeviceWebSocket().GetConnection()
	if connection == nil {
		log.Inst.Error("DeviceServerWebSocketLabeledDatachannel connection is nil", zap.String("name", ldc.label().Name))
		return
	}
	name := ldc.label().Name
	path := connection.GetPath()
	log.Inst.Info("DeviceServerWebSocketLabeledDatachannel datachannel close", zap.String("name", name), zap.String("path", path))

	ldc.isDataChannelClosed = true
	if !ldc.isWebSocketClosed && nil != ldc.conn {
		ldc.conn.Close()
	}
}

func (ldc *DeviceServerWebSocketLabeledDatachannel) onMessage(msg webrtc.DataChannelMessage) {
	connection := ldc.label().GetDeviceWebSocket().GetConnection()
	if connection == nil {
		log.Inst.Error("DeviceServerWebSocketLabeledDatachannel connection is nil", zap.String("name", ldc.label().Name))
		return
	}
	// name := ldc.label().Name
	// path := connection.GetPath()
	// log.Inst.Debug("DeviceServerWebSocketLabeledDatachannel datachannel omMessage", zap.String("name", name), zap.String("path", path))

	if nil == ldc.conn {
		log.Inst.Error("DeviceServerWebSocketLabeledDatachannel connection is nil")
		ldc.channel.Close()
		return
	}
	ldc.recvQueue.PushBytes(msg.Data)
	ldc.recvQueue.PopLoop(func(buf []byte, err error) {
		if err != nil {
			ldc.sendErrorAndClose(err)
			return
		}
		message := &outer.WebSocketMessage{}
		if err := proto.Unmarshal(buf, message); err != nil {
			ldc.sendErrorAndClose(err)
			return
		}

		////////////////////////////////
		// var received []byte = nil
		// switch message.Value.(type) {
		// case *outer.WebSocketMessage_BytesValue:
		// 	received = message.GetBytesValue()
		// case *outer.WebSocketMessage_StringValue:
		// 	received = []byte(message.GetStringValue())
		// }
		// if received == nil {
		// 	log.Inst.Error("@@@ DeviceServerWebSocketLabeledDatachannel received is nil")
		// }
		// parsed := &outer.DeviceHostUploadFileSendMessage{}
		// if err := proto.Unmarshal(received, parsed); err != nil {
		// 	log.Inst.Error("@@@ DeviceServerWebSocketLabeledDatachannel Unmarshal error", zap.Error(err))
		// }
		// start := parsed.GetStart()
		// inProgress := parsed.GetInProgress()
		// complete := parsed.GetComplete()
		// if start != nil {
		// 	filePath = start.GetFileName()
		// 	fileByteCount = 0
		// 	fp, err := os.OpenFile(filePath, os.O_CREATE|os.O_WRONLY, 0o644)
		// 	if err != nil {
		// 		log.Inst.Error("@@@ DeviceServerWebSocketLabeledDatachannel OpenFile error", zap.Error(err))
		// 	}
		// 	gfp = fp
		// } else if inProgress != nil {
		// 	fileByteCount = fileByteCount + len(inProgress.GetChunk())
		// 	_, err := gfp.Write(inProgress.GetChunk())
		// 	if err != nil {
		// 		log.Inst.Error("@@@ DeviceServerWebSocketLabeledDatachannel Write error", zap.Error(err))
		// 	}
		// } else if complete != nil {
		// 	gfp.Close()
		// 	log.Inst.Info("file upload complete", zap.String("filePath", filePath), zap.Int("fileByteCount", fileByteCount))
		// }
		////////////////////////////////

		switch message.Value.(type) {
		case *outer.WebSocketMessage_BytesValue:
			buf := message.GetBytesValue()
			if err := ldc.conn.WriteMessage(websocket.BinaryMessage, buf); err != nil {
				ldc.sendErrorAndClose(err)
				return
			}
		case *outer.WebSocketMessage_StringValue:
			if err := ldc.conn.WriteMessage(websocket.TextMessage, []byte(message.GetStringValue())); err != nil {
				ldc.sendErrorAndClose(err)
				return
			}
		default:
			ldc.sendErrorAndClose(fmt.Errorf("invalid message type"))
			return
		}
	})
}

var index = 0

func newDeviceServerWebSocketLabeledDatachannel(label *types.DataChannelLabel, d *webrtc.DataChannel, deviceServerPort int32) *DeviceServerWebSocketLabeledDatachannel {
	connection := label.GetDeviceWebSocket().GetConnection()
	name := label.Name
	path := connection.GetPath()
	if connection == nil {
		log.Inst.Error("DeviceServerWebSocketLabeledDatachannel connection is nil", zap.String("name", name), zap.String("path", path))
		return nil
	}
	sendResult := func(result *outer.WebSocketResult) error {
		httpWebSocketResult := &outer.HttpRequestWebSocketResult{
			SequenceId: 0,
			Value: &outer.HttpRequestWebSocketResult_WebSocketResult{
				WebSocketResult: result,
			},
		}
		buf, err := proto.Marshal(httpWebSocketResult)
		if err != nil {
			log.Inst.Error("DeviceServerWebSocketLabeledDatachannel Marshal error", zap.String("name", name), zap.String("path", path), zap.Error(err))
			return err
		}
		if err := send(d, buf); err != nil {
			log.Inst.Error("DeviceServerWebSocketLabeledDatachannel send error", zap.String("name", name), zap.String("path", path), zap.Error(err))
			return err
		}
		return nil
	}

	sendErrorAndClose := func(err error) {
		log.Inst.Error("DeviceServerWebSocketLabeledDatachannel send error", zap.String("name", name), zap.String("path", path), zap.Error(err))
		result := &outer.WebSocketResult{
			Value: &outer.WebSocketResult_Error{
				Error: &outer.ErrorResult{
					Code:    outer.Code_CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED,
					Message: err.Error(),
				},
			},
		}
		if err := sendResult(result); err != nil {
			log.Inst.Error("DeviceServerWebSocketLabeledDatachannel send error", zap.String("name", name), zap.String("path", path), zap.Error(err))
		}
	}
	ldc := &DeviceServerWebSocketLabeledDatachannel{
		DataChannelLabel:    label,
		channel:             d,
		deviceServerPort:    deviceServerPort,
		isWebSocketClosed:   false,
		isDataChannelClosed: false,
		sendResult:          sendResult,
		sendErrorAndClose:   sendErrorAndClose,
	}

	return ldc
}
