package com.dogu.deviceagent.reflect

import android.os.IInterface
import android.util.Log
import com.dogu.deviceagent.Logger
import com.dogu.deviceagent.util.Constants
import com.dogu.deviceagent.util.Strings
import kotlin.reflect.KClass


class ReflectObject(private val className: String?, private var instance: Any? = null) {
    private var cls: Class<*>

    init {
        try {
            if (null != className) {
                cls = Class.forName(className)
            } else {
                cls = Class.forName(instance!!.javaClass.name)
            }
        } catch (e: Exception) {
            throw e
        }
    }

    fun getInstance(): Any? {
        return instance
    }

    fun <T : Any> createInstance(vararg args: Any): ReflectObject {
        Logger.v(
            "ReflectObject.createInstance c: ${cls.getDeclaredConstructor()}"
        )
        instance = cls.getDeclaredConstructor().newInstance(*args) as? T
        return this
    }

    fun createInstanceHidden(vararg args: Any): ReflectObject {
        Logger.v(

            "ReflectObject.createInstance c: ${
                cls.getDeclaredConstructor()
            }"
        )
        val constructor = cls.getDeclaredConstructor()

        constructor.isAccessible = true
        instance =
            constructor.newInstance(*args)
        return this
    }

    fun <T : Any> call(
        returnType: KClass<T>,
        methodName: String,
        vararg args: Pair<KClass<*>, Any>
    ): T {
        return callInternal(returnType, cls, instance, methodName, *args)
    }

    fun <T : Any> callStatic(
        returnType: KClass<T>,
        methodName: String,
        vararg args: Pair<KClass<*>, Any>
    ): T {
        return callInternal(returnType, cls, instance, methodName, *args)
    }

    fun <T : Any> get(c: KClass<T>, fieldName: String): T {
        return getInternal(c, cls, instance, fieldName)
    }

    fun <T : Any> getStatic(c: KClass<T>, fieldName: String): T {
        return getInternal(c, cls, instance, fieldName)
    }

//    fun set(fieldName: String, value: Any) {
//        try {
//            val getDefaultMethod = cls.getDeclaredMethod("getDefault");
//            val am = getDefaultMethod.invoke(null) as IInterface;
//
//        } catch (e: Exception) {
//            throw e;
//        }
//    }
//
//    fun setStatic(fieldName: String, value: Any) {
//        try {
//            val getDefaultMethod = cls.getDeclaredMethod("getDefault");
//            val am = getDefaultMethod.invoke(null) as IInterface;
//
//        } catch (e: Exception) {
//            throw e;
//        }
//    }

    companion object {

        private fun <T : Any> callInternal(
            returnClassType: KClass<T>,
            cls: Class<*>,
            instance: Any?,
            methodName: String,
            vararg args: Pair<KClass<*>, Any>
        ): T {
            try {
                val convertedArgs = args.map {
                    if (it.second::class == ReflectObject::class) {
                        Pair(it.first, (it.second as ReflectObject)!!.instance!!)
                    } else {
                        it
                    }
                }.toTypedArray()

                val convertedArgTypes = convertedArgs.map {
                    it.first.java
                }.toTypedArray()

                val convertedArgValues = convertedArgs.map {
                    it.second
                }.toTypedArray()

                Logger.v(

                    "ReflectObject.callInternal class: $cls, inst:$instance, method: $methodName, argTypes: ${
                        Strings.stringify(
                            convertedArgTypes
                        )
                    } args: ${
                        Strings.stringify(
                            convertedArgValues
                        )
                    }}"
                )


                var ret: Any
                if (0 == convertedArgs.count()) {
                    val method = cls.getDeclaredMethod(methodName);
                    if (returnClassType == Void::class) {
                        method.invoke(instance);
                        return Unit as T
                    }
                    ret = method.invoke(instance);
                } else {
                    val method = cls.getDeclaredMethod(methodName, *convertedArgTypes);

                    if (returnClassType == Void::class) {
                        method.invoke(instance, *convertedArgValues);
                        return Unit as T
                    }
                    ret = method.invoke(instance, *convertedArgValues);
                }
                if (returnClassType == ReflectObject::class) {
                    return ReflectObject(null, ret) as T
                }
                return ret as T
            } catch (e: Exception) {

                Logger.v(

                    "ReflectObject.callInternal failed allMethods: ${Strings.stringify(cls.methods)}"
                )

                throw e
            }
        }

        private fun <T : Any> getInternal(
            c: KClass<T>,
            cls: Class<*>,
            instance: Any?,
            fieldName: String
        ): T {
            try {
                val field = cls.getDeclaredField(fieldName);
                field.isAccessible = true
                val value = field.get(instance)
                if (c == ReflectObject::class) {
                    return ReflectObject(null, value) as T
                }
                return value as T
            } catch (e: Exception) {
                throw e;
            }
        }
    }
}
