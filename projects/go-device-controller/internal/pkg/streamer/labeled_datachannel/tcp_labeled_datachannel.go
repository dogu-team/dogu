package labeled_datachannel

import (
	"fmt"
	"net"

	"go-device-controller/types/protocol/generated/proto/inner/types"

	log "go-device-controller/internal/pkg/log"

	"github.com/pion/webrtc/v3"
	"go.uber.org/zap"
)

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
