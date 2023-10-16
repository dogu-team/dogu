import moment from 'moment';

export const localizeDate = (date: Date): Date => {
  return moment(moment.utc(date).toDate()).local().toDate();
};

export const addZeroBeforeString = (str: string) => {
  return `${str.length > 1 ? str : '0' + str}`;
};

const convertSingularOrPlural = (word: string, count: number): string => {
  return count > 1 ? word + 's' : word;
};

export const stringifyPipelineCreatedAt = (createdAt: Date): string => {
  const createdAtTime = createdAt.getTime();
  const current = new Date();
  const currentTime = current.getTime();

  const timeDiff = currentTime - createdAtTime;

  if (timeDiff < 1000 * 60) {
    return `${Math.floor(timeDiff / 1000)} seconds ago`;
  }

  if (timeDiff < 1000 * 60 * 60) {
    const diff = Math.floor(timeDiff / (1000 * 60));
    return `${diff} ${convertSingularOrPlural('minute', diff)} ago`;
  }

  if (timeDiff < 1000 * 60 * 60 * 24) {
    const diff = Math.floor(timeDiff / (1000 * 60 * 60));
    return `${diff} ${convertSingularOrPlural('hour', diff)} ago`;
  }

  if (timeDiff < 1000 * 60 * 60 * 24 * 7) {
    const diff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    return `${diff} ${convertSingularOrPlural('day', diff)} ago`;
  }

  if (timeDiff < 1000 * 60 * 60 * 24 * 7 * 5) {
    const diff = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 7));
    return `${diff} ${convertSingularOrPlural('week', diff)} ago`;
  }

  if (current.getFullYear() === createdAt.getFullYear()) {
    const diff = current.getMonth() - createdAt.getMonth();
    return `${diff} ${convertSingularOrPlural('month', diff)} ago`;
  }

  if (current.getFullYear() - createdAt.getFullYear() === 1 && current.getMonth() < createdAt.getMonth()) {
    const diff = 12 + current.getMonth() - createdAt.getMonth();
    return `${diff} ${convertSingularOrPlural('month', diff)} ago`;
  }

  const diff = current.getFullYear() - createdAt.getFullYear();
  return `${diff} ${convertSingularOrPlural('year', diff)} ago`;
};

/**
 * get date of first month date. ex) 2020-12-20 to 2020-12-01
 * @param localizedDate
 * @returns localized date
 */
export const getFirstOfMonthDate = (localizedDate?: Date): Date => {
  const now = new Date();
  const year = localizedDate ? localizedDate.getFullYear() : now.getFullYear();
  const month = localizedDate ? localizedDate.getMonth() : now.getMonth();
  const date = new Date(year, month, 1, 0, 0, 0, 0);

  return localizeDate(date);
};

export const getDateDiffAsMilliseconds = (date1: Date, date2: Date): number => {
  return moment(date2).diff(moment(date1));
};

/**
 * get date of last month date. ex) 2020-12-20 to 2020-12-31
 * @param duration milliseconds
 * @returns string ex) 1m 20s
 */
export const stringifyDuration = (duration: number): string => {
  if (duration < 1000) {
    const d = duration < 0 ? 0 : duration;
    return `0.${(d / 100).toFixed(0)[0]}s`;
  }

  if (duration < 1000 * 60) {
    return `${Math.floor(duration / 1000)}.${((duration % 1000) / 100).toFixed(0)[0]}s`;
  }

  if (duration < 1000 * 60 * 60) {
    const m = Math.floor(duration / (1000 * 60));
    const s = Math.floor((duration - m * 1000 * 60) / 1000);
    return `${m}m ${s}s`;
  }

  const h = Math.floor(duration / (1000 * 60 * 60));
  const m = Math.floor((duration - h * 1000 * 60 * 60) / (1000 * 60));
  const s = Math.floor((duration - h * 1000 * 60 * 60 - m * 1000 * 60) / 1000);
  return `${h}h ${m}m ${s}s`;
};

/**
 * get duration diff as mm:ss or hh:mm:ss
 * @param duration milliseconds
 * @returns string ex) 00:20 or 01:20:23
 */
export const stringifyDurationAsTimer = (duration: number): string => {
  if (duration < 1000) {
    return `00:00`;
  }

  if (duration < 1000 * 60) {
    const s = Math.floor(duration / 1000);
    return `00:${addZeroBeforeString(s.toString())}`;
  }

  if (duration < 1000 * 60 * 60) {
    const m = Math.floor(duration / (1000 * 60));
    const s = Math.floor((duration - m * 1000 * 60) / 1000);
    return `${addZeroBeforeString(m.toString())}:${addZeroBeforeString(s.toString())}`;
  }

  const h = Math.floor(duration / (1000 * 60 * 60));
  const m = Math.floor((duration - h * 1000 * 60 * 60) / (1000 * 60));
  const s = Math.floor((duration - h * 1000 * 60 * 60 - m * 1000 * 60) / 1000);
  return `${addZeroBeforeString(h.toString())}:${addZeroBeforeString(m.toString())}:${addZeroBeforeString(
    s.toString(),
  )}`;
};
