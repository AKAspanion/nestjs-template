export function createDate(str: string | Date) {
  const date = new Date(str);
  if (date instanceof Date && !isNaN(date.valueOf())) return date;
  else throw Error('Invalid Date');
}

export function addHours(date: Date, hours: number) {
  const hoursToAdd = hours * 60 * 60 * 1000;
  date.setTime(date.getTime() + hoursToAdd);
  return date;
}

export function addMinutes(date: Date, minutes: number) {
  const minsToAdd = minutes * 60 * 1000;
  date.setTime(date.getTime() + minsToAdd);
  return date;
}
