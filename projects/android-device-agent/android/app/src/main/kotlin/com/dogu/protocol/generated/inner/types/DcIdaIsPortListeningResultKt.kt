//Generated by the protocol buffer compiler. DO NOT EDIT!
// source: inner/types/dc_ida.proto

package com.dogu.protocol.generated.inner.types;

@kotlin.jvm.JvmName("-initializedcIdaIsPortListeningResult")
inline fun dcIdaIsPortListeningResult(block: com.dogu.protocol.generated.inner.types.DcIdaIsPortListeningResultKt.Dsl.() -> kotlin.Unit): com.dogu.protocol.generated.inner.types.DcIda.DcIdaIsPortListeningResult =
  com.dogu.protocol.generated.inner.types.DcIdaIsPortListeningResultKt.Dsl._create(com.dogu.protocol.generated.inner.types.DcIda.DcIdaIsPortListeningResult.newBuilder()).apply { block() }._build()
object DcIdaIsPortListeningResultKt {
  @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
  @com.google.protobuf.kotlin.ProtoDslMarker
  class Dsl private constructor(
    private val _builder: com.dogu.protocol.generated.inner.types.DcIda.DcIdaIsPortListeningResult.Builder
  ) {
    companion object {
      @kotlin.jvm.JvmSynthetic
      @kotlin.PublishedApi
      internal fun _create(builder: com.dogu.protocol.generated.inner.types.DcIda.DcIdaIsPortListeningResult.Builder): Dsl = Dsl(builder)
    }

    @kotlin.jvm.JvmSynthetic
    @kotlin.PublishedApi
    internal fun _build(): com.dogu.protocol.generated.inner.types.DcIda.DcIdaIsPortListeningResult = _builder.build()

    /**
     * <code>bool is_listening = 1;</code>
     */
    var isListening: kotlin.Boolean
      @JvmName("getIsListening")
      get() = _builder.getIsListening()
      @JvmName("setIsListening")
      set(value) {
        _builder.setIsListening(value)
      }
    /**
     * <code>bool is_listening = 1;</code>
     */
    fun clearIsListening() {
      _builder.clearIsListening()
    }
  }
}
@kotlin.jvm.JvmSynthetic
inline fun com.dogu.protocol.generated.inner.types.DcIda.DcIdaIsPortListeningResult.copy(block: com.dogu.protocol.generated.inner.types.DcIdaIsPortListeningResultKt.Dsl.() -> kotlin.Unit): com.dogu.protocol.generated.inner.types.DcIda.DcIdaIsPortListeningResult =
  com.dogu.protocol.generated.inner.types.DcIdaIsPortListeningResultKt.Dsl._create(this.toBuilder()).apply { block() }._build()
