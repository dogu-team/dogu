export interface TaskQueueResultOk<Result> {
  error?: undefined;
  value: Result;
}
export interface TaskQueueResultFail {
  error: unknown;
}
export type TaskQueueResult<Result> = TaskQueueResultOk<Result> | TaskQueueResultFail;

export type TaskQueueListener<Result> = (result: TaskQueueResult<Result>) => void;

export class TaskQueueTask<Params, Result> {
  constructor(private readonly task: (params: Params) => Promise<Result>, private readonly listeners: TaskQueueListener<Result>[] = []) {}

  async run(params: Params): Promise<TaskQueueResult<Result>> {
    try {
      const result = await this.task(params);
      const ret = { value: result };
      for (const listener of this.listeners) {
        listener(ret);
      }
      return ret;
    } catch (e: unknown) {
      const ret = { error: e };
      for (const listener of this.listeners) {
        listener(ret);
      }
      return ret;
    }
  }

  addListener(listener: TaskQueueListener<Result>): void {
    this.listeners.push(listener);
  }
}

export class TaskQueue<Params, Result> {
  private queue: TaskQueueTask<Params, Result>[] = [];
  constructor() {}

  async scheduleAndWait(task: TaskQueueTask<Params, Result>): Promise<TaskQueueResult<Result>> {
    const promise = new Promise<TaskQueueResult<Result>>((resolve) => {
      task.addListener((result) => {
        resolve(result);
      });
      this.queue.push(task);
    });
    return await promise;
  }

  async consume(params: Params): Promise<TaskQueueResult<Result>> {
    const front = this.queue.shift();
    if (!front) {
      return { error: new Error('No task') };
    }
    return await front.run(params);
  }
}
