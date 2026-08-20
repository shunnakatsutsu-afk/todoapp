import { useState } from 'react'
import type { TaskNode, TaskStatus } from '../../lib/types'
import { progressOf } from '../../lib/tree'
import { TASK_GRID_COLS, TASK_ROW_MIN_WIDTH } from '../../lib/layout'
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
    <div style={{ minWidth: TASK_ROW_MIN_WIDTH }}>
      <div
        className={`group ${TASK_GRID_COLS} items-center gap-2 rounded-lg px-3 py-2 mb-1 border ${
          overdue ? 'border-red-200 bg-red-50' : 'border-brand-100 bg-white'
        } hover:border-brand-300 transition-colors`}
      >
        {/* タスク名 */}
        <div className="flex items-center gap-1.5 min-w-0" style={{ paddingLeft: depth * 18 }}>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-4 text-brand-400 text-xs shrink-0"
            aria-label="開閉"
          >
            {hasChildren ? (expanded ? '▼' : '▶') : ''}
          </button>
          <button className="min-w-0 text-left cursor-pointer flex-1" onClick={() => onOpenDetail(node.id)}>
            <span
              className={`text-sm truncate block ${
                node.status === 'done' ? 'line-through text-brand-400' : 'text-gray-800'
              }`}
              title={node.title}
            >
              {node.title}
              {node.memo && <span className="text-brand-400 ml-1">📝</span>}
              {hasChildren && (
                <span className="text-xs text-brand-500 ml-1">
                  ({done}/{total})
                </span>
              )}
            </span>
          </button>
        </div>

        {/* カテゴリ */}
        <div className="min-w-0">
          {node.category ? (
            <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full truncate inline-block max-w-full">
              {node.category}
            </span>
          ) : (
            <span className="text-xs text-brand-200">—</span>
          )}
        </div>

        {/* 期限 */}
        <div className="min-w-0">
          {node.due_date ? (
            <span className={`text-xs whitespace-nowrap ${overdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
              {node.due_date}
            </span>
          ) : (
            <span className="text-xs text-brand-200">—</span>
          )}
        </div>

        {/* 優先度 */}
        <div className="min-w-0">
          <PriorityBadge priority={node.priority} compact />
        </div>

        {/* ステータス */}
        <div className="min-w-0">
          <StatusBadge status={node.status} onChange={(s) => onStatusChange(node.id, s)} />
        </div>

        {/* サブタスク追加 */}
        <button
          onClick={() => setAddingSub((v) => !v)}
          className="text-brand-400 hover:text-brand-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          title="サブタスクを追加"
        >
          ＋子
        </button>
      </div>

      {addingSub && (
        <div className="mb-2" style={{ marginLeft: 24 + depth * 18 }}>
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
