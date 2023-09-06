package com.dogu.deviceagent.reflect


import android.view.InputEvent
import com.dogu.deviceagent.Logger

import java.lang.reflect.InvocationTargetException
import java.lang.reflect.Method

class InputManager(private val manager: Object) {
    @get:Throws(NoSuchMethodException::class)
    private var injectInputEventMethod: Method? = null
        private get() {
            if (field == null) {
                field = manager.javaClass.getMethod(
                    "injectInputEvent",
                    InputEvent::class.java,
                    Int::class.javaPrimitiveType
                )
            }
            return field
        }

    fun injectInputEvent(inputEvent: InputEvent?, mode: Int): Boolean {
        return try {
            val method = injectInputEventMethod
            method!!.invoke(manager, inputEvent, mode) as Boolean
        } catch (e: InvocationTargetException) {
            Logger.e("Could not invoke method $e")
            false
        } catch (e: IllegalAccessException) {
            Logger.e("Could not invoke method $e")
            false
        } catch (e: NoSuchMethodException) {
            Logger.e("Could not invoke method $e")
            false
        }
    }

    companion object {
        const val INJECT_INPUT_EVENT_MODE_ASYNC = 0
        const val INJECT_INPUT_EVENT_MODE_WAIT_FOR_RESULT = 1
        const val INJECT_INPUT_EVENT_MODE_WAIT_FOR_FINISH = 2

        @get:Throws(NoSuchMethodException::class)
        private var setDisplayIdMethod: Method? = null
            private get() {
                if (field == null) {
                    field =
                        InputEvent::class.java.getMethod(
                            "setDisplayId",
                            Int::class.javaPrimitiveType
                        )
                }
                return field
            }

        fun setDisplayId(inputEvent: InputEvent?, displayId: Int): Boolean {
            return try {
                val method = setDisplayIdMethod
                method!!.invoke(inputEvent, displayId)
                true
            } catch (e: InvocationTargetException) {
                Logger.e("Cannot associate a display id to the input event $e")
                false
            } catch (e: IllegalAccessException) {
                Logger.e("Cannot associate a display id to the input event $e")
                false
            } catch (e: NoSuchMethodException) {
                Logger.e("Cannot associate a display id to the input event $e")
                false
            }
        }
    }
}
