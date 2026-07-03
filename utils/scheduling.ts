// Shared scheduling helpers for the Truck and Packers & Movers
// "Schedule Pickup" screens. Keeping this logic in one place means both
// screens follow the exact same rules:
//   • A pickup date can be picked from today up to 5 days ahead.
//   • Pickup windows run hourly from 6 AM to 6 PM.
//   • For "today", any window that starts less than ~1 hour from now is
//     blocked — see `getEarliestAllowedHour` for the exact rule.

export const SCHEDULE_START_HOUR = 6; // 6 AM
export const SCHEDULE_END_HOUR = 18; // 6 PM
export const MAX_DAY_OFFSET = 5; // "today" + up to 5 days ahead

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

// The earliest hour (24h, e.g. 13 = 1 PM) that can be selected for TODAY.
// Rule of thumb: round "now + 1 hour" up to the next full hour. That keeps
// the earliest option somewhere between ~1–2 hours from the current time
// depending on how far into the current hour we are.
//   e.g. now = 11:18  ->  +1hr = 12:18  ->  rounds up to 13 (1 PM)
//        now = 11:00  ->  +1hr = 12:00  ->  stays at 12 (12 PM)
export function getEarliestAllowedHour(now: Date): number {
  const buffered = new Date(now.getTime() + 60 * 60 * 1000);
  const hasRemainder = buffered.getMinutes() > 0 || buffered.getSeconds() > 0;
  return hasRemainder ? buffered.getHours() + 1 : buffered.getHours();
}

export function formatHourLabel(hour: number): string {
  const normalized = ((hour % 24) + 24) % 24;
  const ampm = normalized < 12 ? 'AM' : 'PM';
  const h12 = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${h12}:00 ${ampm}`;
}

export function formatSlotRangeLabel(hour: number): string {
  return `${formatHourLabel(hour)} – ${formatHourLabel(hour + 1)}`;
}

export interface DayOption {
  offset: number;
  date: Date;
  id: string;
  dayLabel: string;   // "Today" | "Tomorrow" | "Fri"
  dateLabel: string;  // "4 Jul"
  hasAvailableSlots: boolean;
}

// Whether "today" still has at least one bookable hourly window left.
export function todayHasAvailableSlots(now: Date): boolean {
  return getEarliestAllowedHour(now) < SCHEDULE_END_HOUR;
}

export function getDayOptions(now: Date, maxOffset: number = MAX_DAY_OFFSET): DayOption[] {
  const options: DayOption[] = [];
  for (let offset = 0; offset <= maxOffset; offset++) {
    const date = addDays(now, offset);
    const isToday = offset === 0;
    options.push({
      offset,
      date,
      id: `day_${offset}`,
      dayLabel: isToday ? 'Today' : offset === 1 ? 'Tomorrow' : DAY_LABELS[date.getDay()],
      dateLabel: `${date.getDate()} ${MONTH_LABELS[date.getMonth()]}`,
      hasAvailableSlots: isToday ? todayHasAvailableSlots(now) : true,
    });
  }
  return options;
}

export interface SlotOption {
  hour: number;
  id: string;
  label: string;
  disabled: boolean;
}

export function getSlotOptions(now: Date, dayOffset: number): SlotOption[] {
  const earliestToday = getEarliestAllowedHour(now);
  const slots: SlotOption[] = [];
  for (let hour = SCHEDULE_START_HOUR; hour < SCHEDULE_END_HOUR; hour++) {
    const disabled = dayOffset === 0 && hour < earliestToday;
    slots.push({
      hour,
      id: `slot_${hour}`,
      label: formatSlotRangeLabel(hour),
      disabled,
    });
  }
  return slots;
}