import { useEffect, useState } from 'react'
import type { Task, TaskPriority, TaskStatus, Recurrence, TaskUpdate } from '../../lib/types'
import { STATUS_LABEL, PRIORITY_LABEL, RECURRENCE_LABEL } from '../../lib/types'
import { getDescendantIds } from '../../lib/tree'

export function TaskDetailPanel({
  task,
  allTasks,
  onClose,
  onUpdate,
  onDelete,
}: {
  task: Task
  allTasks: Task[]
  onClose: () => void
  onUpdate: (id: string, update: TaskUpdate) => void
  onDelete: (id: string) => void
}) {
  const [title, setTitle] = useState(task.title)
  const [memo, setMemo] = useState(task.memo ?? '')
  const [category, setCategory] = useState(task.category ?? '')

  useEffect(() => {
    setTitle(task.title)
    setMemo(task.memo ?? '')
    setCategory(task.category ?? '')
  }, [task.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const excludedIds = new Set([task.id, ...getDescendantIds(allTasks, task.id)])
  const parentOptions = allTasks.filter((t) => !excludedIds.has(t.id))

  const handleDelete = () => {
    if (confirm('このタスクを削除しますか？子タスクも一緒に削除されます。')) {
      onDelete(task.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        className="absolute inset-0 bg-black/20"
        aria-label="閉じる"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md h-full bg-white shadow-xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-brand-800">タスク詳細</h2>
          <button onClick={onClose} className="text-brand-400 hover:text-brand-700 text-xl leading-none">
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-brand-700 mb-1">タイトル</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => title.trim() && onUpdate(task.id, { title: title.trim() })}
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-brand-700 mb-1">ステータス</label>
              <select
                value={task.status}
                onChange={(e) =>
                  onUpdate(task.id, {
                    status: e.target.value as TaskStatus,
                    completed_at: e.target.value === 'done' ? new Date().toISOString() : null,
                  })
                }
                className="w-full rounded-lg border border-brand-200 px-2 py-2 text-sm"
              >
                {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-700 mb-1">優先度</label>
              <select
                value={task.priority}
                onChange={(e) => onUpdate(task.id, { priority: e.target.value as TaskPriority })}
                className="w-full rounded-lg border border-brand-200 px-2 py-2 text-sm"
              >
                {(Object.keys(PRIORITY_LABEL) as TaskPriority[]).map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABEL[p]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-brand-700 mb-1">開始日</label>
              <input
                type="date"
                value={task.start_date ?? ''}
                onChange={(e) => onUpdate(task.id, { start_date: e.target.value || null })}
                className="w-full rounded-lg border border-brand-200 px-2 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-700 mb-1">期限(完了日)</label>
              <input
                type="date"
                value={task.due_date ?? ''}
                onChange={(e) => onUpdate(task.id, { due_date: e.target.value || null })}
                className="w-full rounded-lg border border-brand-200 px-2 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-brand-700 mb-1">繰り返し</label>
              <select
                value={task.recurrence}
                onChange={(e) => onUpdate(task.id, { recurrence: e.target.value as Recurrence })}
                className="w-full rounded-lg border border-brand-200 px-2 py-2 text-sm"
              >
                {(Object.keys(RECURRENCE_LABEL) as Recurrence[]).map((r) => (
                  <option key={r} value={r}>
                    {RECURRENCE_LABEL[r]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-700 mb-1">カテゴリ</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onBlur={() => onUpdate(task.id, { category: category.trim() || null })}
                placeholder="例: 仕事"
                className="w-full rounded-lg border border-brand-200 px-2 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-700 mb-1">親タスク</label>
            <select
              value={task.parent_id ?? ''}
              onChange={(e) => onUpdate(task.id, { parent_id: e.target.value || null })}
              className="w-full rounded-lg border border-brand-200 px-2 py-2 text-sm"
            >
              <option value="">（なし・最上位タスク）</option>
              {parentOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-700 mb-1">メモ</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              onBlur={() => onUpdate(task.id, { memo: memo.trim() || null })}
              rows={5}
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm resize-none"
            />
          </div>

          <button
            onClick={handleDelete}
            className="w-full rounded-lg border border-red-200 text-red-600 text-sm font-medium py-2 hover:bg-red-50 transition-colors"
          >
            このタスクを削除
          </button>
        </div>
      </div>
    </div>
  )
}
