/** 指定した年月を含む、カレンダー表示用の6週間分(42日)の日付配列を返す */
export function getMonthGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay() // 0 = 日曜
  const start = new Date(year, month, 1 - startOffset)

  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
  }
  return days
}

/** 今日(時刻を00:00に正規化)を返す */
export function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(d: Date, days: number): Date {
  const next = new Date(d)
  next.setDate(next.getDate() + days)
  return next
}

export function toDateKey(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
