/**
 * features/tasks/components/TaskList.jsx
 *
 * Hiển thị danh sách TaskItem với 3 trạng thái:
 * 1. loading = true  → Skeleton loading (shimmer animation, KHÔNG dùng spinner)
 * 2. tasks rỗng      → Empty state với icon + message thân thiện
 * 3. có data         → Danh sách <ul> với key={task.id} (KHÔNG dùng index)
 */

import TaskItem from './TaskItem'
import './TaskList.css'

// ── Số lượng skeleton hiển thị khi đang load ─────────────────────
const SKELETON_COUNT = 5

// ── SVG icon cho empty state ──────────────────────────────────────
const ClipboardIcon = () => (
  <svg
    className="task-empty__icon"
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
  >
    <rect x="12" y="10" width="40" height="48" rx="4"
      stroke="currentColor" strokeWidth="2.5" />
    <rect x="22" y="6" width="20" height="10" rx="3"
      stroke="currentColor" strokeWidth="2.5" fill="none" />
    <line x1="22" y1="28" x2="42" y2="28"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="22" y1="36" x2="38" y2="36"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="22" y1="44" x2="34" y2="44"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)

// ── Skeleton item — 1 khung nhấp nháy ────────────────────────────
const SkeletonItem = () => (
  <li className="skeleton-item" aria-hidden="true">
    {/* Hình tròn giả toggle button */}
    <div
      className="skeleton-block"
      style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0 }}
    />
    {/* Nội dung giả */}
    <div className="skeleton-item__content">
      <div className="skeleton-block" style={{ height: 15, width: '58%' }} />
      <div className="skeleton-block" style={{ height: 13, width: '82%' }} />
      <div className="skeleton-block" style={{ height: 13, width: '42%' }} />
    </div>
  </li>
)

const TaskList = ({ tasks, loading, error, onEdit, onDelete, onToggle, currentPage, onResetPage }) => {
  // Trạng thái 1: Đang tải → hiển thị skeleton
  if (loading) {
    return (
      <ul className="task-list" aria-label="Đang tải danh sách công việc">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <SkeletonItem key={i} />
        ))}
      </ul>
    )
  }

  // Lỗi API
  if (error) {
    return (
      <div className="task-error" role="alert">
        {error}
      </div>
    )
  }

  // Trạng thái 2: Không có task nào
  if (!tasks || tasks.length === 0) {
    if (currentPage > 0) {
      return (
        <div className="task-empty" role="status">
          <ClipboardIcon />
          <p className="task-empty__title">Trang này không có dữ liệu</p>
          <p className="task-empty__subtitle">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          {onResetPage && (
            <button 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors min-h-[44px]"
              onClick={onResetPage}
            >
              Quay về trang đầu
            </button>
          )}
        </div>
      )
    }

    return (
      <div className="task-empty" role="status">
        <ClipboardIcon />
        <p className="task-empty__title">Chưa có công việc nào</p>
        <p className="task-empty__subtitle">
          Hãy thêm công việc đầu tiên của bạn!
        </p>
      </div>
    )
  }

  // Trạng thái 3: Có dữ liệu → render danh sách
  return (
    <ul className="task-list" aria-label="Danh sách công việc">
      {tasks.map((task) => (
        // key = task.id (TUYỆT ĐỐI không dùng index — tránh re-render sai)
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </ul>
  )
}

export default TaskList
