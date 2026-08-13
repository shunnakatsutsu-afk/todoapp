import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { NewTask, Task, TaskStatus, TaskUpdate } from '../lib/types'
import { nextDueDate } from '../lib/recurrence'

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    if (!userId) return
    setLoading(true)
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
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // 別デバイスでの変更も反映されるようにリアルタイム購読する
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
        () => {
          fetchTasks()
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
      if (insertError) setError(insertError.message)
    },
    [userId],
  )

  const updateTask = useCallback(async (id: string, update: TaskUpdate) => {
    const { error: updateError } = await supabase.from('tasks').update(update).eq('id', id)
    if (updateError) setError(updateError.message)
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase.from('tasks').delete().eq('id', id)
    if (deleteError) setError(deleteError.message)
  }, [])

  const setStatus = useCallback(
    async (task: Task, status: TaskStatus) => {
      const update: TaskUpdate = { status }
      update.completed_at = status === 'done' ? new Date().toISOString() : null
      await updateTask(task.id, update)

      // 繰り返しタスクを完了したら次回分を自動生成する
      if (status === 'done' && task.recurrence !== 'none' && task.due_date) {
        const next = nextDueDate(task.due_date, task.recurrence)
        if (next) {
          await addTask({
            title: task.title,
            memo: task.memo ?? undefined,
            parent_id: task.parent_id,
            priority: task.priority,
            category: task.category ?? undefined,
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
