//Generated by the protocol buffer compiler. DO NOT EDIT!
// source: inner/types/dc_gdc.proto

package com.dogu.protocol.generated.inner.types;

@kotlin.jvm.JvmName("-initializedcGdcGetSurfaceStatusParam")
inline fun dcGdcGetSurfaceStatusParam(block: com.dogu.protocol.generated.inner.types.DcGdcGetSurfaceStatusParamKt.Dsl.() -> kotlin.Unit): com.dogu.protocol.generated.inner.types.DcGdc.DcGdcGetSurfaceStatusParam =
  com.dogu.protocol.generated.inner.types.DcGdcGetSurfaceStatusParamKt.Dsl._create(com.dogu.protocol.generated.inner.types.DcGdc.DcGdcGetSurfaceStatusParam.newBuilder()).apply { block() }._build()
object DcGdcGetSurfaceStatusParamKt {
  @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
  @com.google.protobuf.kotlin.ProtoDslMarker
  class Dsl private constructor(
    private val _builder: com.dogu.protocol.generated.inner.types.DcGdc.DcGdcGetSurfaceStatusParam.Builder
  ) {
    companion object {
      @kotlin.jvm.JvmSynthetic
      @kotlin.PublishedApi
      internal fun _create(builder: com.dogu.protocol.generated.inner.types.DcGdc.DcGdcGetSurfaceStatusParam.Builder): Dsl = Dsl(builder)
    }

    @kotlin.jvm.JvmSynthetic
    @kotlin.PublishedApi
    internal fun _build(): com.dogu.protocol.generated.inner.types.DcGdc.DcGdcGetSurfaceStatusParam = _builder.build()

    /**
     * <code>string serial = 1;</code>
     */
    var serial: kotlin.String
      @JvmName("getSerial")
      get() = _builder.getSerial()
      @JvmName("setSerial")
      set(value) {
        _builder.setSerial(value)
      }
    /**
     * <code>string serial = 1;</code>
     */
    fun clearSerial() {
      _builder.clearSerial()
    }

    /**
     * <code>optional int32 screen_id = 2;</code>
     */
    var screenId: kotlin.Int
      @JvmName("getScreenId")
      get() = _builder.getScreenId()
      @JvmName("setScreenId")
      set(value) {
        _builder.setScreenId(value)
      }
    /**
     * <code>optional int32 screen_id = 2;</code>
     */
    fun clearScreenId() {
      _builder.clearScreenId()
    }
    /**
     * <code>optional int32 screen_id = 2;</code>
     * @return Whether the screenId field is set.
     */
    fun hasScreenId(): kotlin.Boolean {
      return _builder.hasScreenId()
    }

    /**
     * <code>optional int32 pid = 3;</code>
     */
    var pid: kotlin.Int
      @JvmName("getPid")
      get() = _builder.getPid()
      @JvmName("setPid")
      set(value) {
        _builder.setPid(value)
      }
    /**
     * <code>optional int32 pid = 3;</code>
     */
    fun clearPid() {
      _builder.clearPid()
    }
    /**
     * <code>optional int32 pid = 3;</code>
     * @return Whether the pid field is set.
     */
    fun hasPid(): kotlin.Boolean {
      return _builder.hasPid()
    }
  }
}
@kotlin.jvm.JvmSynthetic
inline fun com.dogu.protocol.generated.inner.types.DcGdc.DcGdcGetSurfaceStatusParam.copy(block: com.dogu.protocol.generated.inner.types.DcGdcGetSurfaceStatusParamKt.Dsl.() -> kotlin.Unit): com.dogu.protocol.generated.inner.types.DcGdc.DcGdcGetSurfaceStatusParam =
  com.dogu.protocol.generated.inner.types.DcGdcGetSurfaceStatusParamKt.Dsl._create(this.toBuilder()).apply { block() }._build()

