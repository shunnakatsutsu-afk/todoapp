import type { TaskPriority, TaskStatus } from '../../lib/types'
import { STATUS_LABEL, PRIORITY_LABEL } from '../../lib/types'

export interface Filters {
  search: string
  status: TaskStatus | 'all'
  priority: TaskPriority | 'all'
  category: string
  sort: 'due_date' | 'priority' | 'created_at'
}

export const DEFAULT_FILTERS: Filters = {
  search: '',
  status: 'all',
  priority: 'all',
  category: 'all',
  sort: 'created_at',
}

// リストには完了タスクを出さないため、ステータス絞り込みからは「完了」を除く
const LIST_STATUS_OPTIONS: TaskStatus[] = ['not_started', 'in_progress']

export function FilterBar({
  filters,
  categories,
  onChange,
}: {
  filters: Filters
  categories: string[]
  onChange: (filters: Filters) => void
}) {
  return (
    <div className="mb-4 space-y-2">
      <input
        type="text"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder="タスク名・メモで検索…"
        className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
      />

      <div className="flex flex-wrap gap-2 text-sm">
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as Filters['status'] })}
          className="rounded-lg border border-brand-200 px-2 py-1.5 bg-white"
        >
          <option value="all">すべてのステータス</option>
          {LIST_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => onChange({ ...filters, priority: e.target.value as Filters['priority'] })}
          className="rounded-lg border border-brand-200 px-2 py-1.5 bg-white"
        >
          <option value="all">すべての優先度</option>
          {(Object.keys(PRIORITY_LABEL) as TaskPriority[]).map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </select>

        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className="rounded-lg border border-brand-200 px-2 py-1.5 bg-white"
        >
          <option value="all">すべてのカテゴリ</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as Filters['sort'] })}
          className="rounded-lg border border-brand-200 px-2 py-1.5 bg-white ml-auto"
        >
          <option value="created_at">追加順</option>
          <option value="due_date">期限順</option>
          <option value="priority">優先度順</option>
        </select>
      </div>
    </div>
  )
}
