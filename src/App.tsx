import { useMemo, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { LoginScreen } from './components/Auth/LoginScreen'
import { Header } from './components/Layout/Header'
import type { ViewTab } from './components/Layout/Header'
import { TaskList } from './components/Tasks/TaskList'
import { TaskDetailPanel } from './components/Tasks/TaskDetailPanel'
import { TaskFormModal } from './components/Tasks/TaskFormModal'
import { ArchiveView } from './components/Tasks/ArchiveView'
import { WbsView } from './components/Calendar/WbsView'
import { FilterBar, DEFAULT_FILTERS } from './components/Filters/FilterBar'
import { applyFilters } from './lib/filter'

function App() {
  const { session, loading: authLoading } = useAuth()
  const userId = session?.user.id
  const { tasks, loading, error, addTask, updateTask, deleteTask, setStatus } = useTasks(userId)

  const [tab, setTab] = useState<ViewTab>('list')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [openTaskId, setOpenTaskId] = useState<string | null>(null)
  const [addTarget, setAddTarget] = useState<{ parentId: string | null } | null>(null)

  const categories = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.category).filter((c): c is string => !!c))),
    [tasks],
  )

  const filteredTasks = useMemo(() => applyFilters(tasks, filters), [tasks, filters])
  const openTask = tasks.find((t) => t.id === openTaskId) ?? null

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-brand-500">読み込み中…</div>
  }

  if (!session) {
    return <LoginScreen />
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <Header email={session.user.email} activeTab={tab} onTabChange={setTab} />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-brand-400 text-center py-12">読み込み中…</p>
        ) : (
          <>
            {tab === 'list' && (
              <>
                <FilterBar filters={filters} categories={categories} onChange={setFilters} />
                <TaskList
                  tasks={filteredTasks}
                  onRequestAdd={() => setAddTarget({ parentId: null })}
                  onRequestAddSubtask={(parentId) => setAddTarget({ parentId })}
                  onStatusChange={(id, status) => {
                    const task = tasks.find((t) => t.id === id)
                    if (task) setStatus(task, status)
                  }}
                  onOpenDetail={setOpenTaskId}
                />
              </>
            )}

            {tab === 'wbs' && (
              <WbsView
                tasks={tasks}
                onOpenDetail={setOpenTaskId}
                onStatusChange={(id, status) => {
                  const task = tasks.find((t) => t.id === id)
                  if (task) setStatus(task, status)
                }}
              />
            )}

            {tab === 'archive' && (
              <ArchiveView
                tasks={tasks}
                onStatusChange={(id, status) => {
                  const task = tasks.find((t) => t.id === id)
                  if (task) setStatus(task, status)
                }}
              />
            )}
          </>
        )}
      </main>

      {openTask && (
        <TaskDetailPanel
          task={openTask}
          allTasks={tasks}
          onClose={() => setOpenTaskId(null)}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />
      )}

      {addTarget && (
        <TaskFormModal
          title={addTarget.parentId ? 'サブタスクを追加' : 'タスクを追加'}
          onClose={() => setAddTarget(null)}
          onSubmit={async (values) => {
            await addTask({ ...values, parent_id: addTarget.parentId })
            setAddTarget(null)
          }}
        />
      )}
    </div>
  )
}

export default App
