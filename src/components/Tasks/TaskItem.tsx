import { useState } from 'react'
import type { TaskNode, TaskStatus } from '../../lib/types'
import { progressOf } from '../../lib/tree'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { QuickAddForm } from './QuickAddForm'

function isOverdue(dueDate: string | null, status: TaskStatus) {
  if (!dueDate || status === 'done') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dueDate) < today
}

export function TaskItem({
  node,
  depth,
  onStatusChange,
  onOpenDetail,
  onAddSubtask,
}: {
  node: TaskNode
  depth: number
  onStatusChange: (id: string, status: TaskStatus) => void
  onOpenDetail: (id: string) => void
  onAddSubtask: (parentId: string, title: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const [addingSub, setAddingSub] = useState(false)
  const hasChildren = node.children.length > 0
  const { done, total } = progressOf(node)
  const overdue = isOverdue(node.due_date, node.status)

  return (
    <div style={{ marginLeft: depth === 0 ? 0 : 20 }}>
      <div
        className={`group flex items-center gap-2 rounded-lg px-3 py-2 mb-1 border ${
          overdue ? 'border-red-200 bg-red-50' : 'border-brand-100 bg-white'
        } hover:border-brand-300 transition-colors`}
      >
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-4 text-brand-400 text-xs shrink-0"
          aria-label="開閉"
        >
          {hasChildren ? (expanded ? '▼' : '▶') : ''}
        </button>

        <button
          className="flex-1 text-left cursor-pointer"
          onClick={() => onOpenDetail(node.id)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm ${
                node.status === 'done' ? 'line-through text-brand-400' : 'text-gray-800'
              }`}
            >
              {node.title}
            </span>
            {node.category && (
              <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                {node.category}
              </span>
            )}
            {node.memo && <span className="text-xs text-brand-400">📝</span>}
            {hasChildren && (
              <span className="text-xs text-brand-500">
                {done}/{total}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {node.due_date && (
              <span className={`text-xs ${overdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                期限: {node.due_date}
              </span>
            )}
            <PriorityBadge priority={node.priority} />
          </div>
        </button>

        <StatusBadge status={node.status} onChange={(s) => onStatusChange(node.id, s)} />

        <button
          onClick={() => setAddingSub((v) => !v)}
          className="text-brand-400 hover:text-brand-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          title="サブタスクを追加"
        >
          ＋子
        </button>
      </div>

      {addingSub && (
        <div className="mb-2" style={{ marginLeft: 24 }}>
          <QuickAddForm
            placeholder="サブタスク名"
            autoFocus
            onAdd={(title) => {
              onAddSubtask(node.id, title)
              setAddingSub(false)
            }}
          />
        </div>
      )}

      {expanded &&
        node.children.map((child) => (
          <TaskItem
            key={child.id}
            node={child}
            depth={depth + 1}
            onStatusChange={onStatusChange}
            onOpenDetail={onOpenDetail}
            onAddSubtask={onAddSubtask}
          />
        ))}
    </div>
  )
}
