//Generated by the protocol buffer compiler. DO NOT EDIT!
// source: outer/device_auth.proto

package com.dogu.protocol.generated.outer;

@kotlin.jvm.JvmName("-initializedeviceTemporaryToken")
inline fun deviceTemporaryToken(block: com.dogu.protocol.generated.outer.DeviceTemporaryTokenKt.Dsl.() -> kotlin.Unit): com.dogu.protocol.generated.outer.DeviceAuth.DeviceTemporaryToken =
  com.dogu.protocol.generated.outer.DeviceTemporaryTokenKt.Dsl._create(com.dogu.protocol.generated.outer.DeviceAuth.DeviceTemporaryToken.newBuilder()).apply { block() }._build()
object DeviceTemporaryTokenKt {
  @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
  @com.google.protobuf.kotlin.ProtoDslMarker
  class Dsl private constructor(
    private val _builder: com.dogu.protocol.generated.outer.DeviceAuth.DeviceTemporaryToken.Builder
  ) {
    companion object {
      @kotlin.jvm.JvmSynthetic
      @kotlin.PublishedApi
      internal fun _create(builder: com.dogu.protocol.generated.outer.DeviceAuth.DeviceTemporaryToken.Builder): Dsl = Dsl(builder)
    }

    @kotlin.jvm.JvmSynthetic
    @kotlin.PublishedApi
    internal fun _build(): com.dogu.protocol.generated.outer.DeviceAuth.DeviceTemporaryToken = _builder.build()

    /**
     * <code>string value = 1;</code>
     */
    var value: kotlin.String
      @JvmName("getValue")
      get() = _builder.getValue()
      @JvmName("setValue")
      set(value) {
        _builder.setValue(value)
      }
    /**
     * <code>string value = 1;</code>
     */
    fun clearValue() {
      _builder.clearValue()
    }
  }
}
@kotlin.jvm.JvmSynthetic
inline fun com.dogu.protocol.generated.outer.DeviceAuth.DeviceTemporaryToken.copy(block: com.dogu.protocol.generated.outer.DeviceTemporaryTokenKt.Dsl.() -> kotlin.Unit): com.dogu.protocol.generated.outer.DeviceAuth.DeviceTemporaryToken =
  com.dogu.protocol.generated.outer.DeviceTemporaryTokenKt.Dsl._create(this.toBuilder()).apply { block() }._build()

