import { buildTree } from '../../lib/tree'
import { TASK_GRID_COLS, TASK_ROW_MIN_WIDTH } from '../../lib/layout'
import type { Task, TaskStatus } from '../../lib/types'
import { TaskItem } from './TaskItem'

export function TaskList({
  tasks,
  search,
  onSearchChange,
  onRequestAdd,
  onStatusChange,
  onOpenDetail,
  onReorder,
}: {
  tasks: Task[]
  search: string
  onSearchChange: (value: string) => void
  onRequestAdd: () => void
  onStatusChange: (id: string, status: TaskStatus) => void
  onOpenDetail: (id: string) => void
  onReorder: (draggedId: string, targetId: string) => void
}) {
  const tree = buildTree(tasks)

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onRequestAdd}
          className="inline-flex items-center gap-1 rounded-full bg-brand-500 text-white text-sm font-medium px-4 py-1.5 hover:bg-brand-600 transition-colors shrink-0"
        >
          ＋ タスク追加
        </button>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="検索…"
          className="flex-1 min-w-[100px] max-w-xs rounded-full border border-brand-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: TASK_ROW_MIN_WIDTH }}>
          <div
            className={`${TASK_GRID_COLS} items-center gap-2 px-3 pb-1.5 text-xs font-semibold text-brand-500`}
          >
            <span>タスク</span>
            <span>カテゴリ</span>
            <span>期限</span>
            <span>優先度</span>
            <span>ステータス</span>
            <span />
          </div>

          {tree.length === 0 ? (
            <p className="text-sm text-brand-400 text-center py-12">タスクがありません</p>
          ) : (
            tree.map((node) => (
              <TaskItem
                key={node.id}
                node={node}
                depth={0}
                onStatusChange={onStatusChange}
                onOpenDetail={onOpenDetail}
                onReorder={onReorder}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
