/**
 * features/tasks/components/TaskItem.jsx
 *
 * Hiển thị 1 task card với:
 * - Toggle button (hoàn thành / chưa hoàn thành)
 * - Title, description (CSS line-clamp 2 dòng)
 * - Badge trạng thái + badge priority
 * - Ngày tạo format tiếng Việt (Intl.DateTimeFormat)
 * - Nút Edit / Delete có aria-label đầy đủ
 */

// ── Date formatter — khởi tạo 1 lần, không tạo lại mỗi lần render ─
const DATE_FMT = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

// ── Badge metadata ──────────────────────────────────────────────────
const STATUS_META = {
  COMPLETED: { label: 'Hoàn thành', cls: 'badge--completed' },
  PENDING: { label: 'Đang làm', cls: 'badge--pending' },
}

const PRIORITY_META = {
  HIGH: { label: 'Ưu tiên cao', cls: 'badge--high' },
  MEDIUM: { label: 'Ưu tiên trung bình', cls: 'badge--medium' },
  LOW: { label: 'Ưu tiên thấp', cls: 'badge--low' },
}

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <polyline
      points="2,6 5,9 10,3"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const DeleteIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)

// ── Component ───────────────────────────────────────────────────────
const TaskItem = ({ task, onEdit, onDelete, onToggle }) => {
  const isCompleted = task.status === 'COMPLETED'
  const status = STATUS_META[task.status] ?? STATUS_META.PENDING
  const priority = PRIORITY_META[task.priority] ?? null
  const createdAt = task.createdAt
    ? DATE_FMT.format(new Date(task.createdAt))
    : '—'

  return (
    <li className={`task-item${isCompleted ? ' task-item--completed' : ''}`}>

      {/* ── Toggle (hoàn thành / bỏ hoàn thành) ── */}
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

      {/* ── Nội dung chính ── */}
      <div className="task-item__body">
        <div className="task-item__header">
          <h3 className="task-item__title">{task.title}</h3>
        </div>

        {task.description && (
          <p className="task-item__desc">{task.description}</p>
        )}

        <div className="task-item__meta">
          {/* Badge trạng thái */}
          <span className={`badge ${status.cls}`}>{status.label}</span>

          {/* Badge priority (chỉ hiển thị nếu có) */}
          {priority && (
            <span className={`badge ${priority.cls}`}>{priority.label}</span>
          )}

          {/* Ngày tạo */}
          <span className="task-item__date">{createdAt}</span>
        </div>
      </div>

      {/* ── Nút hành động ── */}
      <div className="task-item__actions">
        <button
          type="button"
          className="task-item__action-btn task-item__action-btn--edit"
          onClick={() => onEdit(task)}
          aria-label={`Sửa công việc: ${task.title}`}
        >
          <EditIcon />
        </button>
        <button
          type="button"
          className="task-item__action-btn task-item__action-btn--delete"
          onClick={() => onDelete(task.id)}
          aria-label={`Xóa công việc: ${task.title}`}
        >
          <DeleteIcon />
        </button>
      </div>

    </li>
  )
}

export default TaskItem
