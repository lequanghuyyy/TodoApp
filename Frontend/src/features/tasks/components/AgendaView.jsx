/**
 * features/tasks/components/AgendaView.jsx
 *
 * Lịch trình 7 ngày (Agenda View).
 * Hiển thị danh sách task theo từng ngày trong khoảng 7 ngày.
 *
 * Nguồn dữ liệu: danh sách nhóm { date, tasks } trả về từ /api/tasks/by-date.
 */

import TaskItem from './TaskItem'
import './AgendaView.css'

// ── Date formatter ─────────────────────────────────────────────
const DATE_HEADING_FMT = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit'
})

// ── Helpers ─────────────────────────────────────────────────────

/** Trả về 'YYYY-MM-DD' từ Date object theo local time. */
function toLocalDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Trả về label hiển thị cho nhóm ngày. */
function getDateLabel(dateKey) {
  const today     = toLocalDateString(new Date())
  const tomorrow  = toLocalDateString(new Date(Date.now() + 86400000))
  const yesterday = toLocalDateString(new Date(Date.now() - 86400000))

  const dateObj = new Date(dateKey + 'T00:00:00')
  if (dateKey === today)    return 'Hôm nay — ' + DATE_HEADING_FMT.format(dateObj)
  if (dateKey === tomorrow) return 'Ngày mai — ' + DATE_HEADING_FMT.format(dateObj)
  if (dateKey === yesterday) return 'Hôm qua — ' + DATE_HEADING_FMT.format(dateObj)
  return DATE_HEADING_FMT.format(dateObj)
}

/** Kiểm tra ngày đã qua chưa (so với hôm nay). */
function isPast(dateKey) {
  return dateKey < toLocalDateString(new Date())
}

/** Kiểm tra hôm nay. */
function isToday(dateKey) {
  return dateKey === toLocalDateString(new Date())
}

// ── Skeleton ────────────────────────────────────────────────────
const SkeletonGroup = () => (
  <div className="agenda-group" aria-hidden="true">
    <div className="agenda-group__header">
      <div className="skeleton-block" style={{ height: 16, width: 200, borderRadius: 6 }} />
    </div>
    {[1].map(i => (
      <div key={i} className="skeleton-item" style={{ marginBottom: 8 }}>
        <div className="skeleton-block" style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0 }} />
        <div className="skeleton-item__content">
          <div className="skeleton-block" style={{ height: 14, width: '55%' }} />
          <div className="skeleton-block" style={{ height: 12, width: '75%' }} />
        </div>
      </div>
    ))}
  </div>
)

// ── AgendaView ──────────────────────────────────────────────────
const AgendaView = ({ groups, loading, error, onEdit, onDelete, onToggle }) => {
  
  // ── Error ────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="task-error" role="alert">{error}</div>
    )
  }

  // ── Loading ──────────────────────────────────────────────────
  if (loading && (!groups || groups.length === 0)) {
    return (
      <div className="agenda-view">
        <SkeletonGroup />
        <SkeletonGroup />
        <SkeletonGroup />
      </div>
    )
  }

  // ── Content ──────────────────────────────────────────────────
  return (
    <div className="agenda-view relative" aria-label="Xem công việc theo ngày">
      {loading && (
        <div className="absolute inset-0 bg-surface/50 backdrop-blur-[1px] z-10 flex justify-center pt-10 rounded-xl">
           <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {groups && groups.map(group => {
        const past = isPast(group.date)
        const today = isToday(group.date)
        const label = getDateLabel(group.date)
        const isEmpty = !group.tasks || group.tasks.length === 0

        return (
          <section key={group.date} className={`agenda-group ${today ? 'ring-2 ring-primary ring-opacity-20 rounded-xl bg-primary/5 p-4 -mx-4' : ''}`}>
            <div className={`agenda-group__header${past ? ' agenda-group__header--past' : ''}`}>
              <span className={`material-symbols-outlined agenda-group__icon ${today ? 'text-primary' : ''}`}>
                {today ? 'today' : (past ? 'history' : 'calendar_today')}
              </span>
              <h2 className={`agenda-group__title ${today ? 'text-primary font-bold' : ''}`}>{label}</h2>
              <span className={`agenda-group__count ${today ? 'bg-primary/20 text-primary' : ''}`}>
                {group.tasks ? group.tasks.length : 0}
              </span>
            </div>

            {isEmpty ? (
              <div className="text-on-surface-variant text-body-md italic py-4 px-10 border-l-2 border-surface-variant ml-[11px]">
                Không có công việc nào trong ngày này.
              </div>
            ) : (
              <ul className="task-list" aria-label={`Công việc ${label}`}>
                {group.tasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggle={onToggle}
                  />
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}

export default AgendaView
