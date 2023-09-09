package surface

import (
	"bufio"
	"encoding/binary"
	"fmt"
	"net"
	"os"

	"go-device-controller/types/protocol/generated/proto/outer/streaming"

	log "go-device-controller/internal/pkg/log"
	"go-device-controller/internal/pkg/utils"

	"github.com/pkg/errors"
	"go.uber.org/zap"
)

type iosSurface struct {
	conn      *net.TCPConn
	agentUrl  *string
	reader    *bufio.Reader
	recvQueue utils.SizePrefixedRecvQueue
}

var _is surface = &iosSurface{}

func newiosSurface(agentUrl *string) *iosSurface {
	log.Inst.Debug("iosSurface.newiOSSurface")
	s := iosSurface{}
	s.agentUrl = agentUrl
	return &s
}

func (s *iosSurface) Connect(serial string, screenCaptureOption *streaming.ScreenCaptureOption) error {
	var err error
	log.Inst.Debug("iosSurface.Connect", zap.String("serial", serial), zap.String("addr", *s.agentUrl))
	conn, err := net.Dial("tcp", *s.agentUrl)
	if err != nil {
		log.Inst.Error("iosSurface.Connect", zap.String("serial", serial), zap.String("addr", *s.agentUrl), zap.Error(err))
		return err
	}

	tcpConn, ok := conn.(*net.TCPConn)
	if !ok {
		fmt.Println("Failed to convert net.Conn to net.TCPConn")
		os.Exit(1)
	}

	// make json
	json := fmt.Sprintf("{\"type\":\"screen\", \"maxFps\":%d, \"maxResolution\":%d}", *screenCaptureOption.MaxFps, *screenCaptureOption.MaxResolution)
	log.Inst.Debug("iosSurface.Connect option", zap.String("serial", serial), zap.String("addr", *s.agentUrl), zap.String("json", json))
	// send bytes with little endian size prefixed
	bytes := make([]byte, 4+len(json))
	binary.LittleEndian.PutUint32(bytes, uint32(len(json)))
	copy(bytes[4:], json)
	_, err = tcpConn.Write(bytes)
	if err != nil {
		log.Inst.Error("iosSurface.Connect write failed", zap.Error(err))
		return err
	}

	s.conn = tcpConn
	s.reader = bufio.NewReader(s.conn)
	s.recvQueue.Clear()
	return nil
}

func (s *iosSurface) Receive() ([]byte, error) {
	if nil == s.conn || nil == s.reader {
		log.Inst.Error("iosSurface.Receive null exists", zap.Bool("conn", nil == s.conn), zap.Bool("reader", nil == s.reader))
		return nil, errors.Errorf("iosSurface.Receive reader is null")
	}
	buf, err := s.receive()
	if err != nil {
		s.conn = nil
		s.reader = nil
	}
	return buf, err
}

func (s *iosSurface) receive() ([]byte, error) {
	for {
		err := s.recvQueue.Push(s.reader)
		if err != nil {
			log.Inst.Error("iosSurface.Receive push failed", zap.Error(err))
			return nil, err
		}

		if !s.recvQueue.Has() {
			continue
		}
		buf, err := s.recvQueue.Pop()
		if err != nil {
			log.Inst.Error("iosSurface.Receive pop failed", zap.Error(err))
			return nil, err
		}

		// for debug
		// reader, err := h264reader.NewReader(bytes.NewReader(buf))
		// if err != nil {
		// 	log.Inst.Error("iosSurface.Receive h264reader failed", zap.Error(err))
		// 	return nil, err
		// }
		// nal, err := reader.NextNAL()
		// if err != nil {
		// 	log.Inst.Error("iosSurface.Receive h264reader NextNAL", zap.Error(err))
		// 	return nil, err
		// }
		// log.Inst.Info("iosSurface.Receive h264reader NextNAL", zap.Any("type", nal.UnitType.String()), zap.Any("len", len(nal.Data)))

		return buf, nil
	}
}

func (s *iosSurface) NotifyData(listener SurfaceListener, timeStamp uint32, data []byte) {
	listener.OnSurface(timeStamp, data)
}

func (s *iosSurface) Close() {
	if nil == s.conn {
		return
	}
	if closeEr := s.conn.Close(); closeEr != nil {
		log.Inst.Error("iosSurface.Close", zap.Error(closeEr))
	}
}
