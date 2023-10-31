export class Service {
  private readonly name: string;
  private readonly func: () => Promise<void>;

  constructor(name: string, func: () => Promise<void>) {
    this.name = name;
    this.func = func;
  }

  public async run(): Promise<void> {
    await this.func();
  }
}
