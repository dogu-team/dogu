import _m0 from 'protobufjs/minimal';
/**
 * `NullValue` is a singleton enumeration to represent the null value for the
 * `Value` type union.
 *
 *  The JSON representation for `NullValue` is JSON `null`.
 */
export declare enum NullValue {
    /** NULL_VALUE - Null value. */
    NULL_VALUE = 0,
    UNRECOGNIZED = -1
}
export declare function nullValueFromJSON(object: any): NullValue;
export declare function nullValueToJSON(object: NullValue): string;
/**
 * `Struct` represents a structured data value, consisting of fields
 * which map to dynamically typed values. In some languages, `Struct`
 * might be supported by a native representation. For example, in
 * scripting languages like JS a struct is represented as an
 * object. The details of that representation are described together
 * with the proto support for the language.
 *
 * The JSON representation for `Struct` is JSON object.
 */
export interface Struct {
    /** Unordered map of dynamically typed values. */
    fields: {
        [key: string]: any | undefined;
    };
}
export interface Struct_FieldsEntry {
    key: string;
    value: any | undefined;
}
/**
 * `Value` represents a dynamically typed value which can be either
 * null, a number, a string, a boolean, a recursive struct value, or a
 * list of values. A producer of value is expected to set one of these
 * variants. Absence of any variant indicates an error.
 *
 * The JSON representation for `Value` is JSON value.
 */
export interface Value {
    kind?: {
        $case: 'nullValue';
        nullValue: NullValue;
    } | {
        $case: 'numberValue';
        numberValue: number;
    } | {
        $case: 'stringValue';
        stringValue: string;
    } | {
        $case: 'boolValue';
        boolValue: boolean;
    } | {
        $case: 'structValue';
        structValue: {
            [key: string]: any;
        } | undefined;
    } | {
        $case: 'listValue';
        listValue: Array<any> | undefined;
    };
}
/**
 * `ListValue` is a wrapper around a repeated field of values.
 *
 * The JSON representation for `ListValue` is JSON array.
 */
export interface ListValue {
    /** Repeated field of dynamically typed values. */
    values: any[];
}
export declare const Struct: {
    encode(message: Struct, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Struct;
    fromJSON(object: any): Struct;
    toJSON(message: Struct): unknown;
    fromPartial<I extends {
        fields?: {
            [x: string]: any;
        } | undefined;
    } & {
        fields?: ({
            [x: string]: any;
        } & {
            [x: string]: any;
        } & { [K in Exclude<keyof I["fields"], string | number>]: never; }) | undefined;
    } & { [K_1 in Exclude<keyof I, "fields">]: never; }>(object: I): Struct;
    wrap(object: {
        [key: string]: any;
    } | undefined): Struct;
    unwrap(message: Struct): {
        [key: string]: any;
    };
};
export declare const Struct_FieldsEntry: {
    encode(message: Struct_FieldsEntry, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Struct_FieldsEntry;
    fromJSON(object: any): Struct_FieldsEntry;
    toJSON(message: Struct_FieldsEntry): unknown;
    fromPartial<I extends {
        key?: string | undefined;
        value?: any | undefined;
    } & {
        key?: string | undefined;
        value?: any | undefined;
    } & { [K in Exclude<keyof I, keyof Struct_FieldsEntry>]: never; }>(object: I): Struct_FieldsEntry;
};
export declare const Value: {
    encode(message: Value, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Value;
    fromJSON(object: any): Value;
    toJSON(message: Value): unknown;
    fromPartial<I extends {
        kind?: ({
            nullValue?: NullValue | undefined;
        } & {
            $case: "nullValue";
        }) | ({
            numberValue?: number | undefined;
        } & {
            $case: "numberValue";
        }) | ({
            stringValue?: string | undefined;
        } & {
            $case: "stringValue";
        }) | ({
            boolValue?: boolean | undefined;
        } & {
            $case: "boolValue";
        }) | ({
            structValue?: {
                [x: string]: any;
            } | undefined;
        } & {
            $case: "structValue";
        }) | ({
            listValue?: any[] | undefined;
        } & {
            $case: "listValue";
        }) | undefined;
    } & {
        kind?: ({
            nullValue?: NullValue | undefined;
        } & {
            $case: "nullValue";
        } & {
            nullValue?: NullValue | undefined;
            $case: "nullValue";
        } & { [K in Exclude<keyof I["kind"], "nullValue" | "$case">]: never; }) | ({
            numberValue?: number | undefined;
        } & {
            $case: "numberValue";
        } & {
            numberValue?: number | undefined;
            $case: "numberValue";
        } & { [K_1 in Exclude<keyof I["kind"], "numberValue" | "$case">]: never; }) | ({
            stringValue?: string | undefined;
        } & {
            $case: "stringValue";
        } & {
            stringValue?: string | undefined;
            $case: "stringValue";
        } & { [K_2 in Exclude<keyof I["kind"], "stringValue" | "$case">]: never; }) | ({
            boolValue?: boolean | undefined;
        } & {
            $case: "boolValue";
        } & {
            boolValue?: boolean | undefined;
            $case: "boolValue";
        } & { [K_3 in Exclude<keyof I["kind"], "boolValue" | "$case">]: never; }) | ({
            structValue?: {
                [x: string]: any;
            } | undefined;
        } & {
            $case: "structValue";
        } & {
            structValue?: ({
                [x: string]: any;
            } & {
                [x: string]: any;
            } & { [K_4 in Exclude<keyof I["kind"]["structValue"], string | number>]: never; }) | undefined;
            $case: "structValue";
        } & { [K_5 in Exclude<keyof I["kind"], "structValue" | "$case">]: never; }) | ({
            listValue?: any[] | undefined;
        } & {
            $case: "listValue";
        } & {
            listValue?: (any[] & any[] & { [K_6 in Exclude<keyof I["kind"]["listValue"], keyof any[]>]: never; }) | undefined;
            $case: "listValue";
        } & { [K_7 in Exclude<keyof I["kind"], "listValue" | "$case">]: never; }) | undefined;
    } & { [K_8 in Exclude<keyof I, "kind">]: never; }>(object: I): Value;
    wrap(value: any): Value;
    unwrap(message: Value): string | number | boolean | Object | null | Array<any> | undefined;
};
export declare const ListValue: {
    encode(message: ListValue, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ListValue;
    fromJSON(object: any): ListValue;
    toJSON(message: ListValue): unknown;
    fromPartial<I extends {
        values?: any[] | undefined;
    } & {
        values?: (any[] & any[] & { [K in Exclude<keyof I["values"], keyof any[]>]: never; }) | undefined;
    } & { [K_1 in Exclude<keyof I, "values">]: never; }>(object: I): ListValue;
    wrap(value: Array<any> | undefined): ListValue;
    unwrap(message: ListValue): Array<any>;
};
