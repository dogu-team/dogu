type TsProtoOneOfSchema = {
  [key: string]: any;
  value?: {
    $case: string;
    [key: string]: any;
  };
};
type UnionValues<Message extends TsProtoOneOfSchema> = NonNullable<Message['value']>;
export type UnionValueKeys<Message extends TsProtoOneOfSchema> = UnionValues<Message>['$case'];
export type UnionValuePick<Message extends TsProtoOneOfSchema, Key> = Extract<
  UnionValues<Message>,
  {
    $case: Key;
  }
>;
export type UnionValuePickInner<Message extends TsProtoOneOfSchema, Key extends keyof UnionValuePick<Message, Key>> = UnionValuePick<Message, Key>[Key];
