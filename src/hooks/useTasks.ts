import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { NewTask, Task, TaskStatus, TaskUpdate } from '../lib/types'
import { nextDueDate } from '../lib/recurrence'

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!userId) return
      if (!opts?.silent) setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setTasks((data ?? []) as Task[])
        setError(null)
      }
      if (!opts?.silent) setLoading(false)
    },
    [userId],
  )

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // 別デバイスでの変更も反映されるようにリアルタイム購読する
  // (Supabase側でReplicationが有効な場合のみ動作。無効でも下記の各操作後の再取得で
  // 同一デバイスでは即時反映される)
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
        () => {
          fetchTasks({ silent: true })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchTasks])

  const addTask = useCallback(
    async (task: NewTask) => {
      if (!userId) return
      const { error: insertError } = await supabase
        .from('tasks')
        .insert({ ...task, user_id: userId })
      if (insertError) {
        setError(insertError.message)
      } else {
        await fetchTasks({ silent: true })
      }
    },
    [userId, fetchTasks],
  )

  const updateTask = useCallback(
    async (id: string, update: TaskUpdate) => {
      const { error: updateError } = await supabase.from('tasks').update(update).eq('id', id)
      if (updateError) {
        setError(updateError.message)
      } else {
        await fetchTasks({ silent: true })
      }
    },
    [fetchTasks],
  )

  const deleteTask = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from('tasks').delete().eq('id', id)
      if (deleteError) {
        setError(deleteError.message)
      } else {
        await fetchTasks({ silent: true })
      }
    },
    [fetchTasks],
  )

  const setStatus = useCallback(
    async (task: Task, status: TaskStatus) => {
      const update: TaskUpdate = { status }
      update.completed_at = status === 'done' ? new Date().toISOString() : null
      await updateTask(task.id, update)

      // 繰り返しタスクを完了したら次回分を自動生成する
      if (status === 'done' && task.recurrence !== 'none' && task.due_date) {
        const next = nextDueDate(task.due_date, task.recurrence)
        const nextStart = task.start_date ? nextDueDate(task.start_date, task.recurrence) : null
        if (next) {
          await addTask({
            title: task.title,
            memo: task.memo ?? undefined,
            parent_id: task.parent_id,
            priority: task.priority,
            category: task.category ?? undefined,
            start_date: nextStart,
            due_date: next,
            recurrence: task.recurrence,
          })
        }
      }
    },
    [updateTask, addTask],
  )

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    setStatus,
    refresh: fetchTasks,
  }
}
