package server

import (
	"flag"
	"runtime"

	"go-device-controller/types/protocol/generated/proto/inner/types"
	"go-device-controller/types/protocol/generated/proto/outer"
	"go-device-controller/types/protocol/generated/proto/outer/streaming"

	"go-device-controller/internal/pkg/device"
	"go-device-controller/internal/pkg/log"
	"go-device-controller/internal/pkg/muxer"

	"go.uber.org/zap"
)

var (
	utilMode   bool
	utilType   string
	filePath   string
	fps        int
	resolution int
)

func PrepareUtilArg() {
	flag.BoolVar(&utilMode, "utilMode", false, "for cli util mode")

	flag.StringVar(&utilType, "utilType", "record", "cli util mode type (record)")
	flag.StringVar(&filePath, "filePath", "", "used with record mode. filePath")
	flag.IntVar(&fps, "fps", 5, "used with record mode. fps")
	flag.IntVar(&resolution, "resolution", 1080, "used with record mode. resolution")
}

func IsUtilMode() bool {
	return utilMode
}

func RunUtil() {
	log.Inst.Info("RunUtil")

	if utilType == "record" {
		startRecordCLI()
	}
}

func startRecordCLI() {
	if filePath == "" {
		panic("filePath is not set")
	}
	log.Inst.Info("startRecordCLI", zap.String("filePath", filePath), zap.Int("fps", fps), zap.Int("resolution", resolution))
	serial := "serial"
	devices := device.NewDevices()

	var platform outer.Platform = outer.Platform_PLATFORM_MACOS
	if runtime.GOOS == "windows" {
		platform = outer.Platform_PLATFORM_WINDOWS
	}

	ctx := types.DcGdcDeviceContext{
		Serial:    serial,
		Platform:  platform,
		ScreenUrl: "ScreenUrl",
	}
	ctxs := []*types.DcGdcDeviceContext{&ctx}
	devices.OnDevicelistUpdated(ctxs)

	log.Inst.Info("startRecordCLI newWebmWriter")

	newRecorder, errResult := muxer.NewWebmMuxer(filePath)
	if nil != errResult && errResult.Code != outer.Code_CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED {
		log.Inst.Error("Failed to create new recorder", zap.Any("err", errResult))
	}
	var bitrate uint64 = 1 // not used
	var maxFps uint64 = uint64(fps)
	var frameRate uint64 = 1        // not used
	var frameInterval uint64 = 1    // not used
	var repeatFrameDelay uint64 = 1 // not used
	var maxResolution uint32 = uint32(resolution)

	option := streaming.ScreenCaptureOption{
		BitRate:          &bitrate,
		MaxFps:           &maxFps,
		FrameRate:        &frameRate,
		FrameInterval:    &frameInterval,
		RepeatFrameDelay: &repeatFrameDelay,
		MaxResolution:    &maxResolution,
	}
	log.Inst.Info("startRecordCLI AddSurfaceListener")
	devices.AddSurfaceListener(serial, newRecorder, &option)
	log.Inst.Info("startRecordCLI before select")
	select {}
}
