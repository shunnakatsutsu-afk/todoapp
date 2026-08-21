import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from 'react'
import type { Task, TaskStatus } from '../../lib/types'
import { buildTree, flattenTree } from '../../lib/tree'
import { addDays, startOfToday, toDateKey } from '../../lib/calendar'

const DAY_WIDTH = 28
const ROW_HEIGHT = 32
const LABEL_WIDTH = 200
const WINDOW_SIZE = 21 // 表示する日数(3週間)
const STEP_DAYS = 7 // 前へ/次へで動かす日数

function markerColor(node: Task, overdue: boolean) {
  if (node.status === 'done') return { pole: '#5f8e21', flag: '#94c948' } // brand
  if (overdue) return { pole: '#dc2626', flag: '#f87171' } // red
  if (node.status === 'in_progress') return { pole: '#b45309', flag: '#fbbf24' } // amber
  return { pole: '#9ca3af', flag: '#d1d5db' } // gray
}

function dayIndex(dateKey: string, windowStart: Date): number {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return Math.round((date.getTime() - windowStart.getTime()) / 86_400_000)
}

export function WbsView({
  tasks,
  onOpenDetail,
}: {
  tasks: Task[]
  onOpenDetail: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
}) {
  const [windowStart, setWindowStart] = useState(() => startOfToday())

  const days = useMemo(
    () => Array.from({ length: WINDOW_SIZE }, (_, i) => addDays(windowStart, i)),
    [windowStart],
  )

  const tree = useMemo(() => buildTree(tasks), [tasks])
  const rows = useMemo(() => flattenTree(tree), [tree])

  // ネイティブのスクロールバーが環境によって表示されないことがあるため、
  // 自前のスクロールバー(トラック+つまみ)を表示する
  const scrollRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const [scrollMetrics, setScrollMetrics] = useState({ scrollLeft: 0, scrollWidth: 1, clientWidth: 1 })

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      setScrollMetrics({ scrollLeft: el.scrollLeft, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth })
    }
    update()
    el.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [days.length, rows.length])

  const hasOverflow = scrollMetrics.scrollWidth > scrollMetrics.clientWidth + 1
  const thumbWidthPct = Math.min(100, (scrollMetrics.clientWidth / scrollMetrics.scrollWidth) * 100)
  const maxScroll = scrollMetrics.scrollWidth - scrollMetrics.clientWidth
  const thumbLeftPct = maxScroll > 0 ? (scrollMetrics.scrollLeft / maxScroll) * (100 - thumbWidthPct) : 0

  const scrollToFraction = (clientX: number) => {
    const el = scrollRef.current
    const track = trackRef.current
    if (!el || !track) return
    const rect = track.getBoundingClientRect()
    const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    el.scrollLeft = fraction * (el.scrollWidth - el.clientWidth)
  }

  const handleTrackClick = (e: ReactMouseEvent<HTMLDivElement>) => scrollToFraction(e.clientX)

  const handleThumbPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handleThumbPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    scrollToFraction(e.clientX)
  }

  const handleThumbPointerUp = () => {
    draggingRef.current = false
  }

  const todayKey = toDateKey(startOfToday())
  const rangeLabel = `${days[0].getMonth() + 1}/${days[0].getDate()} 〜 ${days[days.length - 1].getMonth() + 1}/${days[days.length - 1].getDate()}`

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setWindowStart((d) => addDays(d, -STEP_DAYS))}
          className="text-brand-600 hover:text-brand-800 px-2"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-brand-800">{rangeLabel}</h2>
          <button
            onClick={() => setWindowStart(startOfToday())}
            className="text-xs text-brand-500 border border-brand-200 rounded-full px-2 py-0.5 hover:bg-brand-50"
          >
            今日
          </button>
        </div>
        <button
          onClick={() => setWindowStart((d) => addDays(d, STEP_DAYS))}
          className="text-brand-600 hover:text-brand-800 px-2"
        >
          →
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-brand-400 text-center py-12">タスクがありません</p>
      ) : (
        <div ref={scrollRef} className="border border-brand-100 rounded-lg overflow-x-auto brand-scrollbar bg-white">
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
                !!node.due_date && node.status !== 'done' && node.due_date < todayKey
              const colors = markerColor(node, overdue)

              const startIdx = node.start_date ? dayIndex(node.start_date, windowStart) : null
              const dueIdx = node.due_date ? dayIndex(node.due_date, windowStart) : null

              let bar: { left: number; width: number } | null = null
              let flagIdx: number | null = null

              if (startIdx !== null && dueIdx !== null) {
                const from = Math.min(startIdx, dueIdx)
                const to = Math.max(startIdx, dueIdx)
                if (to >= 0 && from < days.length) {
                  const clampedFrom = Math.max(0, from)
                  const clampedTo = Math.min(days.length - 1, to)
                  bar = { left: clampedFrom * DAY_WIDTH, width: (clampedTo - clampedFrom + 1) * DAY_WIDTH }
                }
              } else if (dueIdx !== null) {
                if (dueIdx >= 0 && dueIdx < days.length) flagIdx = dueIdx
              } else if (startIdx !== null) {
                if (startIdx >= 0 && startIdx < days.length) flagIdx = startIdx
              }

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

                  <div className="relative flex" style={{ width: days.length * DAY_WIDTH, height: ROW_HEIGHT }}>
                    {days.map((d) => {
                      const key = toDateKey(d)
                      const isToday = key === todayKey
                      return (
                        <div
                          key={key}
                          className={`shrink-0 border-l border-brand-50 ${isToday ? 'bg-brand-100/60' : ''}`}
                          style={{ width: DAY_WIDTH, height: ROW_HEIGHT }}
                        />
                      )
                    })}

                    {bar && (
                      <button
                        onClick={() => onOpenDetail(node.id)}
                        title={`${node.start_date} 〜 ${node.due_date}`}
                        className="absolute top-1/2 -translate-y-1/2 rounded-full cursor-pointer"
                        style={{
                          left: bar.left + 2,
                          width: Math.max(bar.width - 4, 6),
                          height: 10,
                          backgroundColor: colors.flag,
                          border: `1.5px solid ${colors.pole}`,
                        }}
                      />
                    )}

                    {flagIdx !== null && (
                      <button
                        onClick={() => onOpenDetail(node.id)}
                        title={node.due_date ? `期限: ${node.due_date}` : `開始: ${node.start_date}`}
                        className="absolute top-1/2 -translate-y-1/2 cursor-pointer"
                        style={{ left: flagIdx * DAY_WIDTH + DAY_WIDTH / 2 - 7 }}
                      >
                        <svg width="14" height="22" viewBox="0 0 14 22">
                          <line x1="2" y1="2" x2="2" y2="20" stroke={colors.pole} strokeWidth="2" />
                          <path d="M2,2 L13,6 L2,10 Z" fill={colors.flag} stroke={colors.pole} strokeWidth="1" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {hasOverflow && (
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="relative h-2.5 mt-2 rounded-full bg-brand-100 cursor-pointer"
        >
          <div
            onPointerDown={handleThumbPointerDown}
            onPointerMove={handleThumbPointerMove}
            onPointerUp={handleThumbPointerUp}
            className="absolute top-0 h-2.5 rounded-full bg-brand-400 hover:bg-brand-500 transition-colors cursor-grab active:cursor-grabbing"
            style={{ left: `${thumbLeftPct}%`, width: `${thumbWidthPct}%` }}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-brand-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-2.5 rounded-full bg-gray-300 border border-gray-400" />
          未着手/着手中/完了(バー: 開始日〜期限)
        </span>
        <span className="flex items-center gap-1">
          <svg width="10" height="14" viewBox="0 0 14 22">
            <line x1="2" y1="2" x2="2" y2="20" stroke="#dc2626" strokeWidth="2" />
            <path d="M2,2 L13,6 L2,10 Z" fill="#f87171" stroke="#dc2626" strokeWidth="1" />
          </svg>
          期限超過(旗)
        </span>
      </div>
    </div>
  )
}
