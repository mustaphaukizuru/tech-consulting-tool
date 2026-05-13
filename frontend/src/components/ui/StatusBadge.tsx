import type { ProjectStatus, TaskStatus } from '@/types/api'

const projectMap: Record<ProjectStatus, { cls: string; label: string }> = {
  PENDING: { cls: 'badge badge-pending', label: 'Pending' },
  IN_PROGRESS: { cls: 'badge badge-progress', label: 'In Progress' },
  COMPLETED: { cls: 'badge badge-completed', label: 'Completed' },
  CANCELLED: { cls: 'badge badge-cancelled', label: 'Cancelled' },
}

const taskMap: Record<TaskStatus, { cls: string; label: string }> = {
  TODO: { cls: 'badge badge-todo', label: 'To Do' },
  IN_PROGRESS: { cls: 'badge badge-progress', label: 'In Progress' },
  DONE: { cls: 'badge badge-done', label: 'Done' },
  BLOCKED: { cls: 'badge badge-blocked', label: 'Blocked' },
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const m = projectMap[status]
  return <span className={m.cls}>{m.label}</span>
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const m = taskMap[status]
  return <span className={m.cls}>{m.label}</span>
}
