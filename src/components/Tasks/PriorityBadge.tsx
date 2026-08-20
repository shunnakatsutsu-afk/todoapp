import type { TaskPriority } from '../../lib/types'
import { PRIORITY_LABEL } from '../../lib/types'

const STYLE: Record<TaskPriority, string> = {
  low: 'bg-brand-50 text-brand-600 border-brand-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-red-50 text-red-700 border-red-200',
}

export function PriorityBadge({
  priority,
  compact = false,
}: {
  priority: TaskPriority
  compact?: boolean
}) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${STYLE[priority]}`}>
      {compact ? PRIORITY_LABEL[priority] : `優先度:${PRIORITY_LABEL[priority]}`}
    </span>
  )
}
