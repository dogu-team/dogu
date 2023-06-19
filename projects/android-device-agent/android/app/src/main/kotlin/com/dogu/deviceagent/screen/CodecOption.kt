package com.dogu.deviceagent.screen

class CodecOption(val key: String, val value: Any) {

    companion object {
        fun parse(codecOptions: String): List<CodecOption>? {
            if (codecOptions.isEmpty()) {
                return null
            }
            val result: MutableList<CodecOption> = ArrayList()
            var escape = false
            val buf = StringBuilder()
            for (c in codecOptions.toCharArray()) {
                when (c) {
                    '\\' -> escape = if (escape) {
                        buf.append('\\')
                        false
                    } else {
                        true
                    }
                    ',' -> if (escape) {
                        buf.append(',')
                        escape = false
                    } else {
                        // This comma is a separator between codec options
                        val codecOption = buf.toString()
                        result.add(parseOption(codecOption))
                        // Clear buf
                        buf.setLength(0)
                    }
                    else -> buf.append(c)
                }
            }
            if (buf.length > 0) {
                val codecOption = buf.toString()
                result.add(parseOption(codecOption))
            }
            return result
        }

        private fun parseOption(option: String): CodecOption {
            val equalSignIndex = option.indexOf('=')
            require(equalSignIndex != -1) { "'=' expected" }
            val keyAndType = option.substring(0, equalSignIndex)
            require(keyAndType.length != 0) { "Key may not be null" }
            val key: String
            val type: String
            val colonIndex = keyAndType.indexOf(':')
            if (colonIndex != -1) {
                key = keyAndType.substring(0, colonIndex)
                type = keyAndType.substring(colonIndex + 1)
            } else {
                key = keyAndType
                type = "int" // assume int by default
            }
            val value: Any
            val valueString = option.substring(equalSignIndex + 1)
            value = when (type) {
                "int" -> valueString.toInt()
                "long" -> valueString.toLong()
                "float" -> valueString.toFloat()
                "string" -> valueString
                else -> throw IllegalArgumentException("Invalid codec option type (int, long, float, str): $type")
            }
            return CodecOption(key, value)
        }
    }
}
