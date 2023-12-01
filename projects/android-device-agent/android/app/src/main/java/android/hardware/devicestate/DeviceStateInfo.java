/*
 * Copyright (C) 2021 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package android.hardware.devicestate;

import android.os.Parcel;
import android.os.Parcelable;

import androidx.annotation.NonNull;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.util.Arrays;
import java.util.Objects;
import java.util.concurrent.Executor;
/**
 * Information about the state of the device.
 *
 * @hide
 */
public final class DeviceStateInfo implements Parcelable {
    public final int[] supportedStates = new int[0];
    public final int baseState = 0;

    /**
     * The state of the device.
     */
    public final int currentState = 0;

    protected DeviceStateInfo(Parcel in) {
    }

    public static final Creator<DeviceStateInfo> CREATOR = new Creator<DeviceStateInfo>() {
        @Override
        public DeviceStateInfo createFromParcel(Parcel in) {
            return new DeviceStateInfo(in);
        }

        @Override
        public DeviceStateInfo[] newArray(int size) {
            return new DeviceStateInfo[size];
        }
    };

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(@NonNull Parcel dest, int flags) {
    }
}
