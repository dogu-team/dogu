// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.28.1
// 	protoc        v3.21.7
// source: inner/types/dc_ida.proto

package types

import (
	outer "go-device-controller/types/protocol/generated/proto/outer"
	profile "go-device-controller/types/protocol/generated/proto/outer/profile"
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

type DcIdaRunAppParam struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	AppPath           string   `protobuf:"bytes,1,opt,name=app_path,json=appPath,proto3" json:"app_path,omitempty"`
	InstalledAppNames []string `protobuf:"bytes,2,rep,name=installed_app_names,json=installedAppNames,proto3" json:"installed_app_names,omitempty"`
	BundleId          string   `protobuf:"bytes,3,opt,name=bundle_id,json=bundleId,proto3" json:"bundle_id,omitempty"`
}

func (x *DcIdaRunAppParam) Reset() {
	*x = DcIdaRunAppParam{}
	if protoimpl.UnsafeEnabled {
		mi := &file_inner_types_dc_ida_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DcIdaRunAppParam) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DcIdaRunAppParam) ProtoMessage() {}

func (x *DcIdaRunAppParam) ProtoReflect() protoreflect.Message {
	mi := &file_inner_types_dc_ida_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DcIdaRunAppParam.ProtoReflect.Descriptor instead.
func (*DcIdaRunAppParam) Descriptor() ([]byte, []int) {
	return file_inner_types_dc_ida_proto_rawDescGZIP(), []int{0}
}

func (x *DcIdaRunAppParam) GetAppPath() string {
	if x != nil {
		return x.AppPath
	}
	return ""
}

func (x *DcIdaRunAppParam) GetInstalledAppNames() []string {
	if x != nil {
		return x.InstalledAppNames
	}
	return nil
}

func (x *DcIdaRunAppParam) GetBundleId() string {
	if x != nil {
		return x.BundleId
	}
	return ""
}

type DcIdaRunAppResult struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Error *outer.ErrorResult `protobuf:"bytes,1,opt,name=error,proto3" json:"error,omitempty"`
}

func (x *DcIdaRunAppResult) Reset() {
	*x = DcIdaRunAppResult{}
	if protoimpl.UnsafeEnabled {
		mi := &file_inner_types_dc_ida_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DcIdaRunAppResult) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DcIdaRunAppResult) ProtoMessage() {}

func (x *DcIdaRunAppResult) ProtoReflect() protoreflect.Message {
	mi := &file_inner_types_dc_ida_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DcIdaRunAppResult.ProtoReflect.Descriptor instead.
func (*DcIdaRunAppResult) Descriptor() ([]byte, []int) {
	return file_inner_types_dc_ida_proto_rawDescGZIP(), []int{1}
}

func (x *DcIdaRunAppResult) GetError() *outer.ErrorResult {
	if x != nil {
		return x.Error
	}
	return nil
}

type DcIdaGetSystemInfoParam struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields
}

func (x *DcIdaGetSystemInfoParam) Reset() {
	*x = DcIdaGetSystemInfoParam{}
	if protoimpl.UnsafeEnabled {
		mi := &file_inner_types_dc_ida_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DcIdaGetSystemInfoParam) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DcIdaGetSystemInfoParam) ProtoMessage() {}

func (x *DcIdaGetSystemInfoParam) ProtoReflect() protoreflect.Message {
	mi := &file_inner_types_dc_ida_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DcIdaGetSystemInfoParam.ProtoReflect.Descriptor instead.
func (*DcIdaGetSystemInfoParam) Descriptor() ([]byte, []int) {
	return file_inner_types_dc_ida_proto_rawDescGZIP(), []int{2}
}

type DcIdaGetSystemInfoResult struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	ScreenWidth  uint32 `protobuf:"varint,1,opt,name=screen_width,json=screenWidth,proto3" json:"screen_width,omitempty"`
	ScreenHeight uint32 `protobuf:"varint,2,opt,name=screen_height,json=screenHeight,proto3" json:"screen_height,omitempty"`
}

func (x *DcIdaGetSystemInfoResult) Reset() {
	*x = DcIdaGetSystemInfoResult{}
	if protoimpl.UnsafeEnabled {
		mi := &file_inner_types_dc_ida_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DcIdaGetSystemInfoResult) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DcIdaGetSystemInfoResult) ProtoMessage() {}

func (x *DcIdaGetSystemInfoResult) ProtoReflect() protoreflect.Message {
	mi := &file_inner_types_dc_ida_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DcIdaGetSystemInfoResult.ProtoReflect.Descriptor instead.
func (*DcIdaGetSystemInfoResult) Descriptor() ([]byte, []int) {
	return file_inner_types_dc_ida_proto_rawDescGZIP(), []int{3}
}

func (x *DcIdaGetSystemInfoResult) GetScreenWidth() uint32 {
	if x != nil {
		return x.ScreenWidth
	}
	return 0
}

func (x *DcIdaGetSystemInfoResult) GetScreenHeight() uint32 {
	if x != nil {
		return x.ScreenHeight
	}
	return 0
}

type DcIdaIsPortListeningParam struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Port uint32 `protobuf:"varint,1,opt,name=port,proto3" json:"port,omitempty"`
}

func (x *DcIdaIsPortListeningParam) Reset() {
	*x = DcIdaIsPortListeningParam{}
	if protoimpl.UnsafeEnabled {
		mi := &file_inner_types_dc_ida_proto_msgTypes[4]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DcIdaIsPortListeningParam) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DcIdaIsPortListeningParam) ProtoMessage() {}

func (x *DcIdaIsPortListeningParam) ProtoReflect() protoreflect.Message {
	mi := &file_inner_types_dc_ida_proto_msgTypes[4]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DcIdaIsPortListeningParam.ProtoReflect.Descriptor instead.
func (*DcIdaIsPortListeningParam) Descriptor() ([]byte, []int) {
	return file_inner_types_dc_ida_proto_rawDescGZIP(), []int{4}
}

func (x *DcIdaIsPortListeningParam) GetPort() uint32 {
	if x != nil {
		return x.Port
	}
	return 0
}

type DcIdaIsPortListeningResult struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	IsListening bool `protobuf:"varint,1,opt,name=is_listening,json=isListening,proto3" json:"is_listening,omitempty"`
}

func (x *DcIdaIsPortListeningResult) Reset() {
	*x = DcIdaIsPortListeningResult{}
	if protoimpl.UnsafeEnabled {
		mi := &file_inner_types_dc_ida_proto_msgTypes[5]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DcIdaIsPortListeningResult) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DcIdaIsPortListeningResult) ProtoMessage() {}

func (x *DcIdaIsPortListeningResult) ProtoReflect() protoreflect.Message {
	mi := &file_inner_types_dc_ida_proto_msgTypes[5]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DcIdaIsPortListeningResult.ProtoReflect.Descriptor instead.
func (*DcIdaIsPortListeningResult) Descriptor() ([]byte, []int) {
	return file_inner_types_dc_ida_proto_rawDescGZIP(), []int{5}
}

func (x *DcIdaIsPortListeningResult) GetIsListening() bool {
	if x != nil {
		return x.IsListening
	}
	return false
}

type DcIdaQueryProfileParam struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	ProfileMethods []*profile.ProfileMethod `protobuf:"bytes,1,rep,name=profile_methods,json=profileMethods,proto3" json:"profile_methods,omitempty"`
}

func (x *DcIdaQueryProfileParam) Reset() {
	*x = DcIdaQueryProfileParam{}
	if protoimpl.UnsafeEnabled {
		mi := &file_inner_types_dc_ida_proto_msgTypes[6]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DcIdaQueryProfileParam) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DcIdaQueryProfileParam) ProtoMessage() {}

func (x *DcIdaQueryProfileParam) ProtoReflect() protoreflect.Message {
	mi := &file_inner_types_dc_ida_proto_msgTypes[6]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DcIdaQueryProfileParam.ProtoReflect.Descriptor instead.
func (*DcIdaQueryProfileParam) Descriptor() ([]byte, []int) {
	return file_inner_types_dc_ida_proto_rawDescGZIP(), []int{6}
}

func (x *DcIdaQueryProfileParam) GetProfileMethods() []*profile.ProfileMethod {
	if x != nil {
		return x.ProfileMethods
	}
	return nil
}

type DcIdaQueryProfileResult struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Info *profile.RuntimeInfo `protobuf:"bytes,1,opt,name=info,proto3" json:"info,omitempty"`
}

func (x *DcIdaQueryProfileResult) Reset() {
	*x = DcIdaQueryProfileResult{}
	if protoimpl.UnsafeEnabled {
		mi := &file_inner_types_dc_ida_proto_msgTypes[7]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DcIdaQueryProfileResult) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DcIdaQueryProfileResult) ProtoMessage() {}

func (x *DcIdaQueryProfileResult) ProtoReflect() protoreflect.Message {
	mi := &file_inner_types_dc_ida_proto_msgTypes[7]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DcIdaQueryProfileResult.ProtoReflect.Descriptor instead.
func (*DcIdaQueryProfileResult) Descriptor() ([]byte, []int) {
	return file_inner_types_dc_ida_proto_rawDescGZIP(), []int{7}
}

func (x *DcIdaQueryProfileResult) GetInfo() *profile.RuntimeInfo {
	if x != nil {
		return x.Info
	}
	return nil
}

type DcIdaSwitchInputBlockParam struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	IsBlock bool `protobuf:"varint,1,opt,name=is_block,json=isBlock,proto3" json:"is_block,omitempty"`
}

func (x *DcIdaSwitchInputBlockParam) Reset() {
	*x = DcIdaSwitchInputBlockParam{}
	if protoimpl.UnsafeEnabled {
		mi := &file_inner_types_dc_ida_proto_msgTypes[8]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DcIdaSwitchInputBlockParam) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DcIdaSwitchInputBlockParam) ProtoMessage() {}

func (x *DcIdaSwitchInputBlockParam) ProtoReflect() protoreflect.Message {
	mi := &file_inner_types_dc_ida_proto_msgTypes[8]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DcIdaSwitchInputBlockParam.ProtoReflect.Descriptor instead.
func (*DcIdaSwitchInputBlockParam) Descriptor() ([]byte, []int) {
	return file_inner_types_dc_ida_proto_rawDescGZIP(), []int{8}
}

func (x *DcIdaSwitchInputBlockParam) GetIsBlock() bool {
	if x != nil {
		return x.IsBlock
	}
	return false
}

type DcIdaSwitchInputBlockResult struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields
}

func (x *DcIdaSwitchInputBlockResult) Reset() {
	*x = DcIdaSwitchInputBlockResult{}
	if protoimpl.UnsafeEnabled {
		mi := &file_inner_types_dc_ida_proto_msgTypes[9]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DcIdaSwitchInputBlockResult) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DcIdaSwitchInputBlockResult) ProtoMessage() {}

func (x *DcIdaSwitchInputBlockResult) ProtoReflect() protoreflect.Message {
	mi := &file_inner_types_dc_ida_proto_msgTypes[9]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DcIdaSwitchInputBlockResult.ProtoReflect.Descriptor instead.
func (*DcIdaSwitchInputBlockResult) Descriptor() ([]byte, []int) {
	return file_inner_types_dc_ida_proto_rawDescGZIP(), []int{9}
}

type DcIdaSubscribeAlertParam struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields
}

func (x *DcIdaSubscribeAlertParam) Reset() {
	*x = DcIdaSubscribeAlertParam{}
	if protoimpl.UnsafeEnabled {
		mi := &file_inner_types_dc_ida_proto_msgTypes[10]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DcIdaSubscribeAlertParam) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DcIdaSubscribeAlertParam) ProtoMessage() {}

func (x *DcIdaSubscribeAlertParam) ProtoReflect() protoreflect.Message {
	mi := &file_inner_types_dc_ida_proto_msgTypes[10]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DcIdaSubscribeAlertParam.ProtoReflect.Descriptor instead.
func (*DcIdaSubscribeAlertParam) Descriptor() ([]byte, []int) {
	return file_inner_types_dc_ida_proto_rawDescGZIP(), []int{10}
}

type DcIdaSubscribeAlertResult struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields
}

func (x *DcIdaSubscribeAlertResult) Reset() {
	*x = DcIdaSubscribeAlertResult{}
	if protoimpl.UnsafeEnabled {
		mi := &file_inner_types_dc_ida_proto_msgTypes[11]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DcIdaSubscribeAlertResult) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DcIdaSubscribeAlertResult) ProtoMessage() {}

func (x *DcIdaSubscribeAlertResult) ProtoReflect() protoreflect.Message {
	mi := &file_inner_types_dc_ida_proto_msgTypes[11]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DcIdaSubscribeAlertResult.ProtoReflect.Descriptor instead.
func (*DcIdaSubscribeAlertResult) Descriptor() ([]byte, []int) {
	return file_inner_types_dc_ida_proto_rawDescGZIP(), []int{11}
}

var File_inner_types_dc_ida_proto protoreflect.FileDescriptor

var file_inner_types_dc_ida_proto_rawDesc = []byte{
	0x0a, 0x18, 0x69, 0x6e, 0x6e, 0x65, 0x72, 0x2f, 0x74, 0x79, 0x70, 0x65, 0x73, 0x2f, 0x64, 0x63,
	0x5f, 0x69, 0x64, 0x61, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12, 0x0b, 0x69, 0x6e, 0x6e, 0x65,
	0x72, 0x2e, 0x74, 0x79, 0x70, 0x65, 0x73, 0x1a, 0x12, 0x6f, 0x75, 0x74, 0x65, 0x72, 0x2f, 0x65,
	0x72, 0x72, 0x6f, 0x72, 0x73, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x1a, 0x22, 0x6f, 0x75, 0x74,
	0x65, 0x72, 0x2f, 0x70, 0x72, 0x6f, 0x66, 0x69, 0x6c, 0x65, 0x2f, 0x70, 0x72, 0x6f, 0x66, 0x69,
	0x6c, 0x65, 0x5f, 0x6d, 0x65, 0x74, 0x68, 0x6f, 0x64, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x1a,
	0x20, 0x6f, 0x75, 0x74, 0x65, 0x72, 0x2f, 0x70, 0x72, 0x6f, 0x66, 0x69, 0x6c, 0x65, 0x2f, 0x72,
	0x75, 0x6e, 0x74, 0x69, 0x6d, 0x65, 0x5f, 0x69, 0x6e, 0x66, 0x6f, 0x2e, 0x70, 0x72, 0x6f, 0x74,
	0x6f, 0x22, 0x7a, 0x0a, 0x10, 0x44, 0x63, 0x49, 0x64, 0x61, 0x52, 0x75, 0x6e, 0x41, 0x70, 0x70,
	0x50, 0x61, 0x72, 0x61, 0x6d, 0x12, 0x19, 0x0a, 0x08, 0x61, 0x70, 0x70, 0x5f, 0x70, 0x61, 0x74,
	0x68, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x07, 0x61, 0x70, 0x70, 0x50, 0x61, 0x74, 0x68,
	0x12, 0x2e, 0x0a, 0x13, 0x69, 0x6e, 0x73, 0x74, 0x61, 0x6c, 0x6c, 0x65, 0x64, 0x5f, 0x61, 0x70,
	0x70, 0x5f, 0x6e, 0x61, 0x6d, 0x65, 0x73, 0x18, 0x02, 0x20, 0x03, 0x28, 0x09, 0x52, 0x11, 0x69,
	0x6e, 0x73, 0x74, 0x61, 0x6c, 0x6c, 0x65, 0x64, 0x41, 0x70, 0x70, 0x4e, 0x61, 0x6d, 0x65, 0x73,
	0x12, 0x1b, 0x0a, 0x09, 0x62, 0x75, 0x6e, 0x64, 0x6c, 0x65, 0x5f, 0x69, 0x64, 0x18, 0x03, 0x20,
	0x01, 0x28, 0x09, 0x52, 0x08, 0x62, 0x75, 0x6e, 0x64, 0x6c, 0x65, 0x49, 0x64, 0x22, 0x3d, 0x0a,
	0x11, 0x44, 0x63, 0x49, 0x64, 0x61, 0x52, 0x75, 0x6e, 0x41, 0x70, 0x70, 0x52, 0x65, 0x73, 0x75,
	0x6c, 0x74, 0x12, 0x28, 0x0a, 0x05, 0x65, 0x72, 0x72, 0x6f, 0x72, 0x18, 0x01, 0x20, 0x01, 0x28,
	0x0b, 0x32, 0x12, 0x2e, 0x6f, 0x75, 0x74, 0x65, 0x72, 0x2e, 0x45, 0x72, 0x72, 0x6f, 0x72, 0x52,
	0x65, 0x73, 0x75, 0x6c, 0x74, 0x52, 0x05, 0x65, 0x72, 0x72, 0x6f, 0x72, 0x22, 0x19, 0x0a, 0x17,
	0x44, 0x63, 0x49, 0x64, 0x61, 0x47, 0x65, 0x74, 0x53, 0x79, 0x73, 0x74, 0x65, 0x6d, 0x49, 0x6e,
	0x66, 0x6f, 0x50, 0x61, 0x72, 0x61, 0x6d, 0x22, 0x62, 0x0a, 0x18, 0x44, 0x63, 0x49, 0x64, 0x61,
	0x47, 0x65, 0x74, 0x53, 0x79, 0x73, 0x74, 0x65, 0x6d, 0x49, 0x6e, 0x66, 0x6f, 0x52, 0x65, 0x73,
	0x75, 0x6c, 0x74, 0x12, 0x21, 0x0a, 0x0c, 0x73, 0x63, 0x72, 0x65, 0x65, 0x6e, 0x5f, 0x77, 0x69,
	0x64, 0x74, 0x68, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0d, 0x52, 0x0b, 0x73, 0x63, 0x72, 0x65, 0x65,
	0x6e, 0x57, 0x69, 0x64, 0x74, 0x68, 0x12, 0x23, 0x0a, 0x0d, 0x73, 0x63, 0x72, 0x65, 0x65, 0x6e,
	0x5f, 0x68, 0x65, 0x69, 0x67, 0x68, 0x74, 0x18, 0x02, 0x20, 0x01, 0x28, 0x0d, 0x52, 0x0c, 0x73,
	0x63, 0x72, 0x65, 0x65, 0x6e, 0x48, 0x65, 0x69, 0x67, 0x68, 0x74, 0x22, 0x2f, 0x0a, 0x19, 0x44,
	0x63, 0x49, 0x64, 0x61, 0x49, 0x73, 0x50, 0x6f, 0x72, 0x74, 0x4c, 0x69, 0x73, 0x74, 0x65, 0x6e,
	0x69, 0x6e, 0x67, 0x50, 0x61, 0x72, 0x61, 0x6d, 0x12, 0x12, 0x0a, 0x04, 0x70, 0x6f, 0x72, 0x74,
	0x18, 0x01, 0x20, 0x01, 0x28, 0x0d, 0x52, 0x04, 0x70, 0x6f, 0x72, 0x74, 0x22, 0x3f, 0x0a, 0x1a,
	0x44, 0x63, 0x49, 0x64, 0x61, 0x49, 0x73, 0x50, 0x6f, 0x72, 0x74, 0x4c, 0x69, 0x73, 0x74, 0x65,
	0x6e, 0x69, 0x6e, 0x67, 0x52, 0x65, 0x73, 0x75, 0x6c, 0x74, 0x12, 0x21, 0x0a, 0x0c, 0x69, 0x73,
	0x5f, 0x6c, 0x69, 0x73, 0x74, 0x65, 0x6e, 0x69, 0x6e, 0x67, 0x18, 0x01, 0x20, 0x01, 0x28, 0x08,
	0x52, 0x0b, 0x69, 0x73, 0x4c, 0x69, 0x73, 0x74, 0x65, 0x6e, 0x69, 0x6e, 0x67, 0x22, 0x5f, 0x0a,
	0x16, 0x44, 0x63, 0x49, 0x64, 0x61, 0x51, 0x75, 0x65, 0x72, 0x79, 0x50, 0x72, 0x6f, 0x66, 0x69,
	0x6c, 0x65, 0x50, 0x61, 0x72, 0x61, 0x6d, 0x12, 0x45, 0x0a, 0x0f, 0x70, 0x72, 0x6f, 0x66, 0x69,
	0x6c, 0x65, 0x5f, 0x6d, 0x65, 0x74, 0x68, 0x6f, 0x64, 0x73, 0x18, 0x01, 0x20, 0x03, 0x28, 0x0b,
	0x32, 0x1c, 0x2e, 0x6f, 0x75, 0x74, 0x65, 0x72, 0x2e, 0x70, 0x72, 0x6f, 0x66, 0x69, 0x6c, 0x65,
	0x2e, 0x50, 0x72, 0x6f, 0x66, 0x69, 0x6c, 0x65, 0x4d, 0x65, 0x74, 0x68, 0x6f, 0x64, 0x52, 0x0e,
	0x70, 0x72, 0x6f, 0x66, 0x69, 0x6c, 0x65, 0x4d, 0x65, 0x74, 0x68, 0x6f, 0x64, 0x73, 0x22, 0x49,
	0x0a, 0x17, 0x44, 0x63, 0x49, 0x64, 0x61, 0x51, 0x75, 0x65, 0x72, 0x79, 0x50, 0x72, 0x6f, 0x66,
	0x69, 0x6c, 0x65, 0x52, 0x65, 0x73, 0x75, 0x6c, 0x74, 0x12, 0x2e, 0x0a, 0x04, 0x69, 0x6e, 0x66,
	0x6f, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x1a, 0x2e, 0x6f, 0x75, 0x74, 0x65, 0x72, 0x2e,
	0x70, 0x72, 0x6f, 0x66, 0x69, 0x6c, 0x65, 0x2e, 0x52, 0x75, 0x6e, 0x74, 0x69, 0x6d, 0x65, 0x49,
	0x6e, 0x66, 0x6f, 0x52, 0x04, 0x69, 0x6e, 0x66, 0x6f, 0x22, 0x37, 0x0a, 0x1a, 0x44, 0x63, 0x49,
	0x64, 0x61, 0x53, 0x77, 0x69, 0x74, 0x63, 0x68, 0x49, 0x6e, 0x70, 0x75, 0x74, 0x42, 0x6c, 0x6f,
	0x63, 0x6b, 0x50, 0x61, 0x72, 0x61, 0x6d, 0x12, 0x19, 0x0a, 0x08, 0x69, 0x73, 0x5f, 0x62, 0x6c,
	0x6f, 0x63, 0x6b, 0x18, 0x01, 0x20, 0x01, 0x28, 0x08, 0x52, 0x07, 0x69, 0x73, 0x42, 0x6c, 0x6f,
	0x63, 0x6b, 0x22, 0x1d, 0x0a, 0x1b, 0x44, 0x63, 0x49, 0x64, 0x61, 0x53, 0x77, 0x69, 0x74, 0x63,
	0x68, 0x49, 0x6e, 0x70, 0x75, 0x74, 0x42, 0x6c, 0x6f, 0x63, 0x6b, 0x52, 0x65, 0x73, 0x75, 0x6c,
	0x74, 0x22, 0x1a, 0x0a, 0x18, 0x44, 0x63, 0x49, 0x64, 0x61, 0x53, 0x75, 0x62, 0x73, 0x63, 0x72,
	0x69, 0x62, 0x65, 0x41, 0x6c, 0x65, 0x72, 0x74, 0x50, 0x61, 0x72, 0x61, 0x6d, 0x22, 0x1b, 0x0a,
	0x19, 0x44, 0x63, 0x49, 0x64, 0x61, 0x53, 0x75, 0x62, 0x73, 0x63, 0x72, 0x69, 0x62, 0x65, 0x41,
	0x6c, 0x65, 0x72, 0x74, 0x52, 0x65, 0x73, 0x75, 0x6c, 0x74, 0x42, 0x6a, 0x0a, 0x27, 0x63, 0x6f,
	0x6d, 0x2e, 0x64, 0x6f, 0x67, 0x75, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x63, 0x6f, 0x6c, 0x2e,
	0x67, 0x65, 0x6e, 0x65, 0x72, 0x61, 0x74, 0x65, 0x64, 0x2e, 0x69, 0x6e, 0x6e, 0x65, 0x72, 0x2e,
	0x74, 0x79, 0x70, 0x65, 0x73, 0x5a, 0x3f, 0x67, 0x6f, 0x2d, 0x64, 0x65, 0x76, 0x69, 0x63, 0x65,
	0x2d, 0x63, 0x6f, 0x6e, 0x74, 0x72, 0x6f, 0x6c, 0x6c, 0x65, 0x72, 0x2f, 0x74, 0x79, 0x70, 0x65,
	0x73, 0x2f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x63, 0x6f, 0x6c, 0x2f, 0x67, 0x65, 0x6e, 0x65, 0x72,
	0x61, 0x74, 0x65, 0x64, 0x2f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2f, 0x69, 0x6e, 0x6e, 0x65, 0x72,
	0x2f, 0x74, 0x79, 0x70, 0x65, 0x73, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_inner_types_dc_ida_proto_rawDescOnce sync.Once
	file_inner_types_dc_ida_proto_rawDescData = file_inner_types_dc_ida_proto_rawDesc
)

func file_inner_types_dc_ida_proto_rawDescGZIP() []byte {
	file_inner_types_dc_ida_proto_rawDescOnce.Do(func() {
		file_inner_types_dc_ida_proto_rawDescData = protoimpl.X.CompressGZIP(file_inner_types_dc_ida_proto_rawDescData)
	})
	return file_inner_types_dc_ida_proto_rawDescData
}

var file_inner_types_dc_ida_proto_msgTypes = make([]protoimpl.MessageInfo, 12)
var file_inner_types_dc_ida_proto_goTypes = []interface{}{
	(*DcIdaRunAppParam)(nil),            // 0: inner.types.DcIdaRunAppParam
	(*DcIdaRunAppResult)(nil),           // 1: inner.types.DcIdaRunAppResult
	(*DcIdaGetSystemInfoParam)(nil),     // 2: inner.types.DcIdaGetSystemInfoParam
	(*DcIdaGetSystemInfoResult)(nil),    // 3: inner.types.DcIdaGetSystemInfoResult
	(*DcIdaIsPortListeningParam)(nil),   // 4: inner.types.DcIdaIsPortListeningParam
	(*DcIdaIsPortListeningResult)(nil),  // 5: inner.types.DcIdaIsPortListeningResult
	(*DcIdaQueryProfileParam)(nil),      // 6: inner.types.DcIdaQueryProfileParam
	(*DcIdaQueryProfileResult)(nil),     // 7: inner.types.DcIdaQueryProfileResult
	(*DcIdaSwitchInputBlockParam)(nil),  // 8: inner.types.DcIdaSwitchInputBlockParam
	(*DcIdaSwitchInputBlockResult)(nil), // 9: inner.types.DcIdaSwitchInputBlockResult
	(*DcIdaSubscribeAlertParam)(nil),    // 10: inner.types.DcIdaSubscribeAlertParam
	(*DcIdaSubscribeAlertResult)(nil),   // 11: inner.types.DcIdaSubscribeAlertResult
	(*outer.ErrorResult)(nil),           // 12: outer.ErrorResult
	(*profile.ProfileMethod)(nil),       // 13: outer.profile.ProfileMethod
	(*profile.RuntimeInfo)(nil),         // 14: outer.profile.RuntimeInfo
}
var file_inner_types_dc_ida_proto_depIdxs = []int32{
	12, // 0: inner.types.DcIdaRunAppResult.error:type_name -> outer.ErrorResult
	13, // 1: inner.types.DcIdaQueryProfileParam.profile_methods:type_name -> outer.profile.ProfileMethod
	14, // 2: inner.types.DcIdaQueryProfileResult.info:type_name -> outer.profile.RuntimeInfo
	3,  // [3:3] is the sub-list for method output_type
	3,  // [3:3] is the sub-list for method input_type
	3,  // [3:3] is the sub-list for extension type_name
	3,  // [3:3] is the sub-list for extension extendee
	0,  // [0:3] is the sub-list for field type_name
}

func init() { file_inner_types_dc_ida_proto_init() }
func file_inner_types_dc_ida_proto_init() {
	if File_inner_types_dc_ida_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_inner_types_dc_ida_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DcIdaRunAppParam); i {
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
		file_inner_types_dc_ida_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DcIdaRunAppResult); i {
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
		file_inner_types_dc_ida_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DcIdaGetSystemInfoParam); i {
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
		file_inner_types_dc_ida_proto_msgTypes[3].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DcIdaGetSystemInfoResult); i {
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
		file_inner_types_dc_ida_proto_msgTypes[4].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DcIdaIsPortListeningParam); i {
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
		file_inner_types_dc_ida_proto_msgTypes[5].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DcIdaIsPortListeningResult); i {
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
		file_inner_types_dc_ida_proto_msgTypes[6].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DcIdaQueryProfileParam); i {
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
		file_inner_types_dc_ida_proto_msgTypes[7].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DcIdaQueryProfileResult); i {
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
		file_inner_types_dc_ida_proto_msgTypes[8].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DcIdaSwitchInputBlockParam); i {
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
		file_inner_types_dc_ida_proto_msgTypes[9].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DcIdaSwitchInputBlockResult); i {
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
		file_inner_types_dc_ida_proto_msgTypes[10].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DcIdaSubscribeAlertParam); i {
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
		file_inner_types_dc_ida_proto_msgTypes[11].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DcIdaSubscribeAlertResult); i {
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
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_inner_types_dc_ida_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   12,
			NumExtensions: 0,
			NumServices:   0,
		},
		GoTypes:           file_inner_types_dc_ida_proto_goTypes,
		DependencyIndexes: file_inner_types_dc_ida_proto_depIdxs,
		MessageInfos:      file_inner_types_dc_ida_proto_msgTypes,
	}.Build()
	File_inner_types_dc_ida_proto = out.File
	file_inner_types_dc_ida_proto_rawDesc = nil
	file_inner_types_dc_ida_proto_goTypes = nil
	file_inner_types_dc_ida_proto_depIdxs = nil
}
