//Generated by the protocol buffer compiler. DO NOT EDIT!
// source: inner/params/dc_ida.proto

package com.dogu.protocol.generated.inner.params;

@kotlin.jvm.JvmName("-initializedcIdaParam")
inline fun dcIdaParam(block: com.dogu.protocol.generated.inner.params.DcIdaParamKt.Dsl.() -> kotlin.Unit): com.dogu.protocol.generated.inner.params.DcIda.DcIdaParam =
  com.dogu.protocol.generated.inner.params.DcIdaParamKt.Dsl._create(com.dogu.protocol.generated.inner.params.DcIda.DcIdaParam.newBuilder()).apply { block() }._build()
object DcIdaParamKt {
  @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
  @com.google.protobuf.kotlin.ProtoDslMarker
  class Dsl private constructor(
    private val _builder: com.dogu.protocol.generated.inner.params.DcIda.DcIdaParam.Builder
  ) {
    companion object {
      @kotlin.jvm.JvmSynthetic
      @kotlin.PublishedApi
      internal fun _create(builder: com.dogu.protocol.generated.inner.params.DcIda.DcIdaParam.Builder): Dsl = Dsl(builder)
    }

    @kotlin.jvm.JvmSynthetic
    @kotlin.PublishedApi
    internal fun _build(): com.dogu.protocol.generated.inner.params.DcIda.DcIdaParam = _builder.build()

    /**
     * <code>fixed32 seq = 10;</code>
     */
    var seq: kotlin.Int
      @JvmName("getSeq")
      get() = _builder.getSeq()
      @JvmName("setSeq")
      set(value) {
        _builder.setSeq(value)
      }
    /**
     * <code>fixed32 seq = 10;</code>
     */
    fun clearSeq() {
      _builder.clearSeq()
    }

    /**
     * <code>.inner.types.DcIdaRunAppParam dc_ida_runapp_param = 1;</code>
     */
    var dcIdaRunappParam: com.dogu.protocol.generated.inner.types.DcIda.DcIdaRunAppParam
      @JvmName("getDcIdaRunappParam")
      get() = _builder.getDcIdaRunappParam()
      @JvmName("setDcIdaRunappParam")
      set(value) {
        _builder.setDcIdaRunappParam(value)
      }
    /**
     * <code>.inner.types.DcIdaRunAppParam dc_ida_runapp_param = 1;</code>
     */
    fun clearDcIdaRunappParam() {
      _builder.clearDcIdaRunappParam()
    }
    /**
     * <code>.inner.types.DcIdaRunAppParam dc_ida_runapp_param = 1;</code>
     * @return Whether the dcIdaRunappParam field is set.
     */
    fun hasDcIdaRunappParam(): kotlin.Boolean {
      return _builder.hasDcIdaRunappParam()
    }

    /**
     * <code>.inner.types.DcIdaGetSystemInfoParam dc_ida_get_system_info_param = 2;</code>
     */
    var dcIdaGetSystemInfoParam: com.dogu.protocol.generated.inner.types.DcIda.DcIdaGetSystemInfoParam
      @JvmName("getDcIdaGetSystemInfoParam")
      get() = _builder.getDcIdaGetSystemInfoParam()
      @JvmName("setDcIdaGetSystemInfoParam")
      set(value) {
        _builder.setDcIdaGetSystemInfoParam(value)
      }
    /**
     * <code>.inner.types.DcIdaGetSystemInfoParam dc_ida_get_system_info_param = 2;</code>
     */
    fun clearDcIdaGetSystemInfoParam() {
      _builder.clearDcIdaGetSystemInfoParam()
    }
    /**
     * <code>.inner.types.DcIdaGetSystemInfoParam dc_ida_get_system_info_param = 2;</code>
     * @return Whether the dcIdaGetSystemInfoParam field is set.
     */
    fun hasDcIdaGetSystemInfoParam(): kotlin.Boolean {
      return _builder.hasDcIdaGetSystemInfoParam()
    }

    /**
     * <code>.inner.types.DcIdaIsPortListeningParam dc_ida_is_port_listening_param = 3;</code>
     */
    var dcIdaIsPortListeningParam: com.dogu.protocol.generated.inner.types.DcIda.DcIdaIsPortListeningParam
      @JvmName("getDcIdaIsPortListeningParam")
      get() = _builder.getDcIdaIsPortListeningParam()
      @JvmName("setDcIdaIsPortListeningParam")
      set(value) {
        _builder.setDcIdaIsPortListeningParam(value)
      }
    /**
     * <code>.inner.types.DcIdaIsPortListeningParam dc_ida_is_port_listening_param = 3;</code>
     */
    fun clearDcIdaIsPortListeningParam() {
      _builder.clearDcIdaIsPortListeningParam()
    }
    /**
     * <code>.inner.types.DcIdaIsPortListeningParam dc_ida_is_port_listening_param = 3;</code>
     * @return Whether the dcIdaIsPortListeningParam field is set.
     */
    fun hasDcIdaIsPortListeningParam(): kotlin.Boolean {
      return _builder.hasDcIdaIsPortListeningParam()
    }

    /**
     * <code>.inner.types.DcIdaQueryProfileParam dc_ida_query_profile_param = 4;</code>
     */
    var dcIdaQueryProfileParam: com.dogu.protocol.generated.inner.types.DcIda.DcIdaQueryProfileParam
      @JvmName("getDcIdaQueryProfileParam")
      get() = _builder.getDcIdaQueryProfileParam()
      @JvmName("setDcIdaQueryProfileParam")
      set(value) {
        _builder.setDcIdaQueryProfileParam(value)
      }
    /**
     * <code>.inner.types.DcIdaQueryProfileParam dc_ida_query_profile_param = 4;</code>
     */
    fun clearDcIdaQueryProfileParam() {
      _builder.clearDcIdaQueryProfileParam()
    }
    /**
     * <code>.inner.types.DcIdaQueryProfileParam dc_ida_query_profile_param = 4;</code>
     * @return Whether the dcIdaQueryProfileParam field is set.
     */
    fun hasDcIdaQueryProfileParam(): kotlin.Boolean {
      return _builder.hasDcIdaQueryProfileParam()
    }

    /**
     * <code>.inner.types.CfGdcDaControlParam dc_gdc_da_control_param = 5;</code>
     */
    var dcGdcDaControlParam: com.dogu.protocol.generated.inner.types.CfGdcDa.CfGdcDaControlParam
      @JvmName("getDcGdcDaControlParam")
      get() = _builder.getDcGdcDaControlParam()
      @JvmName("setDcGdcDaControlParam")
      set(value) {
        _builder.setDcGdcDaControlParam(value)
      }
    /**
     * <code>.inner.types.CfGdcDaControlParam dc_gdc_da_control_param = 5;</code>
     */
    fun clearDcGdcDaControlParam() {
      _builder.clearDcGdcDaControlParam()
    }
    /**
     * <code>.inner.types.CfGdcDaControlParam dc_gdc_da_control_param = 5;</code>
     * @return Whether the dcGdcDaControlParam field is set.
     */
    fun hasDcGdcDaControlParam(): kotlin.Boolean {
      return _builder.hasDcGdcDaControlParam()
    }
    val valueCase: com.dogu.protocol.generated.inner.params.DcIda.DcIdaParam.ValueCase
      @JvmName("getValueCase")
      get() = _builder.getValueCase()

    fun clearValue() {
      _builder.clearValue()
    }
  }
}
@kotlin.jvm.JvmSynthetic
inline fun com.dogu.protocol.generated.inner.params.DcIda.DcIdaParam.copy(block: com.dogu.protocol.generated.inner.params.DcIdaParamKt.Dsl.() -> kotlin.Unit): com.dogu.protocol.generated.inner.params.DcIda.DcIdaParam =
  com.dogu.protocol.generated.inner.params.DcIdaParamKt.Dsl._create(this.toBuilder()).apply { block() }._build()

val com.dogu.protocol.generated.inner.params.DcIda.DcIdaParamOrBuilder.dcIdaRunappParamOrNull: com.dogu.protocol.generated.inner.types.DcIda.DcIdaRunAppParam?
  get() = if (hasDcIdaRunappParam()) getDcIdaRunappParam() else null

val com.dogu.protocol.generated.inner.params.DcIda.DcIdaParamOrBuilder.dcIdaGetSystemInfoParamOrNull: com.dogu.protocol.generated.inner.types.DcIda.DcIdaGetSystemInfoParam?
  get() = if (hasDcIdaGetSystemInfoParam()) getDcIdaGetSystemInfoParam() else null

val com.dogu.protocol.generated.inner.params.DcIda.DcIdaParamOrBuilder.dcIdaIsPortListeningParamOrNull: com.dogu.protocol.generated.inner.types.DcIda.DcIdaIsPortListeningParam?
  get() = if (hasDcIdaIsPortListeningParam()) getDcIdaIsPortListeningParam() else null

val com.dogu.protocol.generated.inner.params.DcIda.DcIdaParamOrBuilder.dcIdaQueryProfileParamOrNull: com.dogu.protocol.generated.inner.types.DcIda.DcIdaQueryProfileParam?
  get() = if (hasDcIdaQueryProfileParam()) getDcIdaQueryProfileParam() else null

val com.dogu.protocol.generated.inner.params.DcIda.DcIdaParamOrBuilder.dcGdcDaControlParamOrNull: com.dogu.protocol.generated.inner.types.CfGdcDa.CfGdcDaControlParam?
  get() = if (hasDcGdcDaControlParam()) getDcGdcDaControlParam() else null

