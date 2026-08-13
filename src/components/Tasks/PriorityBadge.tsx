import type { TaskPriority } from '../../lib/types'
import { PRIORITY_LABEL } from '../../lib/types'

const STYLE: Record<TaskPriority, string> = {
  low: 'text-brand-500',
  medium: 'text-amber-600',
  high: 'text-red-600',
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`text-xs font-semibold ${STYLE[priority]}`}>
      優先度:{PRIORITY_LABEL[priority]}
    </span>
  )
}
