import { useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { TaskNode, TaskStatus } from '../../lib/types'
import { progressOf } from '../../lib/tree'
import { TASK_GRID_COLS, TASK_ROW_MIN_WIDTH } from '../../lib/layout'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'

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
  draggingId,
  overId,
  onGripPointerDown,
}: {
  node: TaskNode
  depth: number
  onStatusChange: (id: string, status: TaskStatus) => void
  onOpenDetail: (id: string) => void
  draggingId: string | null
  overId: string | null
  onGripPointerDown: (id: string, e: ReactPointerEvent) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children.length > 0
  const { done, total } = progressOf(node)
  const overdue = isOverdue(node.due_date, node.status)
  const isDragging = draggingId === node.id
  const isOver = overId === node.id

  return (
    <div style={{ minWidth: TASK_ROW_MIN_WIDTH }}>
      <div
        data-task-row-id={node.id}
        className={`group ${TASK_GRID_COLS} items-center gap-2 rounded-lg px-3 py-2 mb-1 border ${
          isOver
            ? 'border-brand-400 ring-2 ring-brand-300'
            : overdue
              ? 'border-red-200 bg-red-50'
              : 'border-brand-100 bg-white'
        } ${isDragging ? 'opacity-40' : ''} hover:border-brand-300 transition-colors`}
      >
        {/* タスク名 */}
        <div className="flex items-center gap-1.5 min-w-0" style={{ paddingLeft: depth * 26 }}>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-4 text-brand-400 text-xs shrink-0"
            aria-label="開閉"
          >
            {hasChildren ? (expanded ? '▼' : '▶') : ''}
          </button>
          <button className="min-w-0 text-left cursor-pointer flex-1" onClick={() => onOpenDetail(node.id)}>
            <span
              className={`text-sm truncate block ${depth === 0 ? 'font-medium' : 'font-normal'} ${
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

        {/* ドラッグハンドル */}
        <span
          onPointerDown={(e) => onGripPointerDown(node.id, e)}
          style={{ touchAction: 'none' }}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0 select-none text-center"
          title="ドラッグして並び替え"
        >
          ⠿
        </span>
      </div>

      {expanded &&
        node.children.map((child) => (
          <TaskItem
            key={child.id}
            node={child}
            depth={depth + 1}
            onStatusChange={onStatusChange}
            onOpenDetail={onOpenDetail}
            draggingId={draggingId}
            overId={overId}
            onGripPointerDown={onGripPointerDown}
          />
        ))}
    </div>
  )
}
