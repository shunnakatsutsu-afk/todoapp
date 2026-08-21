import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Project } from '../lib/types'

const DEFAULT_PROJECT_NAME = 'マイプロジェクト'

export function useProjects(userId: string | undefined) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const ensuredRef = useRef(false)

  const fetchProjects = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!userId) return
      if (!opts?.silent) setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setProjects((data ?? []) as Project[])
        setError(null)
      }
      if (!opts?.silent) setLoading(false)
    },
    [userId],
  )

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // 初回起動時、プロジェクトが1つもなければデフォルトを自動作成し、
  // project_id未設定の既存タスクをそこへ割り当てる(過去バージョンからの移行対応)
  useEffect(() => {
    if (!userId || loading || ensuredRef.current) return
    if (projects.length > 0) {
      ensuredRef.current = true
      return
    }
    ensuredRef.current = true
    void (async () => {
      const { data: created, error: insertError } = await supabase
        .from('projects')
        .insert({ user_id: userId, name: DEFAULT_PROJECT_NAME })
        .select()
        .single()

      if (insertError || !created) {
        setError(insertError?.message ?? 'プロジェクトの作成に失敗しました')
        return
      }

      await supabase.from('tasks').update({ project_id: created.id }).is('project_id', null).eq('user_id', userId)
      await fetchProjects()
    })()
  }, [userId, loading, projects.length, fetchProjects])

  const addProject = useCallback(
    async (name: string) => {
      if (!userId) return
      const { error: insertError } = await supabase
        .from('projects')
        .insert({ user_id: userId, name, sort_order: projects.length })
      if (insertError) {
        setError(insertError.message)
      } else {
        await fetchProjects({ silent: true })
      }
    },
    [userId, projects.length, fetchProjects],
  )

  const renameProject = useCallback(
    async (id: string, name: string) => {
      const { error: updateError } = await supabase.from('projects').update({ name }).eq('id', id)
      if (updateError) {
        setError(updateError.message)
      } else {
        await fetchProjects({ silent: true })
      }
    },
    [fetchProjects],
  )

  const deleteProject = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from('projects').delete().eq('id', id)
      if (deleteError) {
        setError(deleteError.message)
      } else {
        await fetchProjects({ silent: true })
      }
    },
    [fetchProjects],
  )

  return { projects, loading, error, addProject, renameProject, deleteProject }
}
