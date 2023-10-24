import _m0 from 'protobufjs/minimal';
export interface ScreenCaptureOption {
    /**
     * (android): available
     * (ios): ignored
     */
    bitRate?: number | undefined;
    /**
     * (android): available
     * https://developer.android.com/reference/android/media/MediaFormat#KEY_MAX_FPS_TO_ENCODER
     *
     * (ios): ignored
     */
    maxFps?: number | undefined;
    /**
     * (android): available
     * https://developer.android.com/reference/android/media/MediaFormat#KEY_FRAME_RATE
     *
     * (ios): ignored
     */
    frameRate?: number | undefined;
    /**
     * (android): available
     * https://developer.android.com/reference/android/media/MediaFormat#KEY_I_FRAME_INTERVAL
     *
     * (ios): ignored
     */
    frameInterval?: number | undefined;
    /**
     * (android): available
     * https://developer.android.com/reference/android/media/MediaFormat#KEY_REPEAT_PREVIOUS_FRAME_AFTER
     *
     * (ios): ignored
     */
    repeatFrameDelay?: number | undefined;
    /**
     * (android): available
     * Currently processed as height value among width x height
     * ex) 1920, 1600, 1280, 1024, 800, 640, 320
     *
     * (ios): available
     * In the case of iOS, the device changes to the available resolution preset
     * according to the input value. 2160 <= max_resolution        -> 3840x2160
     * 1080 <= max_resolution < 2160 -> 1920x1080
     *  720 <= max_resolution < 1080 -> 1280x720
     * ...                           -> 960x540
     * ...                           -> 640x480
     * ...                           -> 352x288
     * ...                           -> 320x240
     */
    maxResolution?: number | undefined;
    /** Used for desktop platform */
    screenId?: number | undefined;
    /**
     * Used for desktop platform
     * If pid paaed. capture pid's window
     */
    pid?: number | undefined;
}
export declare const ScreenCaptureOption: {
    encode(message: ScreenCaptureOption, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ScreenCaptureOption;
    fromJSON(object: any): ScreenCaptureOption;
    toJSON(message: ScreenCaptureOption): unknown;
    fromPartial<I extends {
        bitRate?: number | undefined;
        maxFps?: number | undefined;
        frameRate?: number | undefined;
        frameInterval?: number | undefined;
        repeatFrameDelay?: number | undefined;
        maxResolution?: number | undefined;
        screenId?: number | undefined;
        pid?: number | undefined;
    } & {
        bitRate?: number | undefined;
        maxFps?: number | undefined;
        frameRate?: number | undefined;
        frameInterval?: number | undefined;
        repeatFrameDelay?: number | undefined;
        maxResolution?: number | undefined;
        screenId?: number | undefined;
        pid?: number | undefined;
    } & { [K in Exclude<keyof I, keyof ScreenCaptureOption>]: never; }>(object: I): ScreenCaptureOption;
};
