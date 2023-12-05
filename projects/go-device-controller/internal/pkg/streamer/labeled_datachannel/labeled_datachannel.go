package labeled_datachannel

import (
	"go-device-controller/types/protocol/generated/proto/inner/types"

	"go-device-controller/internal/pkg/device"
	log "go-device-controller/internal/pkg/log"
	"go-device-controller/internal/pkg/structs"
	"go-device-controller/internal/pkg/utils"

	"github.com/pion/webrtc/v3"
	"go.uber.org/zap"
	"google.golang.org/protobuf/encoding/protojson"
)

/*
* Caution. Use lock to prevent packet interleaving.
 */
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

func NewLabeledDatachannel(d *webrtc.DataChannel, devices *device.Devices, serial string, deviceServerPort int32) LabeledDatachannel {
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
	ldc.recvQueue.PopLoop(func(data []byte, err error) {
		if err != nil {
			log.Inst.Error("DefaultLabeledDatachannel onMessage error", zap.Error(err))
			return
		}

		err = ldc.devices.OnPeerMessage(ldc.serial, data)
		if err != nil {
			log.Inst.Error("DefaultLabeledDatachannel onMessage error", zap.Error(err))
			return
		}
	})

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
