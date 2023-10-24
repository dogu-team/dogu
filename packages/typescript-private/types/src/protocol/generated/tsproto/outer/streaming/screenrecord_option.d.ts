import _m0 from 'protobufjs/minimal';
import { ScreenCaptureOption } from './screencapture_option';
export interface ScreenRecordOption {
    screen: ScreenCaptureOption | undefined;
    filePath: string;
    etcParam?: string | undefined;
}
export declare const ScreenRecordOption: {
    encode(message: ScreenRecordOption, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ScreenRecordOption;
    fromJSON(object: any): ScreenRecordOption;
    toJSON(message: ScreenRecordOption): unknown;
    fromPartial<I extends {
        screen?: {
            bitRate?: number | undefined;
            maxFps?: number | undefined;
            frameRate?: number | undefined;
            frameInterval?: number | undefined;
            repeatFrameDelay?: number | undefined;
            maxResolution?: number | undefined;
            screenId?: number | undefined;
            pid?: number | undefined;
        } | undefined;
        filePath?: string | undefined;
        etcParam?: string | undefined;
    } & {
        screen?: ({
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
        } & { [K in Exclude<keyof I["screen"], keyof ScreenCaptureOption>]: never; }) | undefined;
        filePath?: string | undefined;
        etcParam?: string | undefined;
    } & { [K_1 in Exclude<keyof I, keyof ScreenRecordOption>]: never; }>(object: I): ScreenRecordOption;
};
