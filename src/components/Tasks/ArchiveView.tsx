import type { Task, TaskStatus } from '../../lib/types'

export function ArchiveView({
  tasks,
  onStatusChange,
}: {
  tasks: Task[]
  onStatusChange: (id: string, status: TaskStatus) => void
}) {
  const done = tasks
    .filter((t) => t.status === 'done')
    .sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? ''))

  if (done.length === 0) {
    return <p className="text-sm text-brand-400 text-center py-12">完了したタスクはまだありません</p>
  }

  return (
    <div className="space-y-2">
      {done.map((t) => (
        <div
          key={t.id}
          className="flex items-center justify-between rounded-lg border border-brand-100 bg-white px-3 py-2"
        >
          <div>
            <p className="text-sm text-gray-700 line-through">{t.title}</p>
            <p className="text-xs text-brand-400">
              {t.completed_at ? new Date(t.completed_at).toLocaleString('ja-JP') : ''}
              {t.category && ` ・ ${t.category}`}
            </p>
          </div>
          <button
            onClick={() => onStatusChange(t.id, 'not_started')}
            className="text-xs text-brand-600 hover:text-brand-800 underline shrink-0"
          >
            未着手に戻す
          </button>
        </div>
      ))}
    </div>
  )
}
