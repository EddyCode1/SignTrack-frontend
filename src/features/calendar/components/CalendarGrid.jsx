const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const startOfWeek = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const inRange = (date, start, end) => date >= start && date <= end

export const buildMonthDays = (cursor) => {
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const first = new Date(year, month, 1)
  const start = startOfWeek(first)
  const days = []
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d)
  }
  return days
}

export const buildWeekDays = (cursor) => {
  const start = startOfWeek(cursor)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

const CalendarGrid = ({ view, cursor, items, onSelectDay }) => {
  const days = view === 'week' ? buildWeekDays(cursor) : buildMonthDays(cursor)
  const today = new Date()

  const eventsForDay = (day) =>
    items.filter((item) => {
      const start = new Date(item.startUtc)
      const end = new Date(item.endUtc)
      const dayStart = new Date(day)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(day)
      dayEnd.setHours(23, 59, 59, 999)
      return inRange(dayStart, start, end) || inRange(start, dayStart, dayEnd) || (start <= dayStart && end >= dayEnd)
    })

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((label) => (
          <div key={label} className="text-center text-xs font-semibold text-[var(--muted)] py-1">
            {label}
          </div>
        ))}
      </div>
      <div className={`grid grid-cols-7 gap-1 ${view === 'week' ? 'min-h-[120px]' : 'min-h-[320px]'}`}>
        {days.map((day) => {
          const inMonth = view === 'week' || day.getMonth() === cursor.getMonth()
          const dayEvents = eventsForDay(day)
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay?.(day)}
              className={`min-h-[72px] p-2 rounded-lg border text-left transition hover:border-[var(--accent)] ${
                sameDay(day, today) ? 'border-[var(--primary)] bg-[var(--surface)]' : 'border-[var(--accent-soft)]'
              } ${!inMonth ? 'opacity-40' : ''}`}
            >
              <span className="text-sm font-medium">{day.getDate()}</span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 2).map((ev) => (
                  <span
                    key={ev.id}
                    className="block text-[10px] truncate px-1 py-0.5 rounded bg-[var(--primary)]/15 text-[var(--primary)]"
                    title={ev.title}
                  >
                    {ev.title}
                  </span>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[10px] text-[var(--muted)]">+{dayEvents.length - 2}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarGrid
