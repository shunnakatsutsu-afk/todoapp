import type { Recurrence } from './types'

/** 期限日(YYYY-MM-DD)と繰り返し設定から、次回の期限日を計算する */
export function nextDueDate(dueDate: string, recurrence: Recurrence): string | null {
  if (recurrence === 'none') return null

  const [y, m, d] = dueDate.split('-').map(Number)
  const date = new Date(y, m - 1, d)

  switch (recurrence) {
    case 'daily':
      date.setDate(date.getDate() + 1)
      break
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
  }

  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
