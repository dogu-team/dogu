export abstract class Processor {
  abstract process(): Promise<void>;
}
