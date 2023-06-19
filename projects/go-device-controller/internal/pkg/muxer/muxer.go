package muxer

import (
	"go-device-controller/types/protocol/generated/proto/inner/types"
	"go-device-controller/types/protocol/generated/proto/outer"
)

const MuxerType = "Muxer"

type Muxer interface {
	FilePath() string
	GetSurfaceListenerType() string
	OnSurface(timeStamp uint32, Data []byte)
	OnRTPBytes(timeStamp uint32, Data []byte)
	OnRemove()
}

func NewMuxer(filePath string, etcParam string, context *types.DcGdcDeviceContext) (Muxer, *outer.ErrorResult) {
	// ext := filepath.Ext(filePath)
	if context.Platform == outer.Platform_PLATFORM_IOS {
		muxer, errResult := NewFFmpegMuxer(filePath, etcParam, context)
		if nil != errResult && errResult.Code != outer.Code_CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED {
			return nil, errResult
		}
		return muxer, nil
	}
	muxer, errResult := NewWebmMuxer(filePath)
	if nil != errResult && errResult.Code != outer.Code_CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED {
		return nil, errResult
	}
	return muxer, nil

	// return nil, &outer.ErrorResult{
	// 	Code:    outer.Code_CODE_SCREENRECORD_NOTSUPPORTED,
	// 	Message: "not supported codec: " + ext,
	// }
}
