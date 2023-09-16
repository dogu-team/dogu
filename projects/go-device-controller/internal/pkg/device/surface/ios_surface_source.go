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

type iosSurfaceSource struct {
	conn      *net.TCPConn
	agentUrl  *string
	reader    *bufio.Reader
	recvQueue utils.SizePrefixedRecvQueue
}

var _is SurfaceSource = &iosSurfaceSource{}

func NewIosSurfaceSource(agentUrl *string) *iosSurfaceSource {
	log.Inst.Debug("iosSurfaceSource.newiOSSurface")
	s := iosSurfaceSource{}
	s.agentUrl = agentUrl
	return &s
}

func (s *iosSurfaceSource) Connect(serial string, screenCaptureOption *streaming.ScreenCaptureOption) error {
	var err error
	log.Inst.Debug("iosSurfaceSource.Connect", zap.String("serial", serial), zap.String("addr", *s.agentUrl))
	conn, err := net.Dial("tcp", *s.agentUrl)
	if err != nil {
		log.Inst.Error("iosSurfaceSource.Connect", zap.String("serial", serial), zap.String("addr", *s.agentUrl), zap.Error(err))
		return err
	}

	tcpConn, ok := conn.(*net.TCPConn)
	if !ok {
		fmt.Println("Failed to convert net.Conn to net.TCPConn")
		os.Exit(1)
	}

	// make json
	json := fmt.Sprintf("{\"type\":\"screen\", \"maxFps\":%d, \"maxResolution\":%d}", *screenCaptureOption.MaxFps, *screenCaptureOption.MaxResolution)
	log.Inst.Debug("iosSurfaceSource.Connect option", zap.String("serial", serial), zap.String("addr", *s.agentUrl), zap.String("json", json))
	// send bytes with little endian size prefixed
	bytes := make([]byte, 4+len(json))
	binary.LittleEndian.PutUint32(bytes, uint32(len(json)))
	copy(bytes[4:], json)
	_, err = tcpConn.Write(bytes)
	if err != nil {
		log.Inst.Error("iosSurfaceSource.Connect write failed", zap.Error(err))
		return err
	}

	s.conn = tcpConn
	s.reader = bufio.NewReader(s.conn)
	s.recvQueue.Clear()
	return nil
}

func (s *iosSurfaceSource) Receive() ([]byte, error) {
	if nil == s.conn || nil == s.reader {
		log.Inst.Error("iosSurfaceSource.Receive null exists", zap.Bool("conn", nil == s.conn), zap.Bool("reader", nil == s.reader))
		return nil, errors.Errorf("iosSurfaceSource.Receive reader is null")
	}
	buf, err := s.receive()
	if err != nil {
		s.conn = nil
		s.reader = nil
	}
	return buf, err
}

func (s *iosSurfaceSource) receive() ([]byte, error) {
	for {
		err := s.recvQueue.Push(s.reader)
		if err != nil {
			log.Inst.Error("iosSurfaceSource.Receive push failed", zap.Error(err))
			return nil, err
		}

		if !s.recvQueue.Has() {
			continue
		}
		buf, err := s.recvQueue.Pop()
		if err != nil {
			log.Inst.Error("iosSurfaceSource.Receive pop failed", zap.Error(err))
			return nil, err
		}

		// for debug
		// reader, err := h264reader.NewReader(bytes.NewReader(buf))
		// if err != nil {
		// 	log.Inst.Error("iosSurfaceSource.Receive h264reader failed", zap.Error(err))
		// 	return nil, err
		// }
		// nal, err := reader.NextNAL()
		// if err != nil {
		// 	log.Inst.Error("iosSurfaceSource.Receive h264reader NextNAL", zap.Error(err))
		// 	return nil, err
		// }
		// log.Inst.Info("iosSurfaceSource.Receive h264reader NextNAL", zap.Any("type", nal.UnitType.String()), zap.Any("len", len(nal.Data)))

		return buf, nil
	}
}

func (s *iosSurfaceSource) NotifyData(listener SurfaceListener, timeStamp uint32, data []byte) {
	listener.OnSurface(timeStamp, data)
}

func (s *iosSurfaceSource) Close() {
	conn := s.conn
	if nil == conn {
		return
	}
	if closeEr := conn.Close(); closeEr != nil {
		log.Inst.Error("iosSurfaceSource.Close", zap.Error(closeEr))
	}
}
