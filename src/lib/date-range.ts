import { differenceInCalendarDays, eachDayOfInterval, endOfDay, format, isValid, parseISO, startOfDay, subDays } from "date-fns";

const ISO = "yyyy-MM-dd";

/** Parses ?from=&to= (yyyy-MM-dd). Defaults to the last 30 days, max span 366 days. */
export function parseRange(fromRaw?: string, toRaw?: string) {
  const today = new Date();
  let to = toRaw ? parseISO(toRaw) : today;
  let from = fromRaw ? parseISO(fromRaw) : subDays(today, 29);
  if (!isValid(to) || to > today) to = today;
  if (!isValid(from)) from = subDays(to, 29);
  if (from > to) [from, to] = [to, from];
  if (differenceInCalendarDays(to, from) > 366) from = subDays(to, 366);
  return {
    start: startOfDay(from),
    end: endOfDay(to),
    fromStr: format(from, ISO),
    toStr: format(to, ISO),
  };
}

export function daysBetween(start: Date, end: Date) {
  return eachDayOfInterval({ start, end }).map((d) => format(d, ISO));
}

export const now = () => new Date();
