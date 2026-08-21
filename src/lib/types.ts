export type TaskStatus = 'not_started' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly'

export interface Task {
  id: string
  user_id: string
  parent_id: string | null
  title: string
  memo: string | null
  status: TaskStatus
  priority: TaskPriority
  category: string | null
  start_date: string | null // YYYY-MM-DD
  due_date: string | null // YYYY-MM-DD
  recurrence: Recurrence
  sort_order: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type NewTask = Pick<Task, 'title'> &
  Partial<
    Pick<
      Task,
      | 'parent_id'
      | 'memo'
      | 'status'
      | 'priority'
      | 'category'
      | 'start_date'
      | 'due_date'
      | 'recurrence'
    >
  >

export type TaskUpdate = Partial<
  Pick<
    Task,
    | 'title'
    | 'memo'
    | 'status'
    | 'priority'
    | 'category'
    | 'start_date'
    | 'due_date'
    | 'recurrence'
    | 'parent_id'
    | 'sort_order'
    | 'completed_at'
  >
>

export interface TaskNode extends Task {
  children: TaskNode[]
}

export const STATUS_LABEL: Record<TaskStatus, string> = {
  not_started: '未着手',
  in_progress: '着手中',
  done: '完了',
}

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
}

export const RECURRENCE_LABEL: Record<Recurrence, string> = {
  none: 'なし',
  daily: '毎日',
  weekly: '毎週',
  monthly: '毎月',
}
