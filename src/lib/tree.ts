import type { Task, TaskNode } from './types'

/** フラットなタスク配列を親子構造(ツリー)に組み立てる */
export function buildTree(tasks: Task[]): TaskNode[] {
  const map = new Map<string, TaskNode>()
  tasks.forEach((t) => map.set(t.id, { ...t, children: [] }))
  const roots: TaskNode[] = []

  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

/** 指定タスクの子孫すべてのIDを取得する(削除時や親選択の除外に使う) */
export function getDescendantIds(tasks: Task[], id: string): string[] {
  const children = tasks.filter((t) => t.parent_id === id)
  return children.flatMap((c) => [c.id, ...getDescendantIds(tasks, c.id)])
}

/** ツリーを深さ優先でフラット化する(WBS表示などで行として並べるために使う) */
export function flattenTree(nodes: TaskNode[], depth = 0): { node: TaskNode; depth: number }[] {
  return nodes.flatMap((n) => [{ node: n, depth }, ...flattenTree(n.children, depth + 1)])
}

/** 子タスクの完了割合を計算する */
export function progressOf(node: TaskNode): { done: number; total: number } {
  if (node.children.length === 0) {
    return { done: node.status === 'done' ? 1 : 0, total: 1 }
  }
  let done = 0
  let total = 0
  for (const c of node.children) {
    const p = progressOf(c)
    done += p.done
    total += p.total
  }
  return { done, total }
}
