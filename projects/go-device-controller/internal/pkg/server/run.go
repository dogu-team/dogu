package server

import (
	"context"
	"flag"
	"fmt"
	"net"
	"runtime"

	log "go-device-controller/internal/pkg/log"

	"go-device-controller/internal/pkg/args"
	"go-device-controller/internal/pkg/sockopt"
	"go-device-controller/internal/pkg/streamer"

	generatedEnv "go-device-controller/types/protocol/generated/env"
	gs "go-device-controller/types/protocol/generated/proto/inner/grpc/services"

	"github.com/go-vgo/robotgo"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

func Run() {
	RunDetach()
	select {}
}

func RunDetach() *grpc.Server {
	runtime.GOMAXPROCS(runtime.NumCPU())

	log.Start()
	log.Inst.Debug("RunDetach")
	log.Inst.Info("dogu protocol version", zap.String("DOGU_PROTOCOL_VERSION", generatedEnv.DOGU_PROTOCOL_VERSION))

	var grpcServerPort int
	flag.IntVar(&grpcServerPort, "grpcServerPort", 50055, "stream command receiver server")

	var deviceServerPort int
	flag.IntVar(&deviceServerPort, "deviceServerPort", 0, "device server port")

	flag.StringVar(&args.Global.FFmpegPath, "ffmpegPath", "ffmpeg", "ffmpeg absolute path")

	PrepareUtilArg()

	flag.Parse()

	if IsUtilMode() {
		RunUtil()
		return nil
	}

	if deviceServerPort == 0 {
		panic("deviceServerPort is not set")
	}

	log.Inst.Info("arguments", zap.Int("grpcServerPort", grpcServerPort), zap.Int("deviceServerPort", deviceServerPort), zap.String("ffmpegPath", args.Global.FFmpegPath))

	err := robotgo.SetXDisplayName(":0")
	if err != nil {
		log.Inst.Warn("SetXDisplayName failed", zap.Error(err))
	}

	srv := grpc.NewServer()
	gs.RegisterGoDeviceControllerServiceServer(srv, streamer.NewGoDeviceControllerService(int32(deviceServerPort)))
	goCheckDeviceServer(uint32(deviceServerPort))

	config := &net.ListenConfig{Control: sockopt.ReusePort}
	listener, err := config.Listen(context.Background(), "tcp4", fmt.Sprintf("0.0.0.0:%d", grpcServerPort))
	if err != nil {
		log.Inst.Fatal("listening failed. ", zap.Error(err))
	}

	go func() {
		defer log.Stop()

		log.Inst.Info("server listening at ", zap.Any("addr", listener.Addr()))
		if err := srv.Serve(listener); err != nil {
			log.Inst.Fatal("serving failed. ", zap.Error(err))
		}
	}()
	return srv
}
