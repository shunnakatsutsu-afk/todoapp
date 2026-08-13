import type { Task, TaskPriority } from './types'
import type { Filters } from '../components/Filters/FilterBar'

const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 }

export function applyFilters(tasks: Task[], filters: Filters): Task[] {
  const filtered = tasks.filter((t) => {
    if (filters.status !== 'all' && t.status !== filters.status) return false
    if (filters.priority !== 'all' && t.priority !== filters.priority) return false
    if (filters.category !== 'all' && (t.category ?? '') !== filters.category) return false
    return true
  })

  return [...filtered].sort((a, b) => {
    if (filters.sort === 'due_date') {
      if (!a.due_date && !b.due_date) return 0
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return a.due_date.localeCompare(b.due_date)
    }
    if (filters.sort === 'priority') {
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    }
    return a.created_at.localeCompare(b.created_at)
  })
}
