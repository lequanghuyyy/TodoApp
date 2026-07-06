/**
 * features/tasks/components/TaskItem.jsx
 *
 * Hiển thị 1 task card với:
 * - Toggle button tròn (fill blue khi completed)
 * - Title, description (CSS line-clamp 2 dòng)
 * - Badge trạng thái + badge priority + badge hạn hoàn thành (pill-shaped)
 * - Ngày tạo format tiếng Việt (Intl.DateTimeFormat)
 * - Nút Edit / Delete — chỉ hiện khi hover
 * - Badge "Quá hạn" đỏ nếu dueDate đã qua và task chưa COMPLETED
 */

// ── Date formatters ─────────────────────────────────────────────
const DATETIME_FMT = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const DATE_FMT = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

// ── Badge metadata ──────────────────────────────────────────────
const STATUS_META = {
  COMPLETED: { label: 'Hoàn thành', cls: 'badge--completed' },
  PENDING:   { label: 'Đang làm',   cls: 'badge--pending' },
}

const PRIORITY_META = {
  HIGH:   { label: 'Cao',   cls: 'badge--high' },
  MEDIUM: { label: 'Vừa',   cls: 'badge--medium' },
  LOW:    { label: 'Thấp',  cls: 'badge--low' },
}

// ── Icons ───────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <polyline
      points="2,6 5,9 10,3"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// ── Due date badge helper ────────────────────────────────────────
/**
 * Tính trạng thái badge hạn hoàn thành.
 * @param {string|null} dueDate - 'YYYY-MM-DD' hoặc null
 * @param {string} status - 'PENDING' | 'COMPLETED'
 * @returns {{ label: string, cls: string } | null}
 */
function getDueDateBadge(dueDate, status) {
  if (!dueDate) return null

  const dueDateObj = new Date(dueDate + 'T00:00:00')  // parse as local date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isOverdue = dueDateObj < today && status !== 'COMPLETED'
  const label = 'Hạn: ' + DATE_FMT.format(dueDateObj)

  return {
    label,
    cls: isOverdue ? 'badge--overdue' : 'badge--due-date',
  }
}

// ── Component ───────────────────────────────────────────────────
const TaskItem = ({ task, onEdit, onDelete, onToggle }) => {
  const isCompleted = task.status === 'COMPLETED'
  const status   = STATUS_META[task.status]   ?? STATUS_META.PENDING
  const priority = PRIORITY_META[task.priority] ?? null
  const createdAt = task.createdAt
    ? DATETIME_FMT.format(new Date(task.createdAt))
    : '—'

  const dueDateBadge = getDueDateBadge(task.dueDate, task.status)

  return (
    <li className={`task-item${isCompleted ? ' task-item--completed' : ''}`}>

      {/* ── Toggle ── */}
      <div className="task-item__toggle">
        <button
          type="button"
          className={`task-item__toggle-btn${isCompleted ? ' task-item__toggle-btn--completed' : ''}`}
          onClick={() => onToggle(task.id)}
          aria-label={isCompleted ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
        >
          {isCompleted && <CheckIcon />}
        </button>
      </div>

      {/* ── Body ── */}
      <div className="task-item__body">
        <div className="task-item__header">
          <h3 className="task-item__title">{task.title}</h3>
        </div>

        {task.description && (
          <p className="task-item__desc">{task.description}</p>
        )}

        <div className="task-item__meta">
          {/* Status badge */}
          <span className={`badge ${status.cls}`}>{status.label}</span>

          {/* Priority badge */}
          {priority && (
            <span className={`badge ${priority.cls}`}>{priority.label}</span>
          )}

          {/* Due date badge — chỉ hiện khi có dueDate */}
          {dueDateBadge && (
            <span className={`badge ${dueDateBadge.cls}`}>
              <span className="material-symbols-outlined" style={{ fontSize: 11, marginRight: 3 }}>
                {dueDateBadge.cls === 'badge--overdue' ? 'warning' : 'event'}
              </span>
              {dueDateBadge.label}
            </span>
          )}

          {/* Date */}
          <span className="task-item__date">
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>schedule</span>
            {createdAt}
          </span>
        </div>
      </div>

      {/* ── Actions (visible on hover) ── */}
      <div className="task-item__actions">
        <button
          type="button"
          className="task-item__action-btn task-item__action-btn--edit"
          onClick={() => onEdit(task)}
          aria-label={`Sửa công việc: ${task.title}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
        </button>
        <button
          type="button"
          className="task-item__action-btn task-item__action-btn--delete"
          onClick={() => onDelete(task.id)}
          aria-label={`Xóa công việc: ${task.title}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
        </button>
      </div>

    </li>
  )
}

export default TaskItem
