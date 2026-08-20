import { buildTree } from '../../lib/tree'
import { TASK_GRID_COLS, TASK_ROW_MIN_WIDTH } from '../../lib/layout'
import type { Task, TaskStatus } from '../../lib/types'
import { TaskItem } from './TaskItem'

export function TaskList({
  tasks,
  onRequestAdd,
  onRequestAddSubtask,
  onStatusChange,
  onOpenDetail,
}: {
  tasks: Task[]
  onRequestAdd: () => void
  onRequestAddSubtask: (parentId: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  onOpenDetail: (id: string) => void
}) {
  const tree = buildTree(tasks)

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={onRequestAdd}
          className="w-full rounded-lg border-2 border-dashed border-brand-300 text-brand-600 text-sm font-medium py-2.5 hover:bg-brand-50 hover:border-brand-400 transition-colors"
        >
          ＋ 新しいタスクを追加
        </button>
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
                onRequestAddSubtask={onRequestAddSubtask}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
