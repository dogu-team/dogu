# @dogu-tech/dest

Library for running test cases.  
Created to run on Dogu Routine, but designed to run independently without Dogu Routine.

## Descriptions

### `Dest.describe((context: DestContext) => void)`

`describe()` is a function that creates a test collection.  
The context contains the logger in the dest.

### `Dest.withOptions(options: DestOptions).describe((context: DestContext) => void)`

`withOptions()` is a function that creates a test collection with options.  
options are described below.

### `job(name, () => void)`

Job is a collection of test cases.  
at least one job is required.  
allow nested jobs.

### `test(name, () => Promise<void> | void)`

Test is a function that runs a test case.  
must be used in job.  
if failed test exists, the job will fail and the next test will not be executed.

### `beforeAll(() => Promise<void> | void)`

called before all tests in the same level.

### `afterAll(() => Promise<void> | void)`

called after all tests in the same level.

### `beforeEach(() => Promise<void> | void)`

called before each test.

### `afterEach(() => Promise<void> | void)`

called after each test.

## Options

| property  | required/optional | type    | default | description        |
| :-------- | :---------------- | :-----  | :------ | :----------------- |
| timeout   | optional          | number  | 60000   | execution timeout. |
| logToFile | optional          | boolean | false   | log to file.       |

## Usage

### run with default options

If used without `Dest.withOptions()`, the default option is used.

```typescript
import { Dest, job, test } from '@dogu-tech/dest';

Dest.describe(({ logger }) => {
  job('my first test', () => {
    test('my first test case', () => {
      logger.info('hello world');
    });
  });
});
```

### run with options

If you use `withOptions()` you can change the option value instead of the default option.

```typescript
import { Dest, job, test } from '@dogu-tech/dest';

Dest.withOptions({
  timeout: 60 * 60 * 1000, // 1 hour
  logToFile: true,
}).describe(({ logger }) => {
  job('my first test', () => {
    test('my first test case', () => {
      logger.info('hello world');
    });
  });
});
```

### run without job

At least one job is required. If there is no job, an exception occurs.

```typescript
import { Dest, job, test } from '@dogu-tech/dest';

Dest.describe(({ logger }) => {
  // ❌ this will throw an error. you must use job() to create a job.
  test('my first test case', () => {
    logger.info('hello world');
  });

  // ✅ this is ok.
  job('my first job', () => {
    test('my first test case', () => {
      logger.info('hello world');
    });
  });
});
```

### run with nested jobs

```typescript
import { Dest, job, test } from '@dogu-tech/dest';

Dest.describe(({ logger }) => {
  // ✅ nested jobs
  job('my first test', () => {
    job('my nested test', () => {
      test('my second test case', () => {
        logger.info('hello world');
      });
    });
  });

  // ❌ nested tests. this will throw an error.
  job('my second test', () => {
    test('my second test case', () => {
      test('my nested test case', () => {
        logger.info('hello world');
      });
    });
  });
});
```

### run with beforeAll, afterAll

This is useful for initialization and cleanup operations.
write what you want to initialize in `beforeAll()` and what you want to clean up in `afterAll()`.

```typescript
import { afterAll, beforeAll, Dest, job, test } from '@dogu-tech/dest';

Dest.describe(({ logger }) => {
  job('my first test', () => {
    beforeAll(() => {
      logger.info('beforeAll');
    });

    // this called after same level tests
    afterAll(() => {
      logger.info('afterAll');
    });

    test('my first test case', () => {
      logger.info('hello world');
    });

    test('my second test case', () => {
      logger.info('hello world');
    });
  });
});
```

log output:

```sh
 my first test 
  ✓ beforeAll (0.0s)
  ✓ my first test case (0.0s)
  ✓ my second test case (0.0s)
  ✓ afterAll (0.0s)
```

### run with beforeEach, afterEach

`beforeEach()` and `afterEach()` are useful when each test requires the same initialization and cleanup.

```typescript
import { afterEach, beforeEach, Dest, job, test } from '@dogu-tech/dest';

Dest.describe(({ logger }) => {
  job('my first test', () => {
    beforeEach(() => {
      logger.info('beforeEach');
    });

    // this called after each test
    afterEach(() => {
      logger.info('afterEach');
    });

    test('my first test case', () => {
      logger.info('hello world');
    });

    test('my second test case', () => {
      logger.info('hello world');
    });
  });
});
```

log output:

```sh
my first test 
  ✓ beforeEach (0.0s)
  ✓ my first test case (0.0s)
  ✓ afterEach (0.0s)
  ✓ beforeEach (0.0s)
  ✓ my second test case (0.0s)
  ✓ afterEach (0.0s)
```

### run with timeout

If the test takes longer than the timeout, the test will fail.

```typescript
import { Dest, job, test } from '@dogu-tech/dest';

Dest.withOptions({
  timeout: 1000, // 1 seconds
}).describe(({ logger }) => {
  job('my first test', () => {
    test('my first test case', () => {
      logger.info('hello world');
    });

    test('my second test case', async () => {
      logger.info('hello world');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });
  });
});
```

log output:

```sh
  FAIL  
 my first test 
  ✓ my first test case (0.0s)
  ✕ my second test case (1.0s)
```
