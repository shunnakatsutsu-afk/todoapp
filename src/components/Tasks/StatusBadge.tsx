import type { TaskStatus } from '../../lib/types'
import { STATUS_LABEL } from '../../lib/types'

const STYLE: Record<TaskStatus, string> = {
  not_started: 'bg-gray-100 text-gray-600 border-gray-300',
  in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  done: 'bg-brand-100 text-brand-700 border-brand-300',
}

export function StatusBadge({
  status,
  onChange,
}: {
  status: TaskStatus
  onChange?: (status: TaskStatus) => void
}) {
  if (!onChange) {
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full border ${STYLE[status]}`}>
        {STATUS_LABEL[status]}
      </span>
    )
  }

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as TaskStatus)}
      onClick={(e) => e.stopPropagation()}
      className={`text-xs px-2 py-0.5 rounded-full border cursor-pointer ${STYLE[status]}`}
    >
      {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((s) => (
        <option key={s} value={s}>
          {STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  )
}
