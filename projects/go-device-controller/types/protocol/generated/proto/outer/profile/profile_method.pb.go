// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.28.1
// 	protoc        v3.21.7
// source: outer/profile/profile_method.proto

package profile

import (
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

type ProfileMethodKind int32

const (
	ProfileMethodKind_PROFILE_METHOD_KIND_UNSPECIFIED                     ProfileMethodKind = 0
	ProfileMethodKind_PROFILE_METHOD_KIND_DESKTOP_CPU                     ProfileMethodKind = 1
	ProfileMethodKind_PROFILE_METHOD_KIND_DESKTOP_CPUFREQ                 ProfileMethodKind = 10
	ProfileMethodKind_PROFILE_METHOD_KIND_DESKTOP_GPU                     ProfileMethodKind = 20
	ProfileMethodKind_PROFILE_METHOD_KIND_DESKTOP_MEM                     ProfileMethodKind = 30
	ProfileMethodKind_PROFILE_METHOD_KIND_DESKTOP_FS                      ProfileMethodKind = 40
	ProfileMethodKind_PROFILE_METHOD_KIND_DESKTOP_NET                     ProfileMethodKind = 50
	ProfileMethodKind_PROFILE_METHOD_KIND_DESKTOP_DISPLAY                 ProfileMethodKind = 60
	ProfileMethodKind_PROFILE_METHOD_KIND_ANDROID_CPU_SHELLTOP            ProfileMethodKind = 1001
	ProfileMethodKind_PROFILE_METHOD_KIND_ANDROID_CPUFREQ_CAT             ProfileMethodKind = 1010
	ProfileMethodKind_PROFILE_METHOD_KIND_ANDROID_GPU_NOTYET              ProfileMethodKind = 1020
	ProfileMethodKind_PROFILE_METHOD_KIND_ANDROID_MEM_ACTIVITYMANAGER     ProfileMethodKind = 1030
	ProfileMethodKind_PROFILE_METHOD_KIND_ANDROID_MEM_PROCMEMINFO         ProfileMethodKind = 1031
	ProfileMethodKind_PROFILE_METHOD_KIND_ANDROID_FS_PROCDISKSTATS        ProfileMethodKind = 1040
	ProfileMethodKind_PROFILE_METHOD_KIND_ANDROID_NET_TRAFFICSTATS        ProfileMethodKind = 1050
	ProfileMethodKind_PROFILE_METHOD_KIND_ANDROID_DISPLAY                 ProfileMethodKind = 1060
	ProfileMethodKind_PROFILE_METHOD_KIND_ANDROID_PROCESS_SHELLTOP        ProfileMethodKind = 1070
	ProfileMethodKind_PROFILE_METHOD_KIND_ANDROID_BLOCK_DEVELOPER_OPTIONS ProfileMethodKind = 1080
	ProfileMethodKind_PROFILE_METHOD_KIND_IOS_CPU_LOAD_INFO               ProfileMethodKind = 2001
	ProfileMethodKind_PROFILE_METHOD_KIND_IOS_MEM_VM_STATISTICS           ProfileMethodKind = 2030
	ProfileMethodKind_PROFILE_METHOD_KIND_IOS_DISPLAY                     ProfileMethodKind = 2060
)

// Enum value maps for ProfileMethodKind.
var (
	ProfileMethodKind_name = map[int32]string{
		0:    "PROFILE_METHOD_KIND_UNSPECIFIED",
		1:    "PROFILE_METHOD_KIND_DESKTOP_CPU",
		10:   "PROFILE_METHOD_KIND_DESKTOP_CPUFREQ",
		20:   "PROFILE_METHOD_KIND_DESKTOP_GPU",
		30:   "PROFILE_METHOD_KIND_DESKTOP_MEM",
		40:   "PROFILE_METHOD_KIND_DESKTOP_FS",
		50:   "PROFILE_METHOD_KIND_DESKTOP_NET",
		60:   "PROFILE_METHOD_KIND_DESKTOP_DISPLAY",
		1001: "PROFILE_METHOD_KIND_ANDROID_CPU_SHELLTOP",
		1010: "PROFILE_METHOD_KIND_ANDROID_CPUFREQ_CAT",
		1020: "PROFILE_METHOD_KIND_ANDROID_GPU_NOTYET",
		1030: "PROFILE_METHOD_KIND_ANDROID_MEM_ACTIVITYMANAGER",
		1031: "PROFILE_METHOD_KIND_ANDROID_MEM_PROCMEMINFO",
		1040: "PROFILE_METHOD_KIND_ANDROID_FS_PROCDISKSTATS",
		1050: "PROFILE_METHOD_KIND_ANDROID_NET_TRAFFICSTATS",
		1060: "PROFILE_METHOD_KIND_ANDROID_DISPLAY",
		1070: "PROFILE_METHOD_KIND_ANDROID_PROCESS_SHELLTOP",
		1080: "PROFILE_METHOD_KIND_ANDROID_BLOCK_DEVELOPER_OPTIONS",
		2001: "PROFILE_METHOD_KIND_IOS_CPU_LOAD_INFO",
		2030: "PROFILE_METHOD_KIND_IOS_MEM_VM_STATISTICS",
		2060: "PROFILE_METHOD_KIND_IOS_DISPLAY",
	}
	ProfileMethodKind_value = map[string]int32{
		"PROFILE_METHOD_KIND_UNSPECIFIED":                     0,
		"PROFILE_METHOD_KIND_DESKTOP_CPU":                     1,
		"PROFILE_METHOD_KIND_DESKTOP_CPUFREQ":                 10,
		"PROFILE_METHOD_KIND_DESKTOP_GPU":                     20,
		"PROFILE_METHOD_KIND_DESKTOP_MEM":                     30,
		"PROFILE_METHOD_KIND_DESKTOP_FS":                      40,
		"PROFILE_METHOD_KIND_DESKTOP_NET":                     50,
		"PROFILE_METHOD_KIND_DESKTOP_DISPLAY":                 60,
		"PROFILE_METHOD_KIND_ANDROID_CPU_SHELLTOP":            1001,
		"PROFILE_METHOD_KIND_ANDROID_CPUFREQ_CAT":             1010,
		"PROFILE_METHOD_KIND_ANDROID_GPU_NOTYET":              1020,
		"PROFILE_METHOD_KIND_ANDROID_MEM_ACTIVITYMANAGER":     1030,
		"PROFILE_METHOD_KIND_ANDROID_MEM_PROCMEMINFO":         1031,
		"PROFILE_METHOD_KIND_ANDROID_FS_PROCDISKSTATS":        1040,
		"PROFILE_METHOD_KIND_ANDROID_NET_TRAFFICSTATS":        1050,
		"PROFILE_METHOD_KIND_ANDROID_DISPLAY":                 1060,
		"PROFILE_METHOD_KIND_ANDROID_PROCESS_SHELLTOP":        1070,
		"PROFILE_METHOD_KIND_ANDROID_BLOCK_DEVELOPER_OPTIONS": 1080,
		"PROFILE_METHOD_KIND_IOS_CPU_LOAD_INFO":               2001,
		"PROFILE_METHOD_KIND_IOS_MEM_VM_STATISTICS":           2030,
		"PROFILE_METHOD_KIND_IOS_DISPLAY":                     2060,
	}
)

func (x ProfileMethodKind) Enum() *ProfileMethodKind {
	p := new(ProfileMethodKind)
	*p = x
	return p
}

func (x ProfileMethodKind) String() string {
	return protoimpl.X.EnumStringOf(x.Descriptor(), protoreflect.EnumNumber(x))
}

func (ProfileMethodKind) Descriptor() protoreflect.EnumDescriptor {
	return file_outer_profile_profile_method_proto_enumTypes[0].Descriptor()
}

func (ProfileMethodKind) Type() protoreflect.EnumType {
	return &file_outer_profile_profile_method_proto_enumTypes[0]
}

func (x ProfileMethodKind) Number() protoreflect.EnumNumber {
	return protoreflect.EnumNumber(x)
}

// Deprecated: Use ProfileMethodKind.Descriptor instead.
func (ProfileMethodKind) EnumDescriptor() ([]byte, []int) {
	return file_outer_profile_profile_method_proto_rawDescGZIP(), []int{0}
}

type ProfileMethod struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Kind ProfileMethodKind `protobuf:"varint,1,opt,name=kind,proto3,enum=outer.profile.ProfileMethodKind" json:"kind,omitempty"`
	Name string            `protobuf:"bytes,2,opt,name=name,proto3" json:"name,omitempty"`
}

func (x *ProfileMethod) Reset() {
	*x = ProfileMethod{}
	if protoimpl.UnsafeEnabled {
		mi := &file_outer_profile_profile_method_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ProfileMethod) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ProfileMethod) ProtoMessage() {}

func (x *ProfileMethod) ProtoReflect() protoreflect.Message {
	mi := &file_outer_profile_profile_method_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ProfileMethod.ProtoReflect.Descriptor instead.
func (*ProfileMethod) Descriptor() ([]byte, []int) {
	return file_outer_profile_profile_method_proto_rawDescGZIP(), []int{0}
}

func (x *ProfileMethod) GetKind() ProfileMethodKind {
	if x != nil {
		return x.Kind
	}
	return ProfileMethodKind_PROFILE_METHOD_KIND_UNSPECIFIED
}

func (x *ProfileMethod) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

type ProfileMethodWithConfig struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	ProfileMethod *ProfileMethod `protobuf:"bytes,1,opt,name=profile_method,json=profileMethod,proto3" json:"profile_method,omitempty"`
	PeriodSec     uint32         `protobuf:"fixed32,2,opt,name=period_sec,json=periodSec,proto3" json:"period_sec,omitempty"`
}

func (x *ProfileMethodWithConfig) Reset() {
	*x = ProfileMethodWithConfig{}
	if protoimpl.UnsafeEnabled {
		mi := &file_outer_profile_profile_method_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ProfileMethodWithConfig) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ProfileMethodWithConfig) ProtoMessage() {}

func (x *ProfileMethodWithConfig) ProtoReflect() protoreflect.Message {
	mi := &file_outer_profile_profile_method_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ProfileMethodWithConfig.ProtoReflect.Descriptor instead.
func (*ProfileMethodWithConfig) Descriptor() ([]byte, []int) {
	return file_outer_profile_profile_method_proto_rawDescGZIP(), []int{1}
}

func (x *ProfileMethodWithConfig) GetProfileMethod() *ProfileMethod {
	if x != nil {
		return x.ProfileMethod
	}
	return nil
}

func (x *ProfileMethodWithConfig) GetPeriodSec() uint32 {
	if x != nil {
		return x.PeriodSec
	}
	return 0
}

type DeviceConfig struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	ProfileMethods []*ProfileMethodWithConfig `protobuf:"bytes,1,rep,name=profile_methods,json=profileMethods,proto3" json:"profile_methods,omitempty"`
}

func (x *DeviceConfig) Reset() {
	*x = DeviceConfig{}
	if protoimpl.UnsafeEnabled {
		mi := &file_outer_profile_profile_method_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DeviceConfig) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DeviceConfig) ProtoMessage() {}

func (x *DeviceConfig) ProtoReflect() protoreflect.Message {
	mi := &file_outer_profile_profile_method_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DeviceConfig.ProtoReflect.Descriptor instead.
func (*DeviceConfig) Descriptor() ([]byte, []int) {
	return file_outer_profile_profile_method_proto_rawDescGZIP(), []int{2}
}

func (x *DeviceConfig) GetProfileMethods() []*ProfileMethodWithConfig {
	if x != nil {
		return x.ProfileMethods
	}
	return nil
}

var File_outer_profile_profile_method_proto protoreflect.FileDescriptor

var file_outer_profile_profile_method_proto_rawDesc = []byte{
	0x0a, 0x22, 0x6f, 0x75, 0x74, 0x65, 0x72, 0x2f, 0x70, 0x72, 0x6f, 0x66, 0x69, 0x6c, 0x65, 0x2f,
	0x70, 0x72, 0x6f, 0x66, 0x69, 0x6c, 0x65, 0x5f, 0x6d, 0x65, 0x74, 0x68, 0x6f, 0x64, 0x2e, 0x70,
	0x72, 0x6f, 0x74, 0x6f, 0x12, 0x0d, 0x6f, 0x75, 0x74, 0x65, 0x72, 0x2e, 0x70, 0x72, 0x6f, 0x66,
	0x69, 0x6c, 0x65, 0x22, 0x59, 0x0a, 0x0d, 0x50, 0x72, 0x6f, 0x66, 0x69, 0x6c, 0x65, 0x4d, 0x65,
	0x74, 0x68, 0x6f, 0x64, 0x12, 0x34, 0x0a, 0x04, 0x6b, 0x69, 0x6e, 0x64, 0x18, 0x01, 0x20, 0x01,
	0x28, 0x0e, 0x32, 0x20, 0x2e, 0x6f, 0x75, 0x74, 0x65, 0x72, 0x2e, 0x70, 0x72, 0x6f, 0x66, 0x69,
	0x6c, 0x65, 0x2e, 0x50, 0x72, 0x6f, 0x66, 0x69, 0x6c, 0x65, 0x4d, 0x65, 0x74, 0x68, 0x6f, 0x64,
	0x4b, 0x69, 0x6e, 0x64, 0x52, 0x04, 0x6b, 0x69, 0x6e, 0x64, 0x12, 0x12, 0x0a, 0x04, 0x6e, 0x61,
	0x6d, 0x65, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x22, 0x7d,
	0x0a, 0x17, 0x50, 0x72, 0x6f, 0x66, 0x69, 0x6c, 0x65, 0x4d, 0x65, 0x74, 0x68, 0x6f, 0x64, 0x57,
	0x69, 0x74, 0x68, 0x43, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x12, 0x43, 0x0a, 0x0e, 0x70, 0x72, 0x6f,
	0x66, 0x69, 0x6c, 0x65, 0x5f, 0x6d, 0x65, 0x74, 0x68, 0x6f, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28,
	0x0b, 0x32, 0x1c, 0x2e, 0x6f, 0x75, 0x74, 0x65, 0x72, 0x2e, 0x70, 0x72, 0x6f, 0x66, 0x69, 0x6c,
	0x65, 0x2e, 0x50, 0x72, 0x6f, 0x66, 0x69, 0x6c, 0x65, 0x4d, 0x65, 0x74, 0x68, 0x6f, 0x64, 0x52,
	0x0d, 0x70, 0x72, 0x6f, 0x66, 0x69, 0x6c, 0x65, 0x4d, 0x65, 0x74, 0x68, 0x6f, 0x64, 0x12, 0x1d,
	0x0a, 0x0a, 0x70, 0x65, 0x72, 0x69, 0x6f, 0x64, 0x5f, 0x73, 0x65, 0x63, 0x18, 0x02, 0x20, 0x01,
	0x28, 0x07, 0x52, 0x09, 0x70, 0x65, 0x72, 0x69, 0x6f, 0x64, 0x53, 0x65, 0x63, 0x22, 0x5f, 0x0a,
	0x0c, 0x44, 0x65, 0x76, 0x69, 0x63, 0x65, 0x43, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x12, 0x4f, 0x0a,
	0x0f, 0x70, 0x72, 0x6f, 0x66, 0x69, 0x6c, 0x65, 0x5f, 0x6d, 0x65, 0x74, 0x68, 0x6f, 0x64, 0x73,
	0x18, 0x01, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x26, 0x2e, 0x6f, 0x75, 0x74, 0x65, 0x72, 0x2e, 0x70,
	0x72, 0x6f, 0x66, 0x69, 0x6c, 0x65, 0x2e, 0x50, 0x72, 0x6f, 0x66, 0x69, 0x6c, 0x65, 0x4d, 0x65,
	0x74, 0x68, 0x6f, 0x64, 0x57, 0x69, 0x74, 0x68, 0x43, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x52, 0x0e,
	0x70, 0x72, 0x6f, 0x66, 0x69, 0x6c, 0x65, 0x4d, 0x65, 0x74, 0x68, 0x6f, 0x64, 0x73, 0x2a, 0xb3,
	0x07, 0x0a, 0x11, 0x50, 0x72, 0x6f, 0x66, 0x69, 0x6c, 0x65, 0x4d, 0x65, 0x74, 0x68, 0x6f, 0x64,
	0x4b, 0x69, 0x6e, 0x64, 0x12, 0x23, 0x0a, 0x1f, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x5f,
	0x4d, 0x45, 0x54, 0x48, 0x4f, 0x44, 0x5f, 0x4b, 0x49, 0x4e, 0x44, 0x5f, 0x55, 0x4e, 0x53, 0x50,
	0x45, 0x43, 0x49, 0x46, 0x49, 0x45, 0x44, 0x10, 0x00, 0x12, 0x23, 0x0a, 0x1f, 0x50, 0x52, 0x4f,
	0x46, 0x49, 0x4c, 0x45, 0x5f, 0x4d, 0x45, 0x54, 0x48, 0x4f, 0x44, 0x5f, 0x4b, 0x49, 0x4e, 0x44,
	0x5f, 0x44, 0x45, 0x53, 0x4b, 0x54, 0x4f, 0x50, 0x5f, 0x43, 0x50, 0x55, 0x10, 0x01, 0x12, 0x27,
	0x0a, 0x23, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x5f, 0x4d, 0x45, 0x54, 0x48, 0x4f, 0x44,
	0x5f, 0x4b, 0x49, 0x4e, 0x44, 0x5f, 0x44, 0x45, 0x53, 0x4b, 0x54, 0x4f, 0x50, 0x5f, 0x43, 0x50,
	0x55, 0x46, 0x52, 0x45, 0x51, 0x10, 0x0a, 0x12, 0x23, 0x0a, 0x1f, 0x50, 0x52, 0x4f, 0x46, 0x49,
	0x4c, 0x45, 0x5f, 0x4d, 0x45, 0x54, 0x48, 0x4f, 0x44, 0x5f, 0x4b, 0x49, 0x4e, 0x44, 0x5f, 0x44,
	0x45, 0x53, 0x4b, 0x54, 0x4f, 0x50, 0x5f, 0x47, 0x50, 0x55, 0x10, 0x14, 0x12, 0x23, 0x0a, 0x1f,
	0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x5f, 0x4d, 0x45, 0x54, 0x48, 0x4f, 0x44, 0x5f, 0x4b,
	0x49, 0x4e, 0x44, 0x5f, 0x44, 0x45, 0x53, 0x4b, 0x54, 0x4f, 0x50, 0x5f, 0x4d, 0x45, 0x4d, 0x10,
	0x1e, 0x12, 0x22, 0x0a, 0x1e, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x5f, 0x4d, 0x45, 0x54,
	0x48, 0x4f, 0x44, 0x5f, 0x4b, 0x49, 0x4e, 0x44, 0x5f, 0x44, 0x45, 0x53, 0x4b, 0x54, 0x4f, 0x50,
	0x5f, 0x46, 0x53, 0x10, 0x28, 0x12, 0x23, 0x0a, 0x1f, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45,
	0x5f, 0x4d, 0x45, 0x54, 0x48, 0x4f, 0x44, 0x5f, 0x4b, 0x49, 0x4e, 0x44, 0x5f, 0x44, 0x45, 0x53,
	0x4b, 0x54, 0x4f, 0x50, 0x5f, 0x4e, 0x45, 0x54, 0x10, 0x32, 0x12, 0x27, 0x0a, 0x23, 0x50, 0x52,
	0x4f, 0x46, 0x49, 0x4c, 0x45, 0x5f, 0x4d, 0x45, 0x54, 0x48, 0x4f, 0x44, 0x5f, 0x4b, 0x49, 0x4e,
	0x44, 0x5f, 0x44, 0x45, 0x53, 0x4b, 0x54, 0x4f, 0x50, 0x5f, 0x44, 0x49, 0x53, 0x50, 0x4c, 0x41,
	0x59, 0x10, 0x3c, 0x12, 0x2d, 0x0a, 0x28, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x5f, 0x4d,
	0x45, 0x54, 0x48, 0x4f, 0x44, 0x5f, 0x4b, 0x49, 0x4e, 0x44, 0x5f, 0x41, 0x4e, 0x44, 0x52, 0x4f,
	0x49, 0x44, 0x5f, 0x43, 0x50, 0x55, 0x5f, 0x53, 0x48, 0x45, 0x4c, 0x4c, 0x54, 0x4f, 0x50, 0x10,
	0xe9, 0x07, 0x12, 0x2c, 0x0a, 0x27, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x5f, 0x4d, 0x45,
	0x54, 0x48, 0x4f, 0x44, 0x5f, 0x4b, 0x49, 0x4e, 0x44, 0x5f, 0x41, 0x4e, 0x44, 0x52, 0x4f, 0x49,
	0x44, 0x5f, 0x43, 0x50, 0x55, 0x46, 0x52, 0x45, 0x51, 0x5f, 0x43, 0x41, 0x54, 0x10, 0xf2, 0x07,
	0x12, 0x2b, 0x0a, 0x26, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x5f, 0x4d, 0x45, 0x54, 0x48,
	0x4f, 0x44, 0x5f, 0x4b, 0x49, 0x4e, 0x44, 0x5f, 0x41, 0x4e, 0x44, 0x52, 0x4f, 0x49, 0x44, 0x5f,
	0x47, 0x50, 0x55, 0x5f, 0x4e, 0x4f, 0x54, 0x59, 0x45, 0x54, 0x10, 0xfc, 0x07, 0x12, 0x34, 0x0a,
	0x2f, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x5f, 0x4d, 0x45, 0x54, 0x48, 0x4f, 0x44, 0x5f,
	0x4b, 0x49, 0x4e, 0x44, 0x5f, 0x41, 0x4e, 0x44, 0x52, 0x4f, 0x49, 0x44, 0x5f, 0x4d, 0x45, 0x4d,
	0x5f, 0x41, 0x43, 0x54, 0x49, 0x56, 0x49, 0x54, 0x59, 0x4d, 0x41, 0x4e, 0x41, 0x47, 0x45, 0x52,
	0x10, 0x86, 0x08, 0x12, 0x30, 0x0a, 0x2b, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x5f, 0x4d,
	0x45, 0x54, 0x48, 0x4f, 0x44, 0x5f, 0x4b, 0x49, 0x4e, 0x44, 0x5f, 0x41, 0x4e, 0x44, 0x52, 0x4f,
	0x49, 0x44, 0x5f, 0x4d, 0x45, 0x4d, 0x5f, 0x50, 0x52, 0x4f, 0x43, 0x4d, 0x45, 0x4d, 0x49, 0x4e,
	0x46, 0x4f, 0x10, 0x87, 0x08, 0x12, 0x31, 0x0a, 0x2c, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45,
	0x5f, 0x4d, 0x45, 0x54, 0x48, 0x4f, 0x44, 0x5f, 0x4b, 0x49, 0x4e, 0x44, 0x5f, 0x41, 0x4e, 0x44,
	0x52, 0x4f, 0x49, 0x44, 0x5f, 0x46, 0x53, 0x5f, 0x50, 0x52, 0x4f, 0x43, 0x44, 0x49, 0x53, 0x4b,
	0x53, 0x54, 0x41, 0x54, 0x53, 0x10, 0x90, 0x08, 0x12, 0x31, 0x0a, 0x2c, 0x50, 0x52, 0x4f, 0x46,
	0x49, 0x4c, 0x45, 0x5f, 0x4d, 0x45, 0x54, 0x48, 0x4f, 0x44, 0x5f, 0x4b, 0x49, 0x4e, 0x44, 0x5f,
	0x41, 0x4e, 0x44, 0x52, 0x4f, 0x49, 0x44, 0x5f, 0x4e, 0x45, 0x54, 0x5f, 0x54, 0x52, 0x41, 0x46,
	0x46, 0x49, 0x43, 0x53, 0x54, 0x41, 0x54, 0x53, 0x10, 0x9a, 0x08, 0x12, 0x28, 0x0a, 0x23, 0x50,
	0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x5f, 0x4d, 0x45, 0x54, 0x48, 0x4f, 0x44, 0x5f, 0x4b, 0x49,
	0x4e, 0x44, 0x5f, 0x41, 0x4e, 0x44, 0x52, 0x4f, 0x49, 0x44, 0x5f, 0x44, 0x49, 0x53, 0x50, 0x4c,
	0x41, 0x59, 0x10, 0xa4, 0x08, 0x12, 0x31, 0x0a, 0x2c, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45,
	0x5f, 0x4d, 0x45, 0x54, 0x48, 0x4f, 0x44, 0x5f, 0x4b, 0x49, 0x4e, 0x44, 0x5f, 0x41, 0x4e, 0x44,
	0x52, 0x4f, 0x49, 0x44, 0x5f, 0x50, 0x52, 0x4f, 0x43, 0x45, 0x53, 0x53, 0x5f, 0x53, 0x48, 0x45,
	0x4c, 0x4c, 0x54, 0x4f, 0x50, 0x10, 0xae, 0x08, 0x12, 0x38, 0x0a, 0x33, 0x50, 0x52, 0x4f, 0x46,
	0x49, 0x4c, 0x45, 0x5f, 0x4d, 0x45, 0x54, 0x48, 0x4f, 0x44, 0x5f, 0x4b, 0x49, 0x4e, 0x44, 0x5f,
	0x41, 0x4e, 0x44, 0x52, 0x4f, 0x49, 0x44, 0x5f, 0x42, 0x4c, 0x4f, 0x43, 0x4b, 0x5f, 0x44, 0x45,
	0x56, 0x45, 0x4c, 0x4f, 0x50, 0x45, 0x52, 0x5f, 0x4f, 0x50, 0x54, 0x49, 0x4f, 0x4e, 0x53, 0x10,
	0xb8, 0x08, 0x12, 0x2a, 0x0a, 0x25, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x5f, 0x4d, 0x45,
	0x54, 0x48, 0x4f, 0x44, 0x5f, 0x4b, 0x49, 0x4e, 0x44, 0x5f, 0x49, 0x4f, 0x53, 0x5f, 0x43, 0x50,
	0x55, 0x5f, 0x4c, 0x4f, 0x41, 0x44, 0x5f, 0x49, 0x4e, 0x46, 0x4f, 0x10, 0xd1, 0x0f, 0x12, 0x2e,
	0x0a, 0x29, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x5f, 0x4d, 0x45, 0x54, 0x48, 0x4f, 0x44,
	0x5f, 0x4b, 0x49, 0x4e, 0x44, 0x5f, 0x49, 0x4f, 0x53, 0x5f, 0x4d, 0x45, 0x4d, 0x5f, 0x56, 0x4d,
	0x5f, 0x53, 0x54, 0x41, 0x54, 0x49, 0x53, 0x54, 0x49, 0x43, 0x53, 0x10, 0xee, 0x0f, 0x12, 0x24,
	0x0a, 0x1f, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x5f, 0x4d, 0x45, 0x54, 0x48, 0x4f, 0x44,
	0x5f, 0x4b, 0x49, 0x4e, 0x44, 0x5f, 0x49, 0x4f, 0x53, 0x5f, 0x44, 0x49, 0x53, 0x50, 0x4c, 0x41,
	0x59, 0x10, 0x8c, 0x10, 0x42, 0x6e, 0x0a, 0x29, 0x63, 0x6f, 0x6d, 0x2e, 0x64, 0x6f, 0x67, 0x75,
	0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x63, 0x6f, 0x6c, 0x2e, 0x67, 0x65, 0x6e, 0x65, 0x72, 0x61,
	0x74, 0x65, 0x64, 0x2e, 0x6f, 0x75, 0x74, 0x65, 0x72, 0x2e, 0x70, 0x72, 0x6f, 0x66, 0x69, 0x6c,
	0x65, 0x5a, 0x41, 0x67, 0x6f, 0x2d, 0x64, 0x65, 0x76, 0x69, 0x63, 0x65, 0x2d, 0x63, 0x6f, 0x6e,
	0x74, 0x72, 0x6f, 0x6c, 0x6c, 0x65, 0x72, 0x2f, 0x74, 0x79, 0x70, 0x65, 0x73, 0x2f, 0x70, 0x72,
	0x6f, 0x74, 0x6f, 0x63, 0x6f, 0x6c, 0x2f, 0x67, 0x65, 0x6e, 0x65, 0x72, 0x61, 0x74, 0x65, 0x64,
	0x2f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2f, 0x6f, 0x75, 0x74, 0x65, 0x72, 0x2f, 0x70, 0x72, 0x6f,
	0x66, 0x69, 0x6c, 0x65, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_outer_profile_profile_method_proto_rawDescOnce sync.Once
	file_outer_profile_profile_method_proto_rawDescData = file_outer_profile_profile_method_proto_rawDesc
)

func file_outer_profile_profile_method_proto_rawDescGZIP() []byte {
	file_outer_profile_profile_method_proto_rawDescOnce.Do(func() {
		file_outer_profile_profile_method_proto_rawDescData = protoimpl.X.CompressGZIP(file_outer_profile_profile_method_proto_rawDescData)
	})
	return file_outer_profile_profile_method_proto_rawDescData
}

var file_outer_profile_profile_method_proto_enumTypes = make([]protoimpl.EnumInfo, 1)
var file_outer_profile_profile_method_proto_msgTypes = make([]protoimpl.MessageInfo, 3)
var file_outer_profile_profile_method_proto_goTypes = []interface{}{
	(ProfileMethodKind)(0),          // 0: outer.profile.ProfileMethodKind
	(*ProfileMethod)(nil),           // 1: outer.profile.ProfileMethod
	(*ProfileMethodWithConfig)(nil), // 2: outer.profile.ProfileMethodWithConfig
	(*DeviceConfig)(nil),            // 3: outer.profile.DeviceConfig
}
var file_outer_profile_profile_method_proto_depIdxs = []int32{
	0, // 0: outer.profile.ProfileMethod.kind:type_name -> outer.profile.ProfileMethodKind
	1, // 1: outer.profile.ProfileMethodWithConfig.profile_method:type_name -> outer.profile.ProfileMethod
	2, // 2: outer.profile.DeviceConfig.profile_methods:type_name -> outer.profile.ProfileMethodWithConfig
	3, // [3:3] is the sub-list for method output_type
	3, // [3:3] is the sub-list for method input_type
	3, // [3:3] is the sub-list for extension type_name
	3, // [3:3] is the sub-list for extension extendee
	0, // [0:3] is the sub-list for field type_name
}

func init() { file_outer_profile_profile_method_proto_init() }
func file_outer_profile_profile_method_proto_init() {
	if File_outer_profile_profile_method_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_outer_profile_profile_method_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*ProfileMethod); i {
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
		file_outer_profile_profile_method_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*ProfileMethodWithConfig); i {
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
		file_outer_profile_profile_method_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DeviceConfig); i {
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
			RawDescriptor: file_outer_profile_profile_method_proto_rawDesc,
			NumEnums:      1,
			NumMessages:   3,
			NumExtensions: 0,
			NumServices:   0,
		},
		GoTypes:           file_outer_profile_profile_method_proto_goTypes,
		DependencyIndexes: file_outer_profile_profile_method_proto_depIdxs,
		EnumInfos:         file_outer_profile_profile_method_proto_enumTypes,
		MessageInfos:      file_outer_profile_profile_method_proto_msgTypes,
	}.Build()
	File_outer_profile_profile_method_proto = out.File
	file_outer_profile_profile_method_proto_rawDesc = nil
	file_outer_profile_profile_method_proto_goTypes = nil
	file_outer_profile_profile_method_proto_depIdxs = nil
}
