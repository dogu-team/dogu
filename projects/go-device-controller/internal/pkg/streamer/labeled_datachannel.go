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
	onOpen()
	onError(err error)
	onClose()
	onMessage(msg webrtc.DataChannelMessage)
}

func newLabeledDatachannel(d *webrtc.DataChannel, devices *device.Devices, serial string, deviceServerPort int32) LabeledDatachannel {
	log.Inst.Info("webRTCMediaPeer.New DataChannel ", zap.String("label", d.Label()), zap.Uint16p("id", d.ID()))

	label := &types.DataChannelLabel{}
	if err := protojson.Unmarshal([]byte(d.Label()), label); err != nil {
		log.Inst.Error("webRTCMediaPeer.datachannel label unmarshal failed", zap.Error(err))
		return nil
	}

	var ldc LabeledDatachannel = nil

	switch label.Protocol.(type) {
	case *types.DataChannelLabel_Default:
		ldc = newDefaultLabeledDatachannel(label, d, devices, serial)
	case *types.DataChannelLabel_RelayTcp:
		ldc = newRelayTcpLabeledDatachannel(label, d)
	case *types.DataChannelLabel_DeviceHttp:
		ldc = newDeviceServerHttpLabeledDatachannel(label, d, deviceServerPort)
	case *types.DataChannelLabel_DeviceWebSocket:
		ldc = newDeviceServerWebSocketLabeledDatachannel(label, d, deviceServerPort)
	default:
		log.Inst.Error("webRTCMediaPeer.datachannel unknown protocol", zap.String("protocol", label.String()))
		ldc = nil
	}
	if nil == ldc {
		return nil
	}

	d.OnOpen(func() {
		ldc.onOpen()
	})
	d.OnError(func(err error) {
		ldc.onError(err)
	})
	d.OnClose(func() {
		ldc.onClose()
	})
	d.OnMessage(func(msg webrtc.DataChannelMessage) {
		ldc.onMessage(msg)
	})

	return ldc
}

type DefaultLabeledDatachannel struct {
	*types.DataChannelLabel
	devices   *device.Devices
	serial    string
	channel   *webrtc.DataChannel
	recvQueue utils.SizePrefixedRecvQueue
}

var _ LabeledDatachannel = &DefaultLabeledDatachannel{}

func (ldc *DefaultLabeledDatachannel) label() *types.DataChannelLabel {
	return ldc.DataChannelLabel
}

func (ldc *DefaultLabeledDatachannel) onOpen() {
	log.Inst.Info("DefaultLabeledDatachannel OnOpen", zap.String("label", ldc.label().Name), zap.Uint16p("id", ldc.channel.ID()))
}

func (ldc *DefaultLabeledDatachannel) onError(err error) {
	log.Inst.Error("DefaultLabeledDatachannel OnError", zap.String("label", ldc.label().Name), zap.Uint16p("id", ldc.channel.ID()), zap.Error(err))
}

func (ldc *DefaultLabeledDatachannel) onClose() {
	log.Inst.Info("DefaultLabeledDatachannel OnClose", zap.String("label", ldc.label().Name), zap.Uint16p("id", ldc.channel.ID()))
}

func (ldc *DefaultLabeledDatachannel) onMessage(msg webrtc.DataChannelMessage) {
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

	err = ldc.devices.OnPeerMessage(ldc.serial, buf)
	if err != nil {
		log.Inst.Error("DefaultLabeledDatachannel onMessage error", zap.Error(err))
		return
	}

	// curTime := time.Now()
	// diffTime := curTime.Sub(befTime).Seconds()
	// log.Printf("webrtc_peer.onMessage recv:%d, send:%d, %f\n", len(msg.Data), len(bytes), diffTime)
}

func newDefaultLabeledDatachannel(label *types.DataChannelLabel, d *webrtc.DataChannel, devices *device.Devices, serial string) *DefaultLabeledDatachannel {
	ldc := &DefaultLabeledDatachannel{
		DataChannelLabel: label,
		channel:          d,
		devices:          devices,
		serial:           serial,
	}

	sendBytes := func(bytes []byte) {
		if err := send(d, bytes); err != nil {
			log.Inst.Error("DefaultLabeledDatachannel d.Send error", zap.Error(err))
			return
		}
	}

	ctx := structs.DatachannelContext{}
	ctx.SendFunc = sendBytes
	devices.OnDataChannel(serial, &ctx)

	return ldc
}

type RelayTcpLabeledDatachannel struct {
	*types.DataChannelLabel
	channel *webrtc.DataChannel
	conn    net.Conn
}

var _ LabeledDatachannel = &RelayTcpLabeledDatachannel{}

func (ldc *RelayTcpLabeledDatachannel) label() *types.DataChannelLabel {
	return ldc.DataChannelLabel
}

func (ldc *RelayTcpLabeledDatachannel) onOpen() {
	log.Inst.Info("RelayTcpLabeledDatachannel OnOpen", zap.String("label", ldc.label().Name), zap.Uint16p("id", ldc.channel.ID()))
	relayTcp := ldc.DataChannelLabel.GetRelayTcp()
	if relayTcp == nil {
		log.Inst.Error("RelayTcpLabeledDatachannel relayTcp is nil")
		return
	}
	conn, err := net.Dial("tcp", fmt.Sprintf("127.0.0.1:%d", relayTcp.GetPort()))
	if err != nil {
		log.Inst.Error("RelayTcpLabeledDatachannel connection error", zap.Error(err))
		ldc.channel.Close()
		return
	}
	ldc.conn = conn

	go func(c net.Conn) {
		recv := make([]byte, 65535)

		for {
			n, err := c.Read(recv)
			if err != nil {
				log.Inst.Error("RelayTcpLabeledDatachannel Read error", zap.Error(err))
				ldc.channel.Close()
				return
			}

			err = ldc.channel.Send(recv[:n])
			if err != nil {
				log.Inst.Error("RelayTcpLabeledDatachannel Read error", zap.Error(err))
				ldc.channel.Close()
				return
			}
		}
	}(conn)
}

func (ldc *RelayTcpLabeledDatachannel) onError(err error) {
	log.Inst.Error("RelayTcpLabeledDatachannel datachannel error", zap.Error(err))
	if nil != ldc.conn {
		ldc.conn.Close()
	}
}

func (ldc *RelayTcpLabeledDatachannel) onClose() {
	log.Inst.Info("RelayTcpLabeledDatachannel OnClose", zap.String("label", ldc.label().Name), zap.Uint16p("id", ldc.channel.ID()))
	if nil != ldc.conn {
		ldc.conn.Close()
	}
}

func (ldc *RelayTcpLabeledDatachannel) onMessage(msg webrtc.DataChannelMessage) {
	if nil == ldc.conn {
		log.Inst.Error("RelayTcpLabeledDatachannel connection is nil")
		ldc.channel.Close()
		return
	}
	_, err := ldc.conn.Write(msg.Data)
	if err != nil {
		log.Inst.Error("RelayTcpLabeledDatachannel Send error", zap.Error(err))
		ldc.channel.Close()
		return
	}
}

func newRelayTcpLabeledDatachannel(label *types.DataChannelLabel, d *webrtc.DataChannel) *RelayTcpLabeledDatachannel {
	ldc := &RelayTcpLabeledDatachannel{
		DataChannelLabel: label,
		channel:          d,
	}

	return ldc
}

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
	if !ldc.recvQueue.Has() {
		return
	}
	buf, err := ldc.recvQueue.Pop()
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
}

func newDeviceServerHttpLabeledDatachannel(label *types.DataChannelLabel, d *webrtc.DataChannel, deviceServerPort int32) *DeviceServerHttpLabeledDatachannel {
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
	ldc := &DeviceServerHttpLabeledDatachannel{
		DataChannelLabel: label,
		channel:          d,
		deviceServerPort: deviceServerPort,
		sendResult:       sendResult,
	}

	log.Inst.Info("DeviceServerHttpLabeledDatachannel start")
	return ldc
}

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
	name := ldc.label().Name
	path := connection.GetPath()
	log.Inst.Info("DeviceServerWebSocketLabeledDatachannel datachannel omMessage", zap.String("name", name), zap.String("path", path))

	if nil == ldc.conn {
		log.Inst.Error("DeviceServerWebSocketLabeledDatachannel connection is nil")
		ldc.channel.Close()
		return
	}
	ldc.recvQueue.PushBytes(msg.Data)
	if !ldc.recvQueue.Has() {
		return
	}
	buf, err := ldc.recvQueue.Pop()
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
