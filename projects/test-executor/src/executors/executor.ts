export abstract class Executor {
  abstract init(): void;
  abstract run(): Promise<void>;
}
