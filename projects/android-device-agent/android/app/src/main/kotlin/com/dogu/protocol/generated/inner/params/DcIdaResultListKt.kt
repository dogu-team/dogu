//Generated by the protocol buffer compiler. DO NOT EDIT!
// source: inner/params/dc_ida.proto

package com.dogu.protocol.generated.inner.params;

@kotlin.jvm.JvmName("-initializedcIdaResultList")
inline fun dcIdaResultList(block: com.dogu.protocol.generated.inner.params.DcIdaResultListKt.Dsl.() -> kotlin.Unit): com.dogu.protocol.generated.inner.params.DcIda.DcIdaResultList =
  com.dogu.protocol.generated.inner.params.DcIdaResultListKt.Dsl._create(com.dogu.protocol.generated.inner.params.DcIda.DcIdaResultList.newBuilder()).apply { block() }._build()
object DcIdaResultListKt {
  @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
  @com.google.protobuf.kotlin.ProtoDslMarker
  class Dsl private constructor(
    private val _builder: com.dogu.protocol.generated.inner.params.DcIda.DcIdaResultList.Builder
  ) {
    companion object {
      @kotlin.jvm.JvmSynthetic
      @kotlin.PublishedApi
      internal fun _create(builder: com.dogu.protocol.generated.inner.params.DcIda.DcIdaResultList.Builder): Dsl = Dsl(builder)
    }

    @kotlin.jvm.JvmSynthetic
    @kotlin.PublishedApi
    internal fun _build(): com.dogu.protocol.generated.inner.params.DcIda.DcIdaResultList = _builder.build()

    /**
     * An uninstantiable, behaviorless type to represent the field in
     * generics.
     */
    @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
    class ResultsProxy private constructor() : com.google.protobuf.kotlin.DslProxy()
    /**
     * <code>repeated .inner.params.DcIdaResult results = 1;</code>
     */
     val results: com.google.protobuf.kotlin.DslList<com.dogu.protocol.generated.inner.params.DcIda.DcIdaResult, ResultsProxy>
      @kotlin.jvm.JvmSynthetic
      get() = com.google.protobuf.kotlin.DslList(
        _builder.getResultsList()
      )
    /**
     * <code>repeated .inner.params.DcIdaResult results = 1;</code>
     * @param value The results to add.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("addResults")
    fun com.google.protobuf.kotlin.DslList<com.dogu.protocol.generated.inner.params.DcIda.DcIdaResult, ResultsProxy>.add(value: com.dogu.protocol.generated.inner.params.DcIda.DcIdaResult) {
      _builder.addResults(value)
    }
    /**
     * <code>repeated .inner.params.DcIdaResult results = 1;</code>
     * @param value The results to add.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("plusAssignResults")
    @Suppress("NOTHING_TO_INLINE")
    inline operator fun com.google.protobuf.kotlin.DslList<com.dogu.protocol.generated.inner.params.DcIda.DcIdaResult, ResultsProxy>.plusAssign(value: com.dogu.protocol.generated.inner.params.DcIda.DcIdaResult) {
      add(value)
    }
    /**
     * <code>repeated .inner.params.DcIdaResult results = 1;</code>
     * @param values The results to add.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("addAllResults")
    fun com.google.protobuf.kotlin.DslList<com.dogu.protocol.generated.inner.params.DcIda.DcIdaResult, ResultsProxy>.addAll(values: kotlin.collections.Iterable<com.dogu.protocol.generated.inner.params.DcIda.DcIdaResult>) {
      _builder.addAllResults(values)
    }
    /**
     * <code>repeated .inner.params.DcIdaResult results = 1;</code>
     * @param values The results to add.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("plusAssignAllResults")
    @Suppress("NOTHING_TO_INLINE")
    inline operator fun com.google.protobuf.kotlin.DslList<com.dogu.protocol.generated.inner.params.DcIda.DcIdaResult, ResultsProxy>.plusAssign(values: kotlin.collections.Iterable<com.dogu.protocol.generated.inner.params.DcIda.DcIdaResult>) {
      addAll(values)
    }
    /**
     * <code>repeated .inner.params.DcIdaResult results = 1;</code>
     * @param index The index to set the value at.
     * @param value The results to set.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("setResults")
    operator fun com.google.protobuf.kotlin.DslList<com.dogu.protocol.generated.inner.params.DcIda.DcIdaResult, ResultsProxy>.set(index: kotlin.Int, value: com.dogu.protocol.generated.inner.params.DcIda.DcIdaResult) {
      _builder.setResults(index, value)
    }
    /**
     * <code>repeated .inner.params.DcIdaResult results = 1;</code>
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("clearResults")
    fun com.google.protobuf.kotlin.DslList<com.dogu.protocol.generated.inner.params.DcIda.DcIdaResult, ResultsProxy>.clear() {
      _builder.clearResults()
    }

  }
}
@kotlin.jvm.JvmSynthetic
inline fun com.dogu.protocol.generated.inner.params.DcIda.DcIdaResultList.copy(block: com.dogu.protocol.generated.inner.params.DcIdaResultListKt.Dsl.() -> kotlin.Unit): com.dogu.protocol.generated.inner.params.DcIda.DcIdaResultList =
  com.dogu.protocol.generated.inner.params.DcIdaResultListKt.Dsl._create(this.toBuilder()).apply { block() }._build()

