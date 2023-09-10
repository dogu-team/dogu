// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.28.1
// 	protoc        v3.21.7
// source: inner/params/dc_gdc.proto

package params

import (
	types "go-device-controller/types/protocol/generated/proto/inner/types"
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type DcGdcParam struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// Types that are assignable to Value:
	//	*DcGdcParam_DcGdcUpdateDevicelistParam
	//	*DcGdcParam_DcGdcStartScreenRecordParam
	//	*DcGdcParam_DcGdcStopScreenRecordParam
	//	*DcGdcParam_DcGdcGetSurfaceStatusParam
	Value isDcGdcParam_Value `protobuf_oneof:"value"`
}

func (x *DcGdcParam) Reset() {
	*x = DcGdcParam{}
	if protoimpl.UnsafeEnabled {
		mi := &file_inner_params_dc_gdc_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DcGdcParam) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DcGdcParam) ProtoMessage() {}

func (x *DcGdcParam) ProtoReflect() protoreflect.Message {
	mi := &file_inner_params_dc_gdc_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DcGdcParam.ProtoReflect.Descriptor instead.
func (*DcGdcParam) Descriptor() ([]byte, []int) {
	return file_inner_params_dc_gdc_proto_rawDescGZIP(), []int{0}
}

func (m *DcGdcParam) GetValue() isDcGdcParam_Value {
	if m != nil {
		return m.Value
	}
	return nil
}

func (x *DcGdcParam) GetDcGdcUpdateDevicelistParam() *types.DcGdcUpdateDeviceListParam {
	if x, ok := x.GetValue().(*DcGdcParam_DcGdcUpdateDevicelistParam); ok {
		return x.DcGdcUpdateDevicelistParam
	}
	return nil
}

func (x *DcGdcParam) GetDcGdcStartScreenRecordParam() *types.DcGdcStartScreenRecordParam {
	if x, ok := x.GetValue().(*DcGdcParam_DcGdcStartScreenRecordParam); ok {
		return x.DcGdcStartScreenRecordParam
	}
	return nil
}

func (x *DcGdcParam) GetDcGdcStopScreenRecordParam() *types.DcGdcStopScreenRecordParam {
	if x, ok := x.GetValue().(*DcGdcParam_DcGdcStopScreenRecordParam); ok {
		return x.DcGdcStopScreenRecordParam
	}
	return nil
}

func (x *DcGdcParam) GetDcGdcGetSurfaceStatusParam() *types.DcGdcGetSurfaceStatusParam {
	if x, ok := x.GetValue().(*DcGdcParam_DcGdcGetSurfaceStatusParam); ok {
		return x.DcGdcGetSurfaceStatusParam
	}
	return nil
}

type isDcGdcParam_Value interface {
	isDcGdcParam_Value()
}

type DcGdcParam_DcGdcUpdateDevicelistParam struct {
	DcGdcUpdateDevicelistParam *types.DcGdcUpdateDeviceListParam `protobuf:"bytes,10,opt,name=dc_gdc_update_devicelist_param,json=dcGdcUpdateDevicelistParam,proto3,oneof"`
}

type DcGdcParam_DcGdcStartScreenRecordParam struct {
	DcGdcStartScreenRecordParam *types.DcGdcStartScreenRecordParam `protobuf:"bytes,13,opt,name=dc_gdc_start_screen_record_param,json=dcGdcStartScreenRecordParam,proto3,oneof"`
}

type DcGdcParam_DcGdcStopScreenRecordParam struct {
	DcGdcStopScreenRecordParam *types.DcGdcStopScreenRecordParam `protobuf:"bytes,14,opt,name=dc_gdc_stop_screen_record_param,json=dcGdcStopScreenRecordParam,proto3,oneof"`
}

type DcGdcParam_DcGdcGetSurfaceStatusParam struct {
	DcGdcGetSurfaceStatusParam *types.DcGdcGetSurfaceStatusParam `protobuf:"bytes,15,opt,name=dc_gdc_get_surface_status_param,json=dcGdcGetSurfaceStatusParam,proto3,oneof"`
}

func (*DcGdcParam_DcGdcUpdateDevicelistParam) isDcGdcParam_Value() {}

func (*DcGdcParam_DcGdcStartScreenRecordParam) isDcGdcParam_Value() {}

func (*DcGdcParam_DcGdcStopScreenRecordParam) isDcGdcParam_Value() {}

func (*DcGdcParam_DcGdcGetSurfaceStatusParam) isDcGdcParam_Value() {}

type DcGdcResult struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// Types that are assignable to Value:
	//	*DcGdcResult_DcGdcUpdateDevicelistResult
	//	*DcGdcResult_DcGdcStartScreenRecordResult
	//	*DcGdcResult_DcGdcStopScreenRecordResult
	//	*DcGdcResult_DcGdcGetSurfaceStatusResult
	Value isDcGdcResult_Value `protobuf_oneof:"value"`
}

func (x *DcGdcResult) Reset() {
	*x = DcGdcResult{}
	if protoimpl.UnsafeEnabled {
		mi := &file_inner_params_dc_gdc_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DcGdcResult) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DcGdcResult) ProtoMessage() {}

func (x *DcGdcResult) ProtoReflect() protoreflect.Message {
	mi := &file_inner_params_dc_gdc_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DcGdcResult.ProtoReflect.Descriptor instead.
func (*DcGdcResult) Descriptor() ([]byte, []int) {
	return file_inner_params_dc_gdc_proto_rawDescGZIP(), []int{1}
}

func (m *DcGdcResult) GetValue() isDcGdcResult_Value {
	if m != nil {
		return m.Value
	}
	return nil
}

func (x *DcGdcResult) GetDcGdcUpdateDevicelistResult() *types.DcGdcUpdateDeviceListResult {
	if x, ok := x.GetValue().(*DcGdcResult_DcGdcUpdateDevicelistResult); ok {
		return x.DcGdcUpdateDevicelistResult
	}
	return nil
}

func (x *DcGdcResult) GetDcGdcStartScreenRecordResult() *types.DcGdcStartScreenRecordResult {
	if x, ok := x.GetValue().(*DcGdcResult_DcGdcStartScreenRecordResult); ok {
		return x.DcGdcStartScreenRecordResult
	}
	return nil
}

func (x *DcGdcResult) GetDcGdcStopScreenRecordResult() *types.DcGdcStopScreenRecordResult {
	if x, ok := x.GetValue().(*DcGdcResult_DcGdcStopScreenRecordResult); ok {
		return x.DcGdcStopScreenRecordResult
	}
	return nil
}

func (x *DcGdcResult) GetDcGdcGetSurfaceStatusResult() *types.DcGdcGetSurfaceStatusResult {
	if x, ok := x.GetValue().(*DcGdcResult_DcGdcGetSurfaceStatusResult); ok {
		return x.DcGdcGetSurfaceStatusResult
	}
	return nil
}

type isDcGdcResult_Value interface {
	isDcGdcResult_Value()
}

type DcGdcResult_DcGdcUpdateDevicelistResult struct {
	DcGdcUpdateDevicelistResult *types.DcGdcUpdateDeviceListResult `protobuf:"bytes,10,opt,name=dc_gdc_update_devicelist_result,json=dcGdcUpdateDevicelistResult,proto3,oneof"`
}

type DcGdcResult_DcGdcStartScreenRecordResult struct {
	DcGdcStartScreenRecordResult *types.DcGdcStartScreenRecordResult `protobuf:"bytes,13,opt,name=dc_gdc_start_screen_record_result,json=dcGdcStartScreenRecordResult,proto3,oneof"`
}

type DcGdcResult_DcGdcStopScreenRecordResult struct {
	DcGdcStopScreenRecordResult *types.DcGdcStopScreenRecordResult `protobuf:"bytes,14,opt,name=dc_gdc_stop_screen_record_result,json=dcGdcStopScreenRecordResult,proto3,oneof"`
}

type DcGdcResult_DcGdcGetSurfaceStatusResult struct {
	DcGdcGetSurfaceStatusResult *types.DcGdcGetSurfaceStatusResult `protobuf:"bytes,15,opt,name=dc_gdc_get_surface_status_result,json=dcGdcGetSurfaceStatusResult,proto3,oneof"`
}

func (*DcGdcResult_DcGdcUpdateDevicelistResult) isDcGdcResult_Value() {}

func (*DcGdcResult_DcGdcStartScreenRecordResult) isDcGdcResult_Value() {}

func (*DcGdcResult_DcGdcStopScreenRecordResult) isDcGdcResult_Value() {}

func (*DcGdcResult_DcGdcGetSurfaceStatusResult) isDcGdcResult_Value() {}

var File_inner_params_dc_gdc_proto protoreflect.FileDescriptor

var file_inner_params_dc_gdc_proto_rawDesc = []byte{
	0x0a, 0x19, 0x69, 0x6e, 0x6e, 0x65, 0x72, 0x2f, 0x70, 0x61, 0x72, 0x61, 0x6d, 0x73, 0x2f, 0x64,
	0x63, 0x5f, 0x67, 0x64, 0x63, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12, 0x0c, 0x69, 0x6e, 0x6e,
	0x65, 0x72, 0x2e, 0x70, 0x61, 0x72, 0x61, 0x6d, 0x73, 0x1a, 0x18, 0x69, 0x6e, 0x6e, 0x65, 0x72,
	0x2f, 0x74, 0x79, 0x70, 0x65, 0x73, 0x2f, 0x64, 0x63, 0x5f, 0x67, 0x64, 0x63, 0x2e, 0x70, 0x72,
	0x6f, 0x74, 0x6f, 0x22, 0xd7, 0x03, 0x0a, 0x0a, 0x44, 0x63, 0x47, 0x64, 0x63, 0x50, 0x61, 0x72,
	0x61, 0x6d, 0x12, 0x6d, 0x0a, 0x1e, 0x64, 0x63, 0x5f, 0x67, 0x64, 0x63, 0x5f, 0x75, 0x70, 0x64,
	0x61, 0x74, 0x65, 0x5f, 0x64, 0x65, 0x76, 0x69, 0x63, 0x65, 0x6c, 0x69, 0x73, 0x74, 0x5f, 0x70,
	0x61, 0x72, 0x61, 0x6d, 0x18, 0x0a, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x27, 0x2e, 0x69, 0x6e, 0x6e,
	0x65, 0x72, 0x2e, 0x74, 0x79, 0x70, 0x65, 0x73, 0x2e, 0x44, 0x63, 0x47, 0x64, 0x63, 0x55, 0x70,
	0x64, 0x61, 0x74, 0x65, 0x44, 0x65, 0x76, 0x69, 0x63, 0x65, 0x4c, 0x69, 0x73, 0x74, 0x50, 0x61,
	0x72, 0x61, 0x6d, 0x48, 0x00, 0x52, 0x1a, 0x64, 0x63, 0x47, 0x64, 0x63, 0x55, 0x70, 0x64, 0x61,
	0x74, 0x65, 0x44, 0x65, 0x76, 0x69, 0x63, 0x65, 0x6c, 0x69, 0x73, 0x74, 0x50, 0x61, 0x72, 0x61,
	0x6d, 0x12, 0x71, 0x0a, 0x20, 0x64, 0x63, 0x5f, 0x67, 0x64, 0x63, 0x5f, 0x73, 0x74, 0x61, 0x72,
	0x74, 0x5f, 0x73, 0x63, 0x72, 0x65, 0x65, 0x6e, 0x5f, 0x72, 0x65, 0x63, 0x6f, 0x72, 0x64, 0x5f,
	0x70, 0x61, 0x72, 0x61, 0x6d, 0x18, 0x0d, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x28, 0x2e, 0x69, 0x6e,
	0x6e, 0x65, 0x72, 0x2e, 0x74, 0x79, 0x70, 0x65, 0x73, 0x2e, 0x44, 0x63, 0x47, 0x64, 0x63, 0x53,
	0x74, 0x61, 0x72, 0x74, 0x53, 0x63, 0x72, 0x65, 0x65, 0x6e, 0x52, 0x65, 0x63, 0x6f, 0x72, 0x64,
	0x50, 0x61, 0x72, 0x61, 0x6d, 0x48, 0x00, 0x52, 0x1b, 0x64, 0x63, 0x47, 0x64, 0x63, 0x53, 0x74,
	0x61, 0x72, 0x74, 0x53, 0x63, 0x72, 0x65, 0x65, 0x6e, 0x52, 0x65, 0x63, 0x6f, 0x72, 0x64, 0x50,
	0x61, 0x72, 0x61, 0x6d, 0x12, 0x6e, 0x0a, 0x1f, 0x64, 0x63, 0x5f, 0x67, 0x64, 0x63, 0x5f, 0x73,
	0x74, 0x6f, 0x70, 0x5f, 0x73, 0x63, 0x72, 0x65, 0x65, 0x6e, 0x5f, 0x72, 0x65, 0x63, 0x6f, 0x72,
	0x64, 0x5f, 0x70, 0x61, 0x72, 0x61, 0x6d, 0x18, 0x0e, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x27, 0x2e,
	0x69, 0x6e, 0x6e, 0x65, 0x72, 0x2e, 0x74, 0x79, 0x70, 0x65, 0x73, 0x2e, 0x44, 0x63, 0x47, 0x64,
	0x63, 0x53, 0x74, 0x6f, 0x70, 0x53, 0x63, 0x72, 0x65, 0x65, 0x6e, 0x52, 0x65, 0x63, 0x6f, 0x72,
	0x64, 0x50, 0x61, 0x72, 0x61, 0x6d, 0x48, 0x00, 0x52, 0x1a, 0x64, 0x63, 0x47, 0x64, 0x63, 0x53,
	0x74, 0x6f, 0x70, 0x53, 0x63, 0x72, 0x65, 0x65, 0x6e, 0x52, 0x65, 0x63, 0x6f, 0x72, 0x64, 0x50,
	0x61, 0x72, 0x61, 0x6d, 0x12, 0x6e, 0x0a, 0x1f, 0x64, 0x63, 0x5f, 0x67, 0x64, 0x63, 0x5f, 0x67,
	0x65, 0x74, 0x5f, 0x73, 0x75, 0x72, 0x66, 0x61, 0x63, 0x65, 0x5f, 0x73, 0x74, 0x61, 0x74, 0x75,
	0x73, 0x5f, 0x70, 0x61, 0x72, 0x61, 0x6d, 0x18, 0x0f, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x27, 0x2e,
	0x69, 0x6e, 0x6e, 0x65, 0x72, 0x2e, 0x74, 0x79, 0x70, 0x65, 0x73, 0x2e, 0x44, 0x63, 0x47, 0x64,
	0x63, 0x47, 0x65, 0x74, 0x53, 0x75, 0x72, 0x66, 0x61, 0x63, 0x65, 0x53, 0x74, 0x61, 0x74, 0x75,
	0x73, 0x50, 0x61, 0x72, 0x61, 0x6d, 0x48, 0x00, 0x52, 0x1a, 0x64, 0x63, 0x47, 0x64, 0x63, 0x47,
	0x65, 0x74, 0x53, 0x75, 0x72, 0x66, 0x61, 0x63, 0x65, 0x53, 0x74, 0x61, 0x74, 0x75, 0x73, 0x50,
	0x61, 0x72, 0x61, 0x6d, 0x42, 0x07, 0x0a, 0x05, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x22, 0xe4, 0x03,
	0x0a, 0x0b, 0x44, 0x63, 0x47, 0x64, 0x63, 0x52, 0x65, 0x73, 0x75, 0x6c, 0x74, 0x12, 0x70, 0x0a,
	0x1f, 0x64, 0x63, 0x5f, 0x67, 0x64, 0x63, 0x5f, 0x75, 0x70, 0x64, 0x61, 0x74, 0x65, 0x5f, 0x64,
	0x65, 0x76, 0x69, 0x63, 0x65, 0x6c, 0x69, 0x73, 0x74, 0x5f, 0x72, 0x65, 0x73, 0x75, 0x6c, 0x74,
	0x18, 0x0a, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x28, 0x2e, 0x69, 0x6e, 0x6e, 0x65, 0x72, 0x2e, 0x74,
	0x79, 0x70, 0x65, 0x73, 0x2e, 0x44, 0x63, 0x47, 0x64, 0x63, 0x55, 0x70, 0x64, 0x61, 0x74, 0x65,
	0x44, 0x65, 0x76, 0x69, 0x63, 0x65, 0x4c, 0x69, 0x73, 0x74, 0x52, 0x65, 0x73, 0x75, 0x6c, 0x74,
	0x48, 0x00, 0x52, 0x1b, 0x64, 0x63, 0x47, 0x64, 0x63, 0x55, 0x70, 0x64, 0x61, 0x74, 0x65, 0x44,
	0x65, 0x76, 0x69, 0x63, 0x65, 0x6c, 0x69, 0x73, 0x74, 0x52, 0x65, 0x73, 0x75, 0x6c, 0x74, 0x12,
	0x74, 0x0a, 0x21, 0x64, 0x63, 0x5f, 0x67, 0x64, 0x63, 0x5f, 0x73, 0x74, 0x61, 0x72, 0x74, 0x5f,
	0x73, 0x63, 0x72, 0x65, 0x65, 0x6e, 0x5f, 0x72, 0x65, 0x63, 0x6f, 0x72, 0x64, 0x5f, 0x72, 0x65,
	0x73, 0x75, 0x6c, 0x74, 0x18, 0x0d, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x29, 0x2e, 0x69, 0x6e, 0x6e,
	0x65, 0x72, 0x2e, 0x74, 0x79, 0x70, 0x65, 0x73, 0x2e, 0x44, 0x63, 0x47, 0x64, 0x63, 0x53, 0x74,
	0x61, 0x72, 0x74, 0x53, 0x63, 0x72, 0x65, 0x65, 0x6e, 0x52, 0x65, 0x63, 0x6f, 0x72, 0x64, 0x52,
	0x65, 0x73, 0x75, 0x6c, 0x74, 0x48, 0x00, 0x52, 0x1c, 0x64, 0x63, 0x47, 0x64, 0x63, 0x53, 0x74,
	0x61, 0x72, 0x74, 0x53, 0x63, 0x72, 0x65, 0x65, 0x6e, 0x52, 0x65, 0x63, 0x6f, 0x72, 0x64, 0x52,
	0x65, 0x73, 0x75, 0x6c, 0x74, 0x12, 0x71, 0x0a, 0x20, 0x64, 0x63, 0x5f, 0x67, 0x64, 0x63, 0x5f,
	0x73, 0x74, 0x6f, 0x70, 0x5f, 0x73, 0x63, 0x72, 0x65, 0x65, 0x6e, 0x5f, 0x72, 0x65, 0x63, 0x6f,
	0x72, 0x64, 0x5f, 0x72, 0x65, 0x73, 0x75, 0x6c, 0x74, 0x18, 0x0e, 0x20, 0x01, 0x28, 0x0b, 0x32,
	0x28, 0x2e, 0x69, 0x6e, 0x6e, 0x65, 0x72, 0x2e, 0x74, 0x79, 0x70, 0x65, 0x73, 0x2e, 0x44, 0x63,
	0x47, 0x64, 0x63, 0x53, 0x74, 0x6f, 0x70, 0x53, 0x63, 0x72, 0x65, 0x65, 0x6e, 0x52, 0x65, 0x63,
	0x6f, 0x72, 0x64, 0x52, 0x65, 0x73, 0x75, 0x6c, 0x74, 0x48, 0x00, 0x52, 0x1b, 0x64, 0x63, 0x47,
	0x64, 0x63, 0x53, 0x74, 0x6f, 0x70, 0x53, 0x63, 0x72, 0x65, 0x65, 0x6e, 0x52, 0x65, 0x63, 0x6f,
	0x72, 0x64, 0x52, 0x65, 0x73, 0x75, 0x6c, 0x74, 0x12, 0x71, 0x0a, 0x20, 0x64, 0x63, 0x5f, 0x67,
	0x64, 0x63, 0x5f, 0x67, 0x65, 0x74, 0x5f, 0x73, 0x75, 0x72, 0x66, 0x61, 0x63, 0x65, 0x5f, 0x73,
	0x74, 0x61, 0x74, 0x75, 0x73, 0x5f, 0x72, 0x65, 0x73, 0x75, 0x6c, 0x74, 0x18, 0x0f, 0x20, 0x01,
	0x28, 0x0b, 0x32, 0x28, 0x2e, 0x69, 0x6e, 0x6e, 0x65, 0x72, 0x2e, 0x74, 0x79, 0x70, 0x65, 0x73,
	0x2e, 0x44, 0x63, 0x47, 0x64, 0x63, 0x47, 0x65, 0x74, 0x53, 0x75, 0x72, 0x66, 0x61, 0x63, 0x65,
	0x53, 0x74, 0x61, 0x74, 0x75, 0x73, 0x52, 0x65, 0x73, 0x75, 0x6c, 0x74, 0x48, 0x00, 0x52, 0x1b,
	0x64, 0x63, 0x47, 0x64, 0x63, 0x47, 0x65, 0x74, 0x53, 0x75, 0x72, 0x66, 0x61, 0x63, 0x65, 0x53,
	0x74, 0x61, 0x74, 0x75, 0x73, 0x52, 0x65, 0x73, 0x75, 0x6c, 0x74, 0x42, 0x07, 0x0a, 0x05, 0x76,
	0x61, 0x6c, 0x75, 0x65, 0x42, 0x6c, 0x0a, 0x28, 0x63, 0x6f, 0x6d, 0x2e, 0x64, 0x6f, 0x67, 0x75,
	0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x63, 0x6f, 0x6c, 0x2e, 0x67, 0x65, 0x6e, 0x65, 0x72, 0x61,
	0x74, 0x65, 0x64, 0x2e, 0x69, 0x6e, 0x6e, 0x65, 0x72, 0x2e, 0x70, 0x61, 0x72, 0x61, 0x6d, 0x73,
	0x5a, 0x40, 0x67, 0x6f, 0x2d, 0x64, 0x65, 0x76, 0x69, 0x63, 0x65, 0x2d, 0x63, 0x6f, 0x6e, 0x74,
	0x72, 0x6f, 0x6c, 0x6c, 0x65, 0x72, 0x2f, 0x74, 0x79, 0x70, 0x65, 0x73, 0x2f, 0x70, 0x72, 0x6f,
	0x74, 0x6f, 0x63, 0x6f, 0x6c, 0x2f, 0x67, 0x65, 0x6e, 0x65, 0x72, 0x61, 0x74, 0x65, 0x64, 0x2f,
	0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2f, 0x69, 0x6e, 0x6e, 0x65, 0x72, 0x2f, 0x70, 0x61, 0x72, 0x61,
	0x6d, 0x73, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_inner_params_dc_gdc_proto_rawDescOnce sync.Once
	file_inner_params_dc_gdc_proto_rawDescData = file_inner_params_dc_gdc_proto_rawDesc
)

func file_inner_params_dc_gdc_proto_rawDescGZIP() []byte {
	file_inner_params_dc_gdc_proto_rawDescOnce.Do(func() {
		file_inner_params_dc_gdc_proto_rawDescData = protoimpl.X.CompressGZIP(file_inner_params_dc_gdc_proto_rawDescData)
	})
	return file_inner_params_dc_gdc_proto_rawDescData
}

var file_inner_params_dc_gdc_proto_msgTypes = make([]protoimpl.MessageInfo, 2)
var file_inner_params_dc_gdc_proto_goTypes = []interface{}{
	(*DcGdcParam)(nil),                         // 0: inner.params.DcGdcParam
	(*DcGdcResult)(nil),                        // 1: inner.params.DcGdcResult
	(*types.DcGdcUpdateDeviceListParam)(nil),   // 2: inner.types.DcGdcUpdateDeviceListParam
	(*types.DcGdcStartScreenRecordParam)(nil),  // 3: inner.types.DcGdcStartScreenRecordParam
	(*types.DcGdcStopScreenRecordParam)(nil),   // 4: inner.types.DcGdcStopScreenRecordParam
	(*types.DcGdcGetSurfaceStatusParam)(nil),   // 5: inner.types.DcGdcGetSurfaceStatusParam
	(*types.DcGdcUpdateDeviceListResult)(nil),  // 6: inner.types.DcGdcUpdateDeviceListResult
	(*types.DcGdcStartScreenRecordResult)(nil), // 7: inner.types.DcGdcStartScreenRecordResult
	(*types.DcGdcStopScreenRecordResult)(nil),  // 8: inner.types.DcGdcStopScreenRecordResult
	(*types.DcGdcGetSurfaceStatusResult)(nil),  // 9: inner.types.DcGdcGetSurfaceStatusResult
}
var file_inner_params_dc_gdc_proto_depIdxs = []int32{
	2, // 0: inner.params.DcGdcParam.dc_gdc_update_devicelist_param:type_name -> inner.types.DcGdcUpdateDeviceListParam
	3, // 1: inner.params.DcGdcParam.dc_gdc_start_screen_record_param:type_name -> inner.types.DcGdcStartScreenRecordParam
	4, // 2: inner.params.DcGdcParam.dc_gdc_stop_screen_record_param:type_name -> inner.types.DcGdcStopScreenRecordParam
	5, // 3: inner.params.DcGdcParam.dc_gdc_get_surface_status_param:type_name -> inner.types.DcGdcGetSurfaceStatusParam
	6, // 4: inner.params.DcGdcResult.dc_gdc_update_devicelist_result:type_name -> inner.types.DcGdcUpdateDeviceListResult
	7, // 5: inner.params.DcGdcResult.dc_gdc_start_screen_record_result:type_name -> inner.types.DcGdcStartScreenRecordResult
	8, // 6: inner.params.DcGdcResult.dc_gdc_stop_screen_record_result:type_name -> inner.types.DcGdcStopScreenRecordResult
	9, // 7: inner.params.DcGdcResult.dc_gdc_get_surface_status_result:type_name -> inner.types.DcGdcGetSurfaceStatusResult
	8, // [8:8] is the sub-list for method output_type
	8, // [8:8] is the sub-list for method input_type
	8, // [8:8] is the sub-list for extension type_name
	8, // [8:8] is the sub-list for extension extendee
	0, // [0:8] is the sub-list for field type_name
}

func init() { file_inner_params_dc_gdc_proto_init() }
func file_inner_params_dc_gdc_proto_init() {
	if File_inner_params_dc_gdc_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_inner_params_dc_gdc_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DcGdcParam); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_inner_params_dc_gdc_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DcGdcResult); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	file_inner_params_dc_gdc_proto_msgTypes[0].OneofWrappers = []interface{}{
		(*DcGdcParam_DcGdcUpdateDevicelistParam)(nil),
		(*DcGdcParam_DcGdcStartScreenRecordParam)(nil),
		(*DcGdcParam_DcGdcStopScreenRecordParam)(nil),
		(*DcGdcParam_DcGdcGetSurfaceStatusParam)(nil),
	}
	file_inner_params_dc_gdc_proto_msgTypes[1].OneofWrappers = []interface{}{
		(*DcGdcResult_DcGdcUpdateDevicelistResult)(nil),
		(*DcGdcResult_DcGdcStartScreenRecordResult)(nil),
		(*DcGdcResult_DcGdcStopScreenRecordResult)(nil),
		(*DcGdcResult_DcGdcGetSurfaceStatusResult)(nil),
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_inner_params_dc_gdc_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   2,
			NumExtensions: 0,
			NumServices:   0,
		},
		GoTypes:           file_inner_params_dc_gdc_proto_goTypes,
		DependencyIndexes: file_inner_params_dc_gdc_proto_depIdxs,
		MessageInfos:      file_inner_params_dc_gdc_proto_msgTypes,
	}.Build()
	File_inner_params_dc_gdc_proto = out.File
	file_inner_params_dc_gdc_proto_rawDesc = nil
	file_inner_params_dc_gdc_proto_goTypes = nil
	file_inner_params_dc_gdc_proto_depIdxs = nil
}
