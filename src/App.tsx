import { useEffect, useMemo, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { useProjects } from './hooks/useProjects'
import { LoginScreen } from './components/Auth/LoginScreen'
import { Header } from './components/Layout/Header'
import { ViewTabs } from './components/Layout/ViewTabs'
import type { ViewTab } from './components/Layout/ViewTabs'
import { ProjectBar } from './components/Projects/ProjectBar'
import { ProjectManagerModal } from './components/Projects/ProjectManagerModal'
import { TaskList } from './components/Tasks/TaskList'
import { TaskDetailPanel } from './components/Tasks/TaskDetailPanel'
import { TaskFormModal } from './components/Tasks/TaskFormModal'
import { ArchiveView } from './components/Tasks/ArchiveView'
import { WbsView } from './components/Calendar/WbsView'
import { FilterBar, DEFAULT_FILTERS } from './components/Filters/FilterBar'
import { applyFilters } from './lib/filter'

const SELECTED_PROJECT_KEY = 'todo-app:selected-project-id'

function App() {
  const { session, loading: authLoading } = useAuth()
  const userId = session?.user.id
  const { tasks, loading, error, addTask, updateTask, deleteTask, setStatus, reorderTasks } = useTasks(userId)
  const {
    projects,
    loading: projectsLoading,
    addProject,
    renameProject,
    deleteProject,
  } = useProjects(userId)

  const [tab, setTab] = useState<ViewTab>('list')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [openTaskId, setOpenTaskId] = useState<string | null>(null)
  const [addTarget, setAddTarget] = useState<{ parentId: string | null } | null>(null)
  const [managingProjects, setManagingProjects] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() =>
    localStorage.getItem(SELECTED_PROJECT_KEY),
  )

  // プロジェクト一覧が読み込まれたら、選択中プロジェクトが無効な場合は先頭のものを選ぶ
  useEffect(() => {
    if (projects.length === 0) return
    const stillExists = projects.some((p) => p.id === selectedProjectId)
    if (!stillExists) setSelectedProjectId(projects[0].id)
  }, [projects, selectedProjectId])

  useEffect(() => {
    if (selectedProjectId) localStorage.setItem(SELECTED_PROJECT_KEY, selectedProjectId)
  }, [selectedProjectId])

  // 選択中プロジェクトのタスクだけに絞り込む
  const projectTasks = useMemo(
    () => tasks.filter((t) => t.project_id === selectedProjectId),
    [tasks, selectedProjectId],
  )

  // 完了したタスクはリストには出さず、完了履歴タブのみに残す
  const activeTasks = useMemo(() => projectTasks.filter((t) => t.status !== 'done'), [projectTasks])

  const categories = useMemo(
    () => Array.from(new Set(activeTasks.map((t) => t.category).filter((c): c is string => !!c))),
    [activeTasks],
  )

  const filteredTasks = useMemo(() => applyFilters(activeTasks, filters), [activeTasks, filters])
  const openTask = tasks.find((t) => t.id === openTaskId) ?? null

  // 同じ親を持つタスク同士だけ、ドラッグした位置に並び替える
  const handleReorder = (draggedId: string, targetId: string) => {
    const dragged = tasks.find((t) => t.id === draggedId)
    const target = tasks.find((t) => t.id === targetId)
    if (!dragged || !target) return
    if (dragged.parent_id !== target.parent_id || dragged.project_id !== target.project_id) return

    const siblings = tasks
      .filter((t) => t.parent_id === dragged.parent_id && t.project_id === dragged.project_id)
      .sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at))

    const withoutDragged = siblings.filter((t) => t.id !== draggedId)
    const targetIndex = withoutDragged.findIndex((t) => t.id === targetId)
    withoutDragged.splice(targetIndex, 0, dragged)

    reorderTasks(withoutDragged.map((t, i) => ({ id: t.id, sort_order: i * 10 })))
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-brand-500">読み込み中…</div>
  }

  if (!session) {
    return <LoginScreen />
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <Header email={session.user.email} />

      {!projectsLoading && projects.length > 0 && (
        <ProjectBar
          projects={projects}
          selectedId={selectedProjectId}
          onSelect={setSelectedProjectId}
          onRename={renameProject}
          onManage={() => setManagingProjects(true)}
        />
      )}

      <ViewTabs activeTab={tab} onTabChange={setTab} />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
            {error}
          </div>
        )}

        {loading || projectsLoading ? (
          <p className="text-sm text-brand-400 text-center py-12">読み込み中…</p>
        ) : (
          <>
            {tab === 'list' && (
              <>
                <FilterBar filters={filters} categories={categories} onChange={setFilters} />
                <TaskList
                  tasks={filteredTasks}
                  search={filters.search}
                  onSearchChange={(search) => setFilters({ ...filters, search })}
                  onRequestAdd={() => setAddTarget({ parentId: null })}
                  onStatusChange={(id, status) => {
                    const task = tasks.find((t) => t.id === id)
                    if (task) setStatus(task, status)
                  }}
                  onOpenDetail={setOpenTaskId}
                  onReorder={handleReorder}
                />
              </>
            )}

            {tab === 'calendar' && (
              <WbsView
                tasks={activeTasks}
                onOpenDetail={setOpenTaskId}
                onStatusChange={(id, status) => {
                  const task = tasks.find((t) => t.id === id)
                  if (task) setStatus(task, status)
                }}
              />
            )}

            {tab === 'archive' && (
              <ArchiveView
                tasks={projectTasks}
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
          allTasks={projectTasks}
          onClose={() => setOpenTaskId(null)}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onAddSubtask={(parentId) => setAddTarget({ parentId })}
        />
      )}

      {addTarget && selectedProjectId && (
        <TaskFormModal
          title={addTarget.parentId ? 'サブタスクを追加' : 'タスクを追加'}
          onClose={() => setAddTarget(null)}
          onSubmit={async (values) => {
            await addTask({ ...values, project_id: selectedProjectId, parent_id: addTarget.parentId })
            setAddTarget(null)
          }}
        />
      )}

      {managingProjects && (
        <ProjectManagerModal
          projects={projects}
          onAdd={addProject}
          onRename={renameProject}
          onDelete={(id) => {
            deleteProject(id)
            if (id === selectedProjectId) setSelectedProjectId(null)
          }}
          onClose={() => setManagingProjects(false)}
        />
      )}
    </div>
  )
}

export default App
