import { Printable } from '@dogu-tech/common';
import { DestState } from '@dogu-tech/types';
import { color, Colorizer, colorTemplate } from '../colorizer';
import { Exception } from './exception';
import { Job, JobChild } from './unit/job';

export class Tracker {
  private rootJob: Job;

  constructor(job: Job, private readonly printable: Printable) {
    this.rootJob = job;
  }

  print(): void {
    const badge = this.createBadge();
    const board = this.createBoard();
    const statistic = this.createStatistic();
    const totalElapsedSeconds = this.createTotalElapsedSeconds();
    const exceptions = this.createExceptions();

    console.log(badge);
    console.log(board);
    console.log(statistic);
    console.log(totalElapsedSeconds);

    for (const exception of exceptions) {
      this.printException(exception);
    }
  }

  private createBadge(): string {
    switch (this.rootJob.state) {
      case 'passed':
        return color.bgGreen('  PASS  ');
      default:
        return color.bgRed('  FAIL  ');
    }
  }

  private createBoard(): string {
    const getUnitEmoji = (state: DestState): string => {
      switch (state) {
        case 'passed':
          return color.green('✓');
        case 'failed':
          return color.red('✕');
        case 'skipped':
          return color.yellowBright('-');
        case 'pending':
          return colorTemplate.orange('●');
        case 'running':
          return color.blueBright('●');
        default:
          return color.white('?');
      }
    };

    const getJobBgColor = (state: DestState): Colorizer => {
      switch (state) {
        case 'passed':
          return color.green;
        case 'failed':
          return color.red;
        case 'skipped':
          return color.yellowBright;
        default:
          return color.white;
      }
    };

    const format = (children: JobChild[], indent: number): string => {
      let result = '';

      for (const child of children) {
        const name = child.name;
        const identStr = ' '.repeat(indent);

        if (child instanceof Job) {
          const color = getJobBgColor(child.state);
          result += `${identStr}${color(` ${name} `)}\n`;
          result += format(child.children, indent + 2);
        } else {
          const emoji: string = getUnitEmoji(child.state);
          result += `${identStr}${emoji} ${name}`;

          if (child.state !== 'skipped' && child.state !== 'pending') {
            result += ` (${child.timer.elapsedSeconds.toFixed(1)}s)`;
          }

          result += '\n';
        }
      }

      return result;
    };

    const board = format([this.rootJob], 0);
    return board;
  }

  private createExceptions(): Exception[] {
    const search = (children: JobChild[]): void => {
      for (const child of children) {
        if (child instanceof Job) {
          search(child.children);
        } else {
          if (child.exception !== null) {
            exceptions.push(child.exception);
          }
        }
      }
    };

    const exceptions: Exception[] = [];
    search(this.rootJob.children);

    return exceptions;
  }

  private createStatistic(): string {
    const statistic = this.rootJob.getStatistic();

    let statisticStr = '';
    statisticStr += `Total    |  ${statistic.totalJob} jobs  |  ${statistic.totalTest} tests\n`;
    statisticStr += '-------------------------------\n';
    statisticStr += `${color.bgGreen('Passed ')}  |  ${statistic.passedJob} jobs  |  ${statistic.passedTest} tests\n`;
    statisticStr += `${color.bgRed('Failed ')}  |  ${statistic.failedJob} jobs  |  ${statistic.failedTest} tests\n`;
    statisticStr += `${color.bgYellow('Skipped')}  |  ${statistic.skippedJob} jobs  |  ${statistic.skippedTest} tests\n`;
    statisticStr += `${colorTemplate.bgOrange('Pending')}  |  ${statistic.pendingJob} jobs  |  ${statistic.pendingTest} tests`;

    return statisticStr;
  }

  private createTotalElapsedSeconds(): string {
    const search = (children: JobChild[]): number => {
      let totalElapsedSeconds = 0;

      for (const child of children) {
        if (child instanceof Job) {
          totalElapsedSeconds += search(child.children);
        } else {
          totalElapsedSeconds += Number(child.timer.elapsedSeconds);
        }
      }

      return totalElapsedSeconds;
    };

    const totalElapsedSeconds = search([this.rootJob]);

    return `Total Time: ${totalElapsedSeconds.toFixed(1)}s`;
  }

  private printException(exception: Exception): void {
    let currentException: Exception | undefined = exception;
    console.error(`› ${color.bgRed(` ${currentException.scope} `)}`);
    if (currentException.callStack && 0 < currentException.callStack.length) {
      console.error(`  ${currentException.callStack}\n\n`);
    } else {
      console.error(`  ${currentException.message}\n\n`);
    }

    currentException = currentException.cause;
    while (null != currentException) {
      console.error(`  caused by`);
      if (currentException.callStack && 0 < currentException.callStack.length) {
        console.error(`  ${currentException.callStack}\n\n`);
      } else {
        console.error(`  ${currentException.message}\n\n`);
      }
      currentException = currentException.cause;
    }
  }
}
