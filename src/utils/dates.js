const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function toDateKey(date) {
  const d = date instanceof Date ? date : new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function fromDateKey(key) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function isToday(dateKey) {
  return dateKey === toDateKey(new Date())
}

export function formatDateHeader(dateKey) {
  if (isToday(dateKey)) {
    const d = fromDateKey(dateKey)
    return `Today, ${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`
  }
  const d = fromDateKey(dateKey)
  return `${DAYS[d.getDay()]}, ${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`
}

export function formatDateFull(dateKey) {
  const d = fromDateKey(dateKey)
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export function addDays(dateKey, days) {
  const d = fromDateKey(dateKey)
  d.setDate(d.getDate() + days)
  return toDateKey(d)
}

export function getWeekRange(dateKey) {
  const d = fromDateKey(dateKey)
  const dayOfWeek = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    start: toDateKey(monday),
    end: toDateKey(sunday),
  }
}

export function getWeekDays(dateKey) {
  const { start } = getWeekRange(dateKey)
  const days = []
  for (let i = 0; i < 7; i++) {
    days.push(addDays(start, i))
  }
  return days
}

export function formatWeekRange(dateKey) {
  const { start, end } = getWeekRange(dateKey)
  const s = fromDateKey(start)
  const e = fromDateKey(end)
  if (s.getMonth() === e.getMonth()) {
    return `${SHORT_MONTHS[s.getMonth()]} ${s.getDate()} – ${e.getDate()}, ${s.getFullYear()}`
  }
  return `${SHORT_MONTHS[s.getMonth()]} ${s.getDate()} – ${SHORT_MONTHS[e.getMonth()]} ${e.getDate()}, ${s.getFullYear()}`
}

export function getCurrentTime() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

export function getCalendarMonth(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7 // Monday = 0
  const days = []

  for (
    let i = -startOffset;
    i < lastDay.getDate() + (6 - ((lastDay.getDay() + 6) % 7));
    i++
  ) {
    const d = new Date(year, month, i + 1)
    days.push(toDateKey(d))
  }
  return days
}
