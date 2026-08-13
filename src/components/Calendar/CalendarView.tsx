import { useMemo, useState } from 'react'
import type { Task, TaskStatus } from '../../lib/types'
import { getMonthGrid, toDateKey } from '../../lib/calendar'
import { StatusBadge } from '../Tasks/StatusBadge'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export function CalendarView({
  tasks,
  onOpenDetail,
  onStatusChange,
}: {
  tasks: Task[]
  onOpenDetail: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
}) {
  const [cursor, setCursor] = useState(() => new Date())
  const [selected, setSelected] = useState<string | null>(null)

  const year = cursor.getFullYear()
  const month = cursor.getMonth()

  const days = useMemo(() => getMonthGrid(year, month), [year, month])

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>()
    tasks.forEach((t) => {
      if (!t.due_date) return
      const list = map.get(t.due_date) ?? []
      list.push(t)
      map.set(t.due_date, list)
    })
    return map
  }, [tasks])

  const todayKey = toDateKey(new Date())
  const selectedTasks = selected ? (tasksByDate.get(selected) ?? []) : []

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="text-brand-600 hover:text-brand-800 px-2"
        >
          ←
        </button>
        <h2 className="text-sm font-semibold text-brand-800">
          {year}年 {month + 1}月
        </h2>
        <button
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="text-brand-600 hover:text-brand-800 px-2"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-brand-500 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const key = toDateKey(d)
          const inMonth = d.getMonth() === month
          const dayTasks = tasksByDate.get(key) ?? []
          const isToday = key === todayKey
          const isSelected = key === selected

          return (
            <button
              key={key}
              onClick={() => setSelected(key === selected ? null : key)}
              className={`text-left rounded-lg border p-1.5 min-h-16 text-xs ${
                inMonth ? 'bg-white' : 'bg-brand-50 text-brand-300'
              } ${isToday ? 'border-brand-500' : 'border-brand-100'} ${
                isSelected ? 'ring-2 ring-brand-400' : ''
              }`}
            >
              <div className={`mb-1 ${isToday ? 'font-bold text-brand-700' : ''}`}>{d.getDate()}</div>
              {dayTasks.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className={`truncate rounded px-1 mb-0.5 ${
                    t.status === 'done'
                      ? 'bg-brand-100 text-brand-400 line-through'
                      : 'bg-brand-200 text-brand-800'
                  }`}
                >
                  {t.title}
                </div>
              ))}
              {dayTasks.length > 3 && <div className="text-brand-400">+{dayTasks.length - 3}</div>}
            </button>
          )
        })}
      </div>

      {selected && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-brand-800 mb-2">{selected} のタスク</h3>
          {selectedTasks.length === 0 ? (
            <p className="text-sm text-brand-400">この日のタスクはありません</p>
          ) : (
            <div className="space-y-1.5">
              {selectedTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-brand-100 bg-white px-3 py-2 cursor-pointer hover:border-brand-300"
                  onClick={() => onOpenDetail(t.id)}
                >
                  <span className={`text-sm ${t.status === 'done' ? 'line-through text-brand-400' : ''}`}>
                    {t.title}
                  </span>
                  <StatusBadge status={t.status} onChange={(s) => onStatusChange(t.id, s)} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
