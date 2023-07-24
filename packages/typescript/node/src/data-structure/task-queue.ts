export interface TaskQueueResultOk<Result> {
  success: true;
  value: Result;
}
export interface TaskQueueResultFail {
  success: false;
  error: unknown;
}
export type TaskQueueResult<Result> = TaskQueueResultOk<Result> | TaskQueueResultFail;

export type TaskQueueListener<Result> = (result: TaskQueueResult<Result>) => void;

export abstract class TaskQueueTask<Result> {
  constructor(private readonly task: () => Promise<Result>, private readonly listeners: TaskQueueListener<Result>[] = []) {}

  async run(): Promise<TaskQueueResult<Result>> {
    try {
      const result = await this.task();
      const ret = { success: true, value: result } as TaskQueueResultOk<Result>;
      for (const listener of this.listeners) {
        listener(ret);
      }
      return ret;
    } catch (e: unknown) {
      const ret = { success: false, error: e } as TaskQueueResultFail;
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
export class TaskQueue<Result, Task extends TaskQueueTask<Result>> {
  private queue: Task[] = [];
  constructor() {}

  async scheduleAndWait(task: Task): Promise<TaskQueueResult<Result>> {
    const promise = new Promise<TaskQueueResult<Result>>((resolve) => {
      task.addListener((result) => {
        resolve(result);
      });
      this.queue.push(task);
    });
    return await promise;
  }

  schedule(task: Task): void {
    this.queue.push(task);
  }

  async consume(): Promise<TaskQueueResult<Result>> {
    const front = this.queue.shift();
    if (!front) {
      return { success: false, error: new Error('No task') };
    }
    return await front.run();
  }

  pop(): Task | null {
    const front = this.queue.shift();
    if (!front) {
      return null;
    }
    return front;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }
}
