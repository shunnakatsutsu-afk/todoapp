import { buildTree } from '../../lib/tree'
import type { Task, TaskStatus } from '../../lib/types'
import { TaskItem } from './TaskItem'
import { QuickAddForm } from './QuickAddForm'

export function TaskList({
  tasks,
  onAddRoot,
  onAddSubtask,
  onStatusChange,
  onOpenDetail,
}: {
  tasks: Task[]
  onAddRoot: (title: string) => void
  onAddSubtask: (parentId: string, title: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  onOpenDetail: (id: string) => void
}) {
  const tree = buildTree(tasks)

  return (
    <div>
      <div className="mb-4">
        <QuickAddForm onAdd={onAddRoot} placeholder="新しいタスクを追加…" />
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
  )
}
