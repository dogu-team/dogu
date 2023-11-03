export class Executor {
  private readonly name: string;
  private readonly func: (arsg: any) => Promise<void>;

  constructor(name: string, func: (args: any) => Promise<void>) {
    this.name = name;
    this.func = func;
  }

  public async run(args: any): Promise<void> {
    await this.func(args);
  }
}
