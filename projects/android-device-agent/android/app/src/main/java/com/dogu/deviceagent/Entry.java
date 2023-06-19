package com.dogu.deviceagent;

import android.os.Build;
import android.util.Log;

import com.dogu.deviceagent.util.Constants;

import java.lang.reflect.Field;


public class Entry {
    public static void main(String... args) {
        Log.v("deviceagent", "Entry.main");

        try {
            KotlinEntry.Companion.main(args);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
