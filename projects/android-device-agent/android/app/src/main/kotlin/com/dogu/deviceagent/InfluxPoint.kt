package com.dogu.deviceagent

import java.util.*

class InfluxPoint(val measure:String) {
    private val tags: MutableMap<String, Any> = mutableMapOf<String, Any>()
    private val fields: MutableMap<String, Any> = mutableMapOf<String, Any>()

    fun addTag( key: String,  value: String): InfluxPoint {
        this.tags.put(key, value)
        return this
    }

    fun addField( key: String,  value: Boolean): InfluxPoint {
        this.fields.put(key, value)
        return this
    }

    fun addField( key: String,  value: Int): InfluxPoint {
        this.fields.put(key, value)
        return this
    }

    fun addField( key: String,  value: Long): InfluxPoint {
        this.fields.put(key, value)
        return this
    }

    fun addField( key: String,  value: Float): InfluxPoint {
        this.fields.put(key, value)
        return this
    }

    fun addField( key: String,  value: String): InfluxPoint {
        this.fields.put(key, value)
        return this
    }

    fun build(): String {
        var line = "${this.measure}"
        if(this.tags.isNotEmpty()){
            line += ","
            line += bulidKeyValueArrayToProtocol(this.tags)
        }
        line += " ${bulidKeyValueArrayToProtocol(this.fields)} ${timestamp()}"
        return line
    }


    private fun bulidKeyValueArrayToProtocol(map :MutableMap<String, Any>): String{
        val keyValueList = mutableListOf<String>()
        for(entry in map){
            val filteredKey = escapeChar(entry.key, ",= ")
            var filteredValue = entry.value
            if(entry.value is String){
                filteredValue = escapeChar(entry.value as String, ",= ")
            }
            keyValueList.add("${filteredKey}=${filteredValue}")
        }
        return keyValueList.joinToString(",")
    }

    private fun timestamp(): String{
        return "${Date().time}000000"
    }

    private fun escapeChar(origin:String, chars:String): String{
        var ret = origin;
        for(char in chars){
            ret = ret.replace("${char}", "\\${char}")
        }
        return ret
    }
}
