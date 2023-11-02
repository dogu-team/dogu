package relayer

import (
	"bufio"
	"fmt"
	"net"
	"os"
	"sync"
	"time"

	log "go-device-controller/internal/pkg/log"
	"go-device-controller/internal/pkg/utils"
	"go-device-controller/types/protocol/generated/proto/inner/params"

	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"
)

type IosDeviceAgentService struct {
	serial        string
	getUrlFunc    func() string
	onRecvMessage func(*params.DcIdaResultList)
	conn          *net.TCPConn
	reader        *bufio.Reader
	recvQueue     utils.SizePrefixedRecvQueue
	mutex         sync.Mutex
}

func NewIosDeviceAgentService(s *IosDeviceAgentService, serial string, getUrlFunc func() string, onRecvMessage func(*params.DcIdaResultList)) {
	s.serial = serial
	s.getUrlFunc = getUrlFunc
	s.onRecvMessage = onRecvMessage
	go s.startRecvLoop()
}

func (s *IosDeviceAgentService) SendMessage(params *params.DcIdaParamList) error {
	var err error
	serverUrl := s.getUrlFunc()

	log.Inst.Info("IosInputTrack 2")

	if nil == s.conn || nil == s.reader {
		conn, err := reconnectIosDeviceAgent(s.getUrlFunc, 9999, 1)
		if nil == conn {
			log.Inst.Error("IosDeviceAgentService.SendMessage error no conn", zap.String("serial", s.serial), zap.String("url", serverUrl), zap.Error(err))
			s.conn = nil
			return err
		}
		s.conn = conn
		s.reader = bufio.NewReader(s.conn)
		s.recvQueue.Clear()
	}

	log.Inst.Info("IosInputTrack 3")

	out, err := proto.Marshal(params)
	if err != nil {
		log.Inst.Error("IosDeviceAgentService.marshal failed", zap.Error(err))
		return err
	}

	log.Inst.Info("IosInputTrack 4")
	buf := utils.PrefixBytesWithSize(out)
	_, err = s.conn.Write(buf)
	if err != nil {
		log.Inst.Error("IosDeviceAgentService.SendMessage error", zap.String("serial", s.serial), zap.String("url", serverUrl), zap.Error(err))
		s.conn = nil
		s.reader = nil
		return err
	}
	return nil
}

func (s *IosDeviceAgentService) startRecvLoop() {
	errorLogCount := 0
	for {
		if nil == s.conn || nil == s.reader {
			time.Sleep(time.Second * 1)
			continue
		}

		if s.recvQueue.Has() {
			buf, err := s.recvQueue.Pop()
			if err != nil {
				log.Inst.Error("IosDeviceAgentService.Receive pop failed", zap.Error(err))
				continue
			}

			result := &params.DcIdaResultList{}
			if err := proto.Unmarshal(buf, result); err != nil {
				log.Inst.Error("IosDeviceAgentService.onEach proto.Unmarshal error", zap.Error(err))
				continue
			}

			s.onRecvMessage(result)
			continue
		}

		err := s.recvQueue.Push(s.reader)
		if err != nil {
			if errorLogCount%100 == 0 {
				log.Inst.Error("IosDeviceAgentService.Receive push failed", zap.Error(err))
			}
			errorLogCount += 1
			time.Sleep(time.Millisecond * 200)
			continue
		}
		errorLogCount = 0
	}
}

func reconnectIosDeviceAgent(getUrlFunc func() string, retryCount int, sleepSec int) (*net.TCPConn, error) {
	// reconnect loop
	count := 0
	for {
		serverUrl := getUrlFunc()

		log.Inst.Debug("IosDeviceAgentService.Reconnect", zap.String("serverUrl", serverUrl))
		conn, err := net.Dial("tcp", serverUrl)
		if err != nil {
			if count >= retryCount {
				return nil, err
			}
			log.Inst.Info("IosDeviceAgentService.reconnect", zap.String("url", serverUrl), zap.Int("retry", count))
			time.Sleep(time.Second * time.Duration(sleepSec))
			count += 1
			continue
		}

		tcpConn, ok := conn.(*net.TCPConn)
		if !ok {
			fmt.Println("Failed to convert net.Conn to net.TCPConn")
			os.Exit(1)
		}
		return tcpConn, nil
	}
}
