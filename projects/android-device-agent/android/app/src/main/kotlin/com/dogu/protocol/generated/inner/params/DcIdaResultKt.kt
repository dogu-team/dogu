//Generated by the protocol buffer compiler. DO NOT EDIT!
// source: inner/params/dc_ida.proto

package com.dogu.protocol.generated.inner.params;

@kotlin.jvm.JvmName("-initializedcIdaResult")
inline fun dcIdaResult(block: com.dogu.protocol.generated.inner.params.DcIdaResultKt.Dsl.() -> kotlin.Unit): com.dogu.protocol.generated.inner.params.DcIda.DcIdaResult =
  com.dogu.protocol.generated.inner.params.DcIdaResultKt.Dsl._create(com.dogu.protocol.generated.inner.params.DcIda.DcIdaResult.newBuilder()).apply { block() }._build()
object DcIdaResultKt {
  @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
  @com.google.protobuf.kotlin.ProtoDslMarker
  class Dsl private constructor(
    private val _builder: com.dogu.protocol.generated.inner.params.DcIda.DcIdaResult.Builder
  ) {
    companion object {
      @kotlin.jvm.JvmSynthetic
      @kotlin.PublishedApi
      internal fun _create(builder: com.dogu.protocol.generated.inner.params.DcIda.DcIdaResult.Builder): Dsl = Dsl(builder)
    }

    @kotlin.jvm.JvmSynthetic
    @kotlin.PublishedApi
    internal fun _build(): com.dogu.protocol.generated.inner.params.DcIda.DcIdaResult = _builder.build()

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
     * <code>.inner.types.DcIdaRunAppResult dc_ida_runapp_result = 1;</code>
     */
    var dcIdaRunappResult: com.dogu.protocol.generated.inner.types.DcIda.DcIdaRunAppResult
      @JvmName("getDcIdaRunappResult")
      get() = _builder.getDcIdaRunappResult()
      @JvmName("setDcIdaRunappResult")
      set(value) {
        _builder.setDcIdaRunappResult(value)
      }
    /**
     * <code>.inner.types.DcIdaRunAppResult dc_ida_runapp_result = 1;</code>
     */
    fun clearDcIdaRunappResult() {
      _builder.clearDcIdaRunappResult()
    }
    /**
     * <code>.inner.types.DcIdaRunAppResult dc_ida_runapp_result = 1;</code>
     * @return Whether the dcIdaRunappResult field is set.
     */
    fun hasDcIdaRunappResult(): kotlin.Boolean {
      return _builder.hasDcIdaRunappResult()
    }

    /**
     * <code>.inner.types.DcIdaGetSystemInfoResult dc_ida_get_system_info_result = 2;</code>
     */
    var dcIdaGetSystemInfoResult: com.dogu.protocol.generated.inner.types.DcIda.DcIdaGetSystemInfoResult
      @JvmName("getDcIdaGetSystemInfoResult")
      get() = _builder.getDcIdaGetSystemInfoResult()
      @JvmName("setDcIdaGetSystemInfoResult")
      set(value) {
        _builder.setDcIdaGetSystemInfoResult(value)
      }
    /**
     * <code>.inner.types.DcIdaGetSystemInfoResult dc_ida_get_system_info_result = 2;</code>
     */
    fun clearDcIdaGetSystemInfoResult() {
      _builder.clearDcIdaGetSystemInfoResult()
    }
    /**
     * <code>.inner.types.DcIdaGetSystemInfoResult dc_ida_get_system_info_result = 2;</code>
     * @return Whether the dcIdaGetSystemInfoResult field is set.
     */
    fun hasDcIdaGetSystemInfoResult(): kotlin.Boolean {
      return _builder.hasDcIdaGetSystemInfoResult()
    }

    /**
     * <code>.inner.types.DcIdaIsPortListeningResult dc_ida_is_port_listening_result = 3;</code>
     */
    var dcIdaIsPortListeningResult: com.dogu.protocol.generated.inner.types.DcIda.DcIdaIsPortListeningResult
      @JvmName("getDcIdaIsPortListeningResult")
      get() = _builder.getDcIdaIsPortListeningResult()
      @JvmName("setDcIdaIsPortListeningResult")
      set(value) {
        _builder.setDcIdaIsPortListeningResult(value)
      }
    /**
     * <code>.inner.types.DcIdaIsPortListeningResult dc_ida_is_port_listening_result = 3;</code>
     */
    fun clearDcIdaIsPortListeningResult() {
      _builder.clearDcIdaIsPortListeningResult()
    }
    /**
     * <code>.inner.types.DcIdaIsPortListeningResult dc_ida_is_port_listening_result = 3;</code>
     * @return Whether the dcIdaIsPortListeningResult field is set.
     */
    fun hasDcIdaIsPortListeningResult(): kotlin.Boolean {
      return _builder.hasDcIdaIsPortListeningResult()
    }

    /**
     * <code>.inner.types.DcIdaQueryProfileResult dc_ida_query_profile_result = 4;</code>
     */
    var dcIdaQueryProfileResult: com.dogu.protocol.generated.inner.types.DcIda.DcIdaQueryProfileResult
      @JvmName("getDcIdaQueryProfileResult")
      get() = _builder.getDcIdaQueryProfileResult()
      @JvmName("setDcIdaQueryProfileResult")
      set(value) {
        _builder.setDcIdaQueryProfileResult(value)
      }
    /**
     * <code>.inner.types.DcIdaQueryProfileResult dc_ida_query_profile_result = 4;</code>
     */
    fun clearDcIdaQueryProfileResult() {
      _builder.clearDcIdaQueryProfileResult()
    }
    /**
     * <code>.inner.types.DcIdaQueryProfileResult dc_ida_query_profile_result = 4;</code>
     * @return Whether the dcIdaQueryProfileResult field is set.
     */
    fun hasDcIdaQueryProfileResult(): kotlin.Boolean {
      return _builder.hasDcIdaQueryProfileResult()
    }

    /**
     * <code>.inner.types.CfGdcDaControlResult dc_gdc_da_control_result = 5;</code>
     */
    var dcGdcDaControlResult: com.dogu.protocol.generated.inner.types.CfGdcDa.CfGdcDaControlResult
      @JvmName("getDcGdcDaControlResult")
      get() = _builder.getDcGdcDaControlResult()
      @JvmName("setDcGdcDaControlResult")
      set(value) {
        _builder.setDcGdcDaControlResult(value)
      }
    /**
     * <code>.inner.types.CfGdcDaControlResult dc_gdc_da_control_result = 5;</code>
     */
    fun clearDcGdcDaControlResult() {
      _builder.clearDcGdcDaControlResult()
    }
    /**
     * <code>.inner.types.CfGdcDaControlResult dc_gdc_da_control_result = 5;</code>
     * @return Whether the dcGdcDaControlResult field is set.
     */
    fun hasDcGdcDaControlResult(): kotlin.Boolean {
      return _builder.hasDcGdcDaControlResult()
    }
    val valueCase: com.dogu.protocol.generated.inner.params.DcIda.DcIdaResult.ValueCase
      @JvmName("getValueCase")
      get() = _builder.getValueCase()

    fun clearValue() {
      _builder.clearValue()
    }
  }
}
@kotlin.jvm.JvmSynthetic
inline fun com.dogu.protocol.generated.inner.params.DcIda.DcIdaResult.copy(block: com.dogu.protocol.generated.inner.params.DcIdaResultKt.Dsl.() -> kotlin.Unit): com.dogu.protocol.generated.inner.params.DcIda.DcIdaResult =
  com.dogu.protocol.generated.inner.params.DcIdaResultKt.Dsl._create(this.toBuilder()).apply { block() }._build()

val com.dogu.protocol.generated.inner.params.DcIda.DcIdaResultOrBuilder.dcIdaRunappResultOrNull: com.dogu.protocol.generated.inner.types.DcIda.DcIdaRunAppResult?
  get() = if (hasDcIdaRunappResult()) getDcIdaRunappResult() else null

val com.dogu.protocol.generated.inner.params.DcIda.DcIdaResultOrBuilder.dcIdaGetSystemInfoResultOrNull: com.dogu.protocol.generated.inner.types.DcIda.DcIdaGetSystemInfoResult?
  get() = if (hasDcIdaGetSystemInfoResult()) getDcIdaGetSystemInfoResult() else null

val com.dogu.protocol.generated.inner.params.DcIda.DcIdaResultOrBuilder.dcIdaIsPortListeningResultOrNull: com.dogu.protocol.generated.inner.types.DcIda.DcIdaIsPortListeningResult?
  get() = if (hasDcIdaIsPortListeningResult()) getDcIdaIsPortListeningResult() else null

val com.dogu.protocol.generated.inner.params.DcIda.DcIdaResultOrBuilder.dcIdaQueryProfileResultOrNull: com.dogu.protocol.generated.inner.types.DcIda.DcIdaQueryProfileResult?
  get() = if (hasDcIdaQueryProfileResult()) getDcIdaQueryProfileResult() else null

val com.dogu.protocol.generated.inner.params.DcIda.DcIdaResultOrBuilder.dcGdcDaControlResultOrNull: com.dogu.protocol.generated.inner.types.CfGdcDa.CfGdcDaControlResult?
  get() = if (hasDcGdcDaControlResult()) getDcGdcDaControlResult() else null

