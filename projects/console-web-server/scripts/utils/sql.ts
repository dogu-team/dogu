export abstract class Sql<TConfig> {
  constructor(protected readonly config: TConfig) {}

  abstract on(fn: (context: any) => Promise<void> | void): Promise<void>;

  static async on(config: any, fn: (context: any) => Promise<void> | void): Promise<void> {
    const db = new (this as any)(config);
    await db.on(fn);
  }
}
