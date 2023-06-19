package types

import "go-device-controller/types/protocol/generated/proto/outer"

var Success = &outer.ErrorResult{Code: outer.Code_CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED, Message: ""}

func isSuccess(err *outer.ErrorResult) bool {
	if err == nil {
		return false
	}
	return err.Code == outer.Code_CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED
}
