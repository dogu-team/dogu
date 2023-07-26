package streamer

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net"
	"net/http"
	"net/url"

	"go-device-controller/types/protocol/generated/proto/inner/types"
	"go-device-controller/types/protocol/generated/proto/outer"

	"go-device-controller/internal/pkg/device"
	log "go-device-controller/internal/pkg/log"
	"go-device-controller/internal/pkg/structs"
	"go-device-controller/internal/pkg/utils"

	"github.com/gorilla/websocket"
	"github.com/pion/webrtc/v3"
	"go.uber.org/zap"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
)

// var (
// 	filePath               = ""
// 	fileByteCount          = 0
// 	gfp           *os.File = nil
// )

func send(d *webrtc.DataChannel, bytes []byte) error {
	bufs := utils.SpliteBytes(utils.PrefixBytesWithSize(bytes), 65535)
	for _, buf := range bufs {
		sendErr := d.Send(buf)
		if sendErr != nil {
			return sendErr
		}
	}
	return nil
}

type LabeledDatachannel interface {
	label() *types.DataChannelLabel
}

func newLabeledDatachannel(d *webrtc.DataChannel, devices *device.Devices, serial string, deviceServerPort int32) LabeledDatachannel {
	log.Inst.Info("webRTCMediaPeer.New DataChannel ", zap.String("label", d.Label()), zap.Uint16p("id", d.ID()))

	label := &types.DataChannelLabel{}
	if err := protojson.Unmarshal([]byte(d.Label()), label); err != nil {
		log.Inst.Error("webRTCMediaPeer.datachannel label unmarshal failed", zap.Error(err))
		return nil
	}

	switch label.Protocol.(type) {
	case *types.DataChannelLabel_Default:
		return newDefaultLabeledDatachannel(label, d, devices, serial)
	case *types.DataChannelLabel_RelayTcp:
		return newRelayTcpLabeledDatachannel(label, d)
	case *types.DataChannelLabel_DeviceHttp:
		return newDeviceServerHttpLabeledDatachannel(label, d, deviceServerPort)
	case *types.DataChannelLabel_DeviceWebSocket:
		return newDeviceServerWebSocketLabeledDatachannel(label, d, deviceServerPort)
	default:
		log.Inst.Error("webRTCMediaPeer.datachannel unknown protocol", zap.String("protocol", label.String()))
		return nil
	}
}

type DefaultLabeledDatachannel struct {
	*types.DataChannelLabel
	recvQueue utils.SizePrefixedRecvQueue
}

func (ldc *DefaultLabeledDatachannel) label() *types.DataChannelLabel {
	return ldc.DataChannelLabel
}

func newDefaultLabeledDatachannel(label *types.DataChannelLabel, d *webrtc.DataChannel, devices *device.Devices, serial string) *DefaultLabeledDatachannel {
	ldc := &DefaultLabeledDatachannel{
		DataChannelLabel: label,
	}

	d.OnOpen(func() {
		log.Inst.Info("DefaultLabeledDatachannel OnOpen", zap.String("label", d.Label()), zap.Uint16p("id", d.ID()))
	})

	d.OnClose(func() {
		log.Inst.Info("DefaultLabeledDatachannel OnClose", zap.String("label", d.Label()), zap.Uint16p("id", d.ID()))
	})

	sendBytes := func(bytes []byte) {
		if err := send(d, bytes); err != nil {
			log.Inst.Error("DefaultLabeledDatachannel d.Send error", zap.Error(err))
			return
		}
	}

	d.OnMessage(func(msg webrtc.DataChannelMessage) {
		// befTime := time.Now()

		ldc.recvQueue.PushBytes(msg.Data)
		if !ldc.recvQueue.Has() {
			return
		}
		buf, err := ldc.recvQueue.Pop()
		if err != nil {
			log.Inst.Error("DefaultLabeledDatachannel Receive pop failed", zap.Error(err))
			return
		}

		err = devices.OnPeerMessage(serial, buf)
		if err != nil {
			log.Inst.Error("DefaultLabeledDatachannel onMessage error", zap.Error(err))
			return
		}

		// curTime := time.Now()
		// diffTime := curTime.Sub(befTime).Seconds()
		// log.Printf("webrtc_peer.onMessage recv:%d, send:%d, %f\n", len(msg.Data), len(bytes), diffTime)
	})
	ctx := structs.DatachannelContext{}
	ctx.SendFunc = sendBytes
	devices.OnDataChannel(serial, &ctx)

	return ldc
}

type RelayTcpLabeledDatachannel struct {
	LabeledDatachannel
	*types.DataChannelLabel
	conn net.Conn
}

func (ldc *RelayTcpLabeledDatachannel) label() *types.DataChannelLabel {
	return ldc.DataChannelLabel
}

func newRelayTcpLabeledDatachannel(label *types.DataChannelLabel, d *webrtc.DataChannel) *RelayTcpLabeledDatachannel {
	ldc := &RelayTcpLabeledDatachannel{
		DataChannelLabel: label,
	}

	relayTcp := label.GetRelayTcp()
	if relayTcp == nil {
		log.Inst.Error("RelayTcpLabeledDatachannel relayTcp is nil")
		return nil
	}

	d.OnOpen(func() {
		conn, err := net.Dial("tcp", fmt.Sprintf("127.0.0.1:%d", relayTcp.GetPort()))
		if err != nil {
			log.Inst.Error("RelayTcpLabeledDatachannel connection error", zap.Error(err))
			d.Close()
			return
		}
		ldc.conn = conn

		go func(c net.Conn) {
			recv := make([]byte, 65535)

			for {
				n, err := c.Read(recv)
				if err != nil {
					log.Inst.Error("RelayTcpLabeledDatachannel Read error", zap.Error(err))
					d.Close()
					return
				}

				err = d.Send(recv[:n])
				if err != nil {
					log.Inst.Error("RelayTcpLabeledDatachannel Read error", zap.Error(err))
					d.Close()
					return
				}
			}
		}(conn)
	})

	// Register text message handling
	d.OnMessage(func(msg webrtc.DataChannelMessage) {
		if nil == ldc.conn {
			log.Inst.Error("RelayTcpLabeledDatachannel connection is nil")
			d.Close()
			return
		}
		_, err := ldc.conn.Write(msg.Data)
		if err != nil {
			log.Inst.Error("RelayTcpLabeledDatachannel Send error", zap.Error(err))
			d.Close()
			return
		}
	})
	d.OnError(func(err error) {
		log.Inst.Error("RelayTcpLabeledDatachannel datachannel error", zap.Error(err))
		if nil != ldc.conn {
			ldc.conn.Close()
		}
	})

	d.OnClose(func() {
		if nil != ldc.conn {
			ldc.conn.Close()
		}
	})

	return ldc
}

type DeviceServerHttpLabeledDatachannel struct {
	LabeledDatachannel
	*types.DataChannelLabel
	recvQueue utils.SizePrefixedRecvQueue
}

func (ldc *DeviceServerHttpLabeledDatachannel) label() *types.DataChannelLabel {
	return ldc.DataChannelLabel
}

func newDeviceServerHttpLabeledDatachannel(label *types.DataChannelLabel, d *webrtc.DataChannel, deviceServerPort int32) *DeviceServerHttpLabeledDatachannel {
	ldc := &DeviceServerHttpLabeledDatachannel{
		DataChannelLabel: label,
	}

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
		if err := send(d, buf); err != nil {
			log.Inst.Error("DeviceServerHttpLabeledDatachannel send error", zap.Error(err))
			return err
		}
		return nil
	}

	d.OnMessage(func(msg webrtc.DataChannelMessage) {
		log.Inst.Debug("DeviceServerHttpLabeledDatachannel OnMessage", zap.Int("len", len(msg.Data)))

		ldc.recvQueue.PushBytes(msg.Data)
		if !ldc.recvQueue.Has() {
			return
		}
		buf, err := ldc.recvQueue.Pop()
		if err != nil {
			d.Close()
			return
		}
		httpRequestParam := &outer.HttpRequestParam{}
		if err := proto.Unmarshal(buf, httpRequestParam); err != nil {
			log.Inst.Error("DeviceServerHttpLabeledDatachannel Unmarshal error", zap.Error(err))
			d.Close()
			return
		}
		sequenceId := httpRequestParam.GetSequenceId()
		request := httpRequestParam.GetRequest()
		if request == nil {
			log.Inst.Error("DeviceServerHttpLabeledDatachannel request is nil")
			if err := sendResult(sequenceId, &outer.HttpRequestResult{
				Value: &outer.HttpRequestResult_Error{
					Error: &outer.ErrorResult{
						Code:    outer.Code_CODE_STRING_PARSE_FAILED,
						Message: "request is nil",
					},
				},
			}); err != nil {
				log.Inst.Error("DeviceServerHttpLabeledDatachannel sendResult error", zap.Error(err))
			}
			d.Close()
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

		url := url.URL{Scheme: "http", Host: fmt.Sprintf("localhost:%d", deviceServerPort), Path: request.GetPath(), RawQuery: rawQuery}

		var rawBody *bytes.Buffer = nil
		if body := request.GetBody(); body != nil {
			switch body.Value.(type) {
			case *outer.Body_BytesValue:
				rawBody = bytes.NewBuffer(body.GetBytesValue())
			case *outer.Body_StringValue:
				rawBody = bytes.NewBufferString(body.GetStringValue())
			default:
				log.Inst.Error("DeviceServerHttpLabeledDatachannel body type error")
				if err := sendResult(sequenceId, &outer.HttpRequestResult{
					Value: &outer.HttpRequestResult_Error{
						Error: &outer.ErrorResult{
							Code:    outer.Code_CODE_STRING_PARSE_FAILED,
							Message: "body type error",
						},
					},
				}); err != nil {
					log.Inst.Error("DeviceServerHttpLabeledDatachannel sendResult error", zap.Error(err))
				}
				d.Close()
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
			if err := sendResult(sequenceId, &outer.HttpRequestResult{
				Value: &outer.HttpRequestResult_Error{
					Error: &outer.ErrorResult{
						Code:    outer.Code_CODE_STRING_PARSE_FAILED,
						Message: err.Error(),
					},
				},
			}); err != nil {
				log.Inst.Error("DeviceServerHttpLabeledDatachannel sendResult error", zap.Error(err))
			}
			d.Close()
			return
		}
		if headers := request.GetHeaders(); headers != nil {
			for _, v := range headers.GetValues() {
				req.Header.Add(v.GetKey(), v.GetValue())
			}
		}

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			log.Inst.Error("DeviceServerHttpLabeledDatachannel Do error", zap.Error(err))
			if err := sendResult(sequenceId, &outer.HttpRequestResult{
				Value: &outer.HttpRequestResult_Error{
					Error: &outer.ErrorResult{
						Code:    outer.Code_CODE_STRING_PARSE_FAILED,
						Message: err.Error(),
					},
				},
			}); err != nil {
				log.Inst.Error("DeviceServerHttpLabeledDatachannel sendResult error", zap.Error(err))
			}
			d.Close()
			return
		}
		defer resp.Body.Close()

		bodyBytes, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			log.Inst.Error("DeviceServerHttpLabeledDatachannel ReadAll error", zap.Error(err))
			if err := sendResult(sequenceId, &outer.HttpRequestResult{
				Value: &outer.HttpRequestResult_Error{
					Error: &outer.ErrorResult{
						Code:    outer.Code_CODE_STRING_PARSE_FAILED,
						Message: err.Error(),
					},
				},
			}); err != nil {
				log.Inst.Error("DeviceServerHttpLabeledDatachannel sendResult error", zap.Error(err))
			}
			d.Close()
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

		if err := sendResult(sequenceId, &outer.HttpRequestResult{
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
			d.Close()
		}
	})

	log.Inst.Info("DeviceServerHttpLabeledDatachannel start")
	return ldc
}

type DeviceServerWebSocketLabeledDatachannel struct {
	LabeledDatachannel
	*types.DataChannelLabel
	conn                *websocket.Conn
	isWebSocketClosed   bool
	isDataChannelClosed bool
	recvQueue           utils.SizePrefixedRecvQueue
}

func (ldc *DeviceServerWebSocketLabeledDatachannel) label() *types.DataChannelLabel {
	return ldc.DataChannelLabel
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

	queryMap := url.Values{}
	for k, v := range connection.GetQuery().AsMap() {
		queryMap.Add(k, v.(string))
	}

	url := url.URL{Scheme: "ws", Host: fmt.Sprintf("127.0.0.1:%d", deviceServerPort), Path: connection.GetPath(), RawQuery: queryMap.Encode()}
	c, _, err := websocket.DefaultDialer.Dial(url.String(), nil)
	if err != nil {
		log.Inst.Error("DeviceServerWebSocketLabeledDatachannel connection error", zap.String("name", name), zap.String("path", path), zap.Error(err))
		return nil
	}

	ldc := &DeviceServerWebSocketLabeledDatachannel{
		DataChannelLabel:    label,
		conn:                c,
		isWebSocketClosed:   false,
		isDataChannelClosed: false,
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

	d.OnOpen(func() {
		result := &outer.WebSocketResult{
			Value: &outer.WebSocketResult_OpenEvent{
				OpenEvent: &outer.WebSocketOpenEvent{},
			},
		}
		if err := sendResult(result); err != nil {
			sendErrorAndClose(err)
		}
		log.Inst.Info("DeviceServerWebSocketLabeledDatachannel datachannel open", zap.String("name", name), zap.String("path", path))
	})

	d.OnMessage(func(msg webrtc.DataChannelMessage) {
		ldc.recvQueue.PushBytes(msg.Data)
		if !ldc.recvQueue.Has() {
			return
		}
		buf, err := ldc.recvQueue.Pop()
		if err != nil {
			sendErrorAndClose(err)
			return
		}
		message := &outer.WebSocketMessage{}
		if err := proto.Unmarshal(buf, message); err != nil {
			sendErrorAndClose(err)
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
				sendErrorAndClose(err)
				return
			}
		case *outer.WebSocketMessage_StringValue:
			if err := ldc.conn.WriteMessage(websocket.TextMessage, []byte(message.GetStringValue())); err != nil {
				sendErrorAndClose(err)
				return
			}
		default:
			sendErrorAndClose(fmt.Errorf("invalid message type"))
			return
		}
	})

	d.OnError(func(err error) {
		log.Inst.Error("DeviceServerWebSocketLabeledDatachannel datachannel error", zap.String("name", name), zap.String("path", path), zap.Error(err))
		d.Close()
	})

	d.OnClose(func() {
		ldc.isDataChannelClosed = true
		if !ldc.isWebSocketClosed {
			ldc.conn.Close()
		}
	})

	ldc.conn.SetCloseHandler(func(code int, text string) error {
		ldc.isWebSocketClosed = true
		result := &outer.WebSocketResult{
			Value: &outer.WebSocketResult_CloseEvent{
				CloseEvent: &outer.WebSocketCloseEvent{
					Code:   int32(code),
					Reason: text,
				},
			},
		}
		if err := sendResult(result); err != nil {
			sendErrorAndClose(err)
			return nil
		}

		log.Inst.Info("DeviceServerWebSocketLabeledDatachannel datachannel close", zap.String("name", name), zap.String("path", path))
		if !ldc.isDataChannelClosed {
			d.Close()
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
							ErrorEvent: &outer.WebSocketErrorEvent{},
						},
					}
					if err := sendResult(result); err != nil {
						log.Inst.Error("DeviceServerWebSocketLabeledDatachannel send error", zap.String("name", name), zap.String("path", path), zap.Error(err))
					}
					log.Inst.Error("DeviceServerWebSocketLabeledDatachannel Read error", zap.String("name", name), zap.String("path", path), zap.Error(err))
					d.Close()
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
			if err := sendResult(result); err != nil {
				sendErrorAndClose(err)
				return
			}
		}
	}()

	return ldc
}
