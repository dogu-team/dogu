export async function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function* loop(delayMilliseconds: number, count = Infinity): AsyncGenerator<void> {
  for (let i = 0; ; ) {
    if (count !== Infinity) {
      if (!(i < count)) {
        break;
      }
    }
    yield;
    await delay(delayMilliseconds);
    if (count !== Infinity) {
      i++;
    }
  }
}
