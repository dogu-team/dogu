package relayer

import (
	"context"
	"sync"
	"time"

	log "go-device-controller/internal/pkg/log"
	"go-device-controller/types/protocol/generated/proto/inner/grpc/services"
	"go-device-controller/types/protocol/generated/proto/inner/params"

	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type IosDeviceAgentService struct {
	serial        string
	getUrlFunc    func() string
	onRecvMessage func(*params.CfGdcDaResultList)
	conn          services.IosDeviceAgentServiceClient
	stream        services.IosDeviceAgentService_RelayClient
	mutex         sync.Mutex
}

func NewIosDeviceAgentService(s *IosDeviceAgentService, serial string, getUrlFunc func() string, onRecvMessage func(*params.CfGdcDaResultList)) {
	s.serial = serial
	s.getUrlFunc = getUrlFunc
	s.onRecvMessage = onRecvMessage
	go s.startRecvLoop()
}

func (s *IosDeviceAgentService) SendMessage(params *params.CfGdcDaParamList) error {
	var err error
	serverUrl := s.getUrlFunc()

	if nil == s.conn || nil == s.stream {
		conn, ctx, err := reconnectIosDeviceAgent(s.getUrlFunc, 9999, 1)
		if nil == conn {
			log.Inst.Error("IosDeviceAgentService.SendMessage error no conn", zap.String("serial", s.serial), zap.String("url", serverUrl), zap.Error(err))
			s.conn = nil
			return err
		}
		s.conn = conn
		stream, err := s.conn.Relay(ctx)
		if nil == stream {
			log.Inst.Error("IosDeviceAgentService.SendMessage error no stream", zap.String("serial", s.serial), zap.String("url", serverUrl), zap.Error(err))
			s.stream = nil
			return err
		}
		s.stream = stream
	}

	err = s.stream.Send(params)
	if err != nil {
		log.Inst.Error("IosDeviceAgentService.SendMessage error", zap.String("serial", s.serial), zap.String("url", serverUrl), zap.Error(err))
		s.conn = nil
		s.stream = nil
		return err
	}
	return nil
}

func (s *IosDeviceAgentService) startRecvLoop() {
	for {
		if nil == s.conn || nil == s.stream {
			time.Sleep(time.Second * 1)
			continue
		}

		results, err := s.stream.Recv()
		if err != nil {
			log.Inst.Error("IosDeviceAgentService.ReadMessage error", zap.String("serial", s.serial), zap.Error(err))
			s.conn = nil
			s.stream = nil
			continue
		}

		s.onRecvMessage(results)
		// todo(yow) close goroutine when signaled
	}
}

func reconnectIosDeviceAgent(getUrlFunc func() string, retryCount int, sleepSec int) (services.IosDeviceAgentServiceClient, context.Context, error) {
	// reconnect loop
	count := 0
	for {
		serverUrl := getUrlFunc()

		opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}
		ctx, _ := context.WithTimeout(context.Background(), time.Second*10)
		conn, err := grpc.DialContext(ctx, serverUrl, opts...)
		if err != nil {
			if count >= retryCount {
				return nil, nil, err
			}
			log.Inst.Info("IosDeviceAgentService.reconnect", zap.String("url", serverUrl), zap.Int("retry", count))
			time.Sleep(time.Second * time.Duration(sleepSec))
			count += 1
			continue
		}

		client := services.NewIosDeviceAgentServiceClient(conn)
		return client, ctx, nil
	}
}
