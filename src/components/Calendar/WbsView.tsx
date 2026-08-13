import { useMemo, useState } from 'react'
import type { Task, TaskStatus } from '../../lib/types'
import { buildTree, flattenTree } from '../../lib/tree'
import { toDateKey } from '../../lib/calendar'

const DAY_WIDTH = 28
const ROW_HEIGHT = 32
const LABEL_WIDTH = 200

function markerColor(node: Task, overdue: boolean) {
  if (node.status === 'done') return { pole: '#5f8e21', flag: '#94c948' } // brand
  if (overdue) return { pole: '#dc2626', flag: '#f87171' } // red
  if (node.status === 'in_progress') return { pole: '#b45309', flag: '#fbbf24' } // amber
  return { pole: '#9ca3af', flag: '#d1d5db' } // gray
}

export function WbsView({
  tasks,
  onOpenDetail,
}: {
  tasks: Task[]
  onOpenDetail: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
}) {
  const [cursor, setCursor] = useState(() => new Date())
  const year = cursor.getFullYear()
  const month = cursor.getMonth()

  const days = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
  }, [year, month])

  const tree = useMemo(() => buildTree(tasks), [tasks])
  const rows = useMemo(() => flattenTree(tree), [tree])

  const todayKey = toDateKey(new Date())

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="text-brand-600 hover:text-brand-800 px-2"
        >
          ←
        </button>
        <h2 className="text-sm font-semibold text-brand-800">
          {year}年 {month + 1}月 のWBS
        </h2>
        <button
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="text-brand-600 hover:text-brand-800 px-2"
        >
          →
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-brand-400 text-center py-12">タスクがありません</p>
      ) : (
        <div className="border border-brand-100 rounded-lg overflow-x-auto bg-white">
          <div style={{ width: LABEL_WIDTH + days.length * DAY_WIDTH }}>
            {/* ヘッダー: 日付 */}
            <div className="flex sticky top-0 bg-brand-50 border-b border-brand-200 z-10">
              <div
                className="shrink-0 px-2 py-1.5 text-xs font-semibold text-brand-700 border-r border-brand-200"
                style={{ width: LABEL_WIDTH }}
              >
                タスク
              </div>
              {days.map((d) => {
                const key = toDateKey(d)
                const isToday = key === todayKey
                return (
                  <div
                    key={key}
                    className={`shrink-0 text-center text-[10px] py-1.5 border-l border-brand-100 ${
                      isToday ? 'bg-brand-200 font-bold text-brand-800' : 'text-brand-400'
                    }`}
                    style={{ width: DAY_WIDTH }}
                  >
                    {d.getDate()}
                  </div>
                )
              })}
            </div>

            {/* 行: タスク */}
            {rows.map(({ node, depth }) => {
              const overdue =
                !!node.due_date && node.status !== 'done' && new Date(node.due_date) < new Date(todayKey)
              const colors = markerColor(node, overdue)

              return (
                <div
                  key={node.id}
                  className="flex items-center border-b border-brand-50 hover:bg-brand-50"
                  style={{ height: ROW_HEIGHT }}
                >
                  <button
                    onClick={() => onOpenDetail(node.id)}
                    className="shrink-0 text-left text-xs truncate px-2 border-r border-brand-100"
                    style={{ width: LABEL_WIDTH, paddingLeft: 8 + depth * 14 }}
                    title={node.title}
                  >
                    <span className={node.status === 'done' ? 'line-through text-brand-400' : 'text-gray-700'}>
                      {node.title}
                    </span>
                  </button>

                  <div className="flex relative">
                    {days.map((d) => {
                      const key = toDateKey(d)
                      const isDue = node.due_date === key
                      const isToday = key === todayKey
                      return (
                        <div
                          key={key}
                          className={`shrink-0 border-l border-brand-50 flex items-center justify-center ${
                            isToday ? 'bg-brand-100/60' : ''
                          }`}
                          style={{ width: DAY_WIDTH, height: ROW_HEIGHT }}
                        >
                          {isDue && (
                            <button
                              onClick={() => onOpenDetail(node.id)}
                              title={`期限: ${node.due_date}`}
                              className="cursor-pointer"
                            >
                              {/* 矢羽根(フラグ)マーカー */}
                              <svg width="14" height="22" viewBox="0 0 14 22">
                                <line x1="2" y1="2" x2="2" y2="20" stroke={colors.pole} strokeWidth="2" />
                                <path d="M2,2 L13,6 L2,10 Z" fill={colors.flag} stroke={colors.pole} strokeWidth="1" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mt-3 text-xs text-brand-500">
        <span className="flex items-center gap-1">
          <svg width="10" height="14" viewBox="0 0 14 22">
            <line x1="2" y1="2" x2="2" y2="20" stroke="#9ca3af" strokeWidth="2" />
            <path d="M2,2 L13,6 L2,10 Z" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
          </svg>
          未着手
        </span>
        <span className="flex items-center gap-1">
          <svg width="10" height="14" viewBox="0 0 14 22">
            <line x1="2" y1="2" x2="2" y2="20" stroke="#b45309" strokeWidth="2" />
            <path d="M2,2 L13,6 L2,10 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
          </svg>
          着手中
        </span>
        <span className="flex items-center gap-1">
          <svg width="10" height="14" viewBox="0 0 14 22">
            <line x1="2" y1="2" x2="2" y2="20" stroke="#5f8e21" strokeWidth="2" />
            <path d="M2,2 L13,6 L2,10 Z" fill="#94c948" stroke="#5f8e21" strokeWidth="1" />
          </svg>
          完了
        </span>
        <span className="flex items-center gap-1">
          <svg width="10" height="14" viewBox="0 0 14 22">
            <line x1="2" y1="2" x2="2" y2="20" stroke="#dc2626" strokeWidth="2" />
            <path d="M2,2 L13,6 L2,10 Z" fill="#f87171" stroke="#dc2626" strokeWidth="1" />
          </svg>
          期限超過
        </span>
      </div>
    </div>
  )
}
