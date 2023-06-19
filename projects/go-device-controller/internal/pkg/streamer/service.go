package streamer

import (
	"context"
	"time"

	"go-device-controller/types/protocol/generated/proto/inner/grpc/services"
	"go-device-controller/types/protocol/generated/proto/inner/params"
	"go-device-controller/types/protocol/generated/proto/inner/types"
	"go-device-controller/types/protocol/generated/proto/outer"
	"go-device-controller/types/protocol/generated/proto/outer/streaming"
	gotypes "go-device-controller/types/types"

	log "go-device-controller/internal/pkg/log"
	"go-device-controller/internal/pkg/muxer"

	"go-device-controller/internal/pkg/device"

	"go.uber.org/zap"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type GoDeviceControllerService struct {
	services.UnimplementedGoDeviceControllerServiceServer
	deviceServerPort int32
	streamers        []*Streamer
	streamMonitor    *StreamMonitor
	devices          *device.Devices
}

func NewGoDeviceControllerService(deviceServerPort int32) *GoDeviceControllerService {
	s := GoDeviceControllerService{}
	s.deviceServerPort = deviceServerPort
	s.streamMonitor = newStreamMonitor(&s.streamers)
	s.devices = device.NewDevices()
	s.streamMonitor.startRoutine()
	return &s
}

func (s *GoDeviceControllerService) Call(ctx context.Context, param *params.DcGdcParam) (*params.DcGdcResult, error) {
	// log.Inst.Debug("GoDeviceControllerService.Call", zap.Any("param", param.Value))
	switch a := param.Value.(type) {

	case *params.DcGdcParam_DcGdcUpdateDevicelistParam:
		s.devices.OnDevicelistUpdated(a.DcGdcUpdateDevicelistParam.Devices)
		ret := &params.DcGdcResult{
			Value: &params.DcGdcResult_DcGdcUpdateDevicelistResult{
				DcGdcUpdateDevicelistResult: &types.DcGdcUpdateDeviceListResult{},
			},
		}
		return ret, nil
	case *params.DcGdcParam_DcGdcStartScreenRecordParam:
		errResult := s.startRecording(a)
		ret := &params.DcGdcResult{
			Value: &params.DcGdcResult_DcGdcStartScreenRecordResult{
				DcGdcStartScreenRecordResult: &types.DcGdcStartScreenRecordResult{
					Error: errResult,
				},
			},
		}
		return ret, nil
	case *params.DcGdcParam_DcGdcStopScreenRecordParam:
		result := s.stopRecording(a)
		ret := &params.DcGdcResult{
			Value: &params.DcGdcResult_DcGdcStopScreenRecordResult{
				DcGdcStopScreenRecordResult: result,
			},
		}
		return ret, nil
	}

	return nil, status.Errorf(codes.Internal, "unkown type %v", param.Value)
}

func (s *GoDeviceControllerService) StartStreaming(param *types.DcGdcStartStreamingParam, server services.GoDeviceControllerService_StartStreamingServer) error {
	s.cleanUpStreamer()

	switch a := param.Offer.Value.(type) {
	case *streaming.StreamingOffer_StartStreaming:
		streamer := newStreamer(param.Offer.Serial, s.deviceServerPort, a, s.devices,
			func(psa *streaming.StreamingAnswer) {
				server.Send(&types.DcGdcStartStreamingResult{
					Answer: psa,
				})
			})

		s.streamers = append(s.streamers, streamer)
	case *streaming.StreamingOffer_IceCandidate:
		log.Inst.Warn("GoDeviceControllerService.StartStreaming ProtoStreamingOffer_IceCandidate not supported", zap.Any("IceCandidate", a))
		return nil
	}
	timer := time.NewTimer(30 * time.Second)
	<-timer.C
	return nil
}

func (s *GoDeviceControllerService) startRecording(a *params.DcGdcParam_DcGdcStartScreenRecordParam) *outer.ErrorResult {
	serial := a.DcGdcStartScreenRecordParam.Serial
	option := a.DcGdcStartScreenRecordParam.Option
	recorders := s.devices.FindSurfaceListeners(serial, muxer.MuxerType)
	if len(recorders) > 0 {
		return &outer.ErrorResult{
			Code:    outer.Code_CODE_SCREENRECORD_ALREADY_RECORDING,
			Message: "already recording",
		}
	}
	context, err := s.devices.GetContext(serial)
	if err != nil {
		return &outer.ErrorResult{
			Code:    outer.Code_CODE_SCREENRECORD_NOTSTARTED,
			Message: "device not found",
		}
	}
	// get file extension
	muxer, errResult := muxer.NewMuxer(option.FilePath, option.GetEtcParam(), &context)
	if nil != errResult && errResult.Code != outer.Code_CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED {
		return errResult
	}
	return s.devices.AddSurfaceListener(serial, muxer, option.Screen)
}

func (s *GoDeviceControllerService) stopRecording(a *params.DcGdcParam_DcGdcStopScreenRecordParam) *types.DcGdcStopScreenRecordResult {
	serial := a.DcGdcStopScreenRecordParam.GetSerial()
	listeners := s.devices.FindSurfaceListeners(serial, muxer.MuxerType)
	if len(listeners) == 0 {
		return &types.DcGdcStopScreenRecordResult{
			Error: &outer.ErrorResult{
				Code:    outer.Code_CODE_SCREENRECORD_NOTSTARTED,
				Message: "recording notstarted",
			},
		}
	} else if len(listeners) > 1 {
		return &types.DcGdcStopScreenRecordResult{
			Error: &outer.ErrorResult{
				Code:    outer.Code_CODE_SCREENRECORD_MULTIPLE_RECORDING,
				Message: "multiple recording",
			},
		}
	}
	for _, listener := range listeners {
		muxer, ok := listener.(muxer.Muxer)
		if ok {
			filePath := muxer.FilePath()
			s.devices.RemoveSurfaceListener(serial, muxer)
			return &types.DcGdcStopScreenRecordResult{
				Error:    gotypes.Success,
				FilePath: filePath,
			}
		}
	}
	return &types.DcGdcStopScreenRecordResult{
		Error: &outer.ErrorResult{
			Code:    outer.Code_CODE_SCREENRECORD_NOTFOUND,
			Message: "recorder not found",
		},
	}
}

func (s *GoDeviceControllerService) cleanUpStreamer() {
	for i := 0; i < len(s.streamers); i++ {
		if s.streamers[i].isClosed {
			s.streamers = append(s.streamers[:i], s.streamers[i+1:]...)
			i--
		}
	}
}
