import { buildTree } from '../../lib/tree'
import { TASK_GRID_COLS, TASK_ROW_MIN_WIDTH } from '../../lib/layout'
import type { Task, TaskStatus } from '../../lib/types'
import { TaskItem } from './TaskItem'
import { QuickAddForm } from './QuickAddForm'
import type { QuickAddInput } from './QuickAddForm'

export function TaskList({
  tasks,
  onAddRoot,
  onAddSubtask,
  onStatusChange,
  onOpenDetail,
}: {
  tasks: Task[]
  onAddRoot: (input: QuickAddInput) => void
  onAddSubtask: (parentId: string, input: QuickAddInput) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  onOpenDetail: (id: string) => void
}) {
  const tree = buildTree(tasks)

  return (
    <div>
      <div className="mb-4">
        <QuickAddForm onAdd={onAddRoot} placeholder="新しいタスクを追加…" />
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
                onAddSubtask={onAddSubtask}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
