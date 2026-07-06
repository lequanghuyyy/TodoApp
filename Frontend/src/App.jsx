import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTasks } from './features/tasks/hooks/useTasks'
import { useAgendaTasks } from './features/tasks/hooks/useAgendaTasks'
import TaskList from './features/tasks/components/TaskList'
import AgendaView from './features/tasks/components/AgendaView'
import TaskForm from './features/tasks/components/TaskForm'
import TaskFilter from './features/tasks/components/TaskFilter'
import SortSelector from './features/tasks/components/SortSelector'
import Pagination from './features/tasks/components/Pagination'
import ConfirmDialog from './components/ConfirmDialog/ConfirmDialog'
import Modal from './components/Modal/Modal'
import { deleteTask, toggleTaskStatus } from './features/tasks/api/taskApi'
import './App.css'

// ── Chế độ xem ────────────────────────────────────────────────
const VIEW_DASHBOARD = 'dashboard'
const VIEW_AGENDA = 'agenda'

const formatDateDM = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getDate()}/${d.getMonth() + 1}`
}

function App() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const initialStatus = searchParams.get('status') || ''
  const initialSortBy = searchParams.get('sortBy') || 'CREATED_AT'
  const initialSortDir = searchParams.get('sortDir') || 'DESC'
  const initialPage = parseInt(searchParams.get('page') || '0', 10)
  const initialView = searchParams.get('view') === 'agenda' ? VIEW_AGENDA : VIEW_DASHBOARD

  // ── Trạng thái chế độ xem ──────────────────────────────────
  const [activeView, setActiveView] = useState(initialView)

  // ── Dashboard hook ─────────────────────────────────────────
  const {
    tasks, setTasks, loading, error, pagination, filters,
    setSearch, setStatusFilter, setSort, setPage, refetch
  } = useTasks({
    initialSearch,
    initialStatus,
    initialSortBy,
    initialSortDir,
    initialPage
  })

  // ── Agenda hook ────────────────────────────────────────────
  const [agendaStartDate, setAgendaStartDate] = useState(() => {
    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const d = String(today.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  })

  // Compute toDate (6 days after fromDate)
  const agendaToDate = (() => {
    const d = new Date(agendaStartDate + 'T00:00:00')
    d.setDate(d.getDate() + 6)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  })()

  const {
    groups: agendaGroups,
    setGroups: setAgendaGroups,
    loading: agendaLoading,
    error: agendaError,
    refetch: agendaRefetch,
    updateTaskInGroups
  } = useAgendaTasks(agendaStartDate, agendaToDate)

  // Sync filter state to URL
  useEffect(() => {
    const newParams = new URLSearchParams()
    if (activeView !== VIEW_DASHBOARD) newParams.set('view', activeView)
    if (filters.search) newParams.set('search', filters.search)
    if (filters.status) newParams.set('status', filters.status)
    if (filters.sortBy && filters.sortBy !== 'CREATED_AT') newParams.set('sortBy', filters.sortBy)
    if (filters.sortDir && filters.sortDir !== 'DESC') newParams.set('sortDir', filters.sortDir)
    if (pagination.page > 0) newParams.set('page', pagination.page.toString())
    setSearchParams(newParams, { replace: true })
  }, [activeView, filters.search, filters.status, filters.sortBy, filters.sortDir, pagination.page, setSearchParams])

  // -- UI State --
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const togglingTaskIds = useRef(new Set())

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Hàm refetch cả 2 view khi có thay đổi data
  const refetchAll = () => {
    refetch()
    agendaRefetch()
  }

  const handleDeleteConfirm = async () => {
    if (!deletingTask) return
    try {
      await deleteTask(deletingTask.id)
      showToast('Xóa công việc thành công!')
      refetchAll()
    } catch (error) {
      if (error.status === 404) {
        showToast('Công việc này không còn tồn tại, có thể đã bị xóa', 'error')
        refetchAll()
      } else {
        showToast(error.message || 'Lỗi khi xóa công việc', 'error')
      }
    } finally {
      setDeletingTask(null)
    }
  }

  // Optimistic toggle — cập nhật cả 2 danh sách
  const handleToggle = async (id) => {
    if (togglingTaskIds.current.has(id)) return

    // Helper để toggle 1 mảng tasks trong Dashboard
    const optimisticToggle = (list) => {
      const idx = list.findIndex(t => t.id === id)
      if (idx === -1) return list
      const updated = [...list]
      const newStatus = updated[idx].status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
      updated[idx] = { ...updated[idx], status: newStatus }
      return updated
    }

    // Cập nhật 1 task
    const toggleTaskStatusLocal = (task) => {
      if (!task) return null
      return { ...task, status: task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' }
    }

    const taskInDashboard = tasks.find(t => t.id === id)
    // Find task in agenda groups
    let taskInAgenda = null
    for (const group of agendaGroups) {
      const found = group.tasks.find(t => t.id === id)
      if (found) {
        taskInAgenda = found
        break
      }
    }

    const task = taskInDashboard || taskInAgenda
    if (!task) return
    const originalStatus = task.status

    togglingTaskIds.current.add(id)
    setTasks(prev => optimisticToggle(prev))
    updateTaskInGroups(id, toggleTaskStatusLocal)

    try {
      await toggleTaskStatus(id)
    } catch (error) {
      // Rollback cả 2
      const revert = (list) => {
        const idx = list.findIndex(t => t.id === id)
        if (idx === -1) return list
        const reverted = [...list]
        reverted[idx] = { ...reverted[idx], status: originalStatus }
        return reverted
      }
      setTasks(prev => revert(prev))
      updateTaskInGroups(id, (t) => t ? { ...t, status: originalStatus } : null)
      showToast('Không thể cập nhật trạng thái, công việc có thể đã bị thay đổi hoặc xóa', 'error')
    } finally {
      togglingTaskIds.current.delete(id)
    }
  }

  // Xác định tasks/handler cho view hiện tại
  const handleDelete = (id) => {
    let task = null
    if (activeView === VIEW_AGENDA) {
      for (const group of agendaGroups) {
        const found = group.tasks.find(t => t.id === id)
        if (found) {
          task = found
          break
        }
      }
    } else {
      task = tasks.find(t => t.id === id)
    }
    if (task) setDeletingTask(task)
  }

  return (
    <div className="app">
      {/* ── Toast ── */}
      {toast && (
        <div className={`toast-notification toast--${toast.type}`} role="alert">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.message}
        </div>
      )}

      {/* ── Sidebar Overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside className={`app-sidebar${sidebarOpen ? ' app-sidebar--open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <span className="material-symbols-outlined sidebar-brand__icon fill">task_alt</span>
          <div>
            <div className="sidebar-brand__title">TaskFlow</div>
            <div className="sidebar-brand__subtitle">Productivity Mode</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          <button
            className={`sidebar-nav__link${activeView === VIEW_DASHBOARD ? ' sidebar-nav__link--active' : ''}`}
            onClick={() => { setActiveView(VIEW_DASHBOARD); setSidebarOpen(false) }}
          >
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </button>
          <button
            className={`sidebar-nav__link${activeView === VIEW_AGENDA ? ' sidebar-nav__link--active' : ''}`}
            onClick={() => { setActiveView(VIEW_AGENDA); setSidebarOpen(false) }}
          >
            <span className="material-symbols-outlined">calendar_today</span>
            Lịch (Agenda)
          </button>
        </nav>

        {/* CTA */}
        <button
          className="sidebar-cta"
          id="sidebar-create-btn"
          onClick={() => { setIsCreateOpen(true); setSidebarOpen(false) }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
          Tạo công việc mới
        </button>
      </aside>

      {/* ══════════════ WORKSPACE ══════════════ */}
      <div className="app-workspace">
        {/* TopBar */}
        <header className="app-topbar">
          {/* Hamburger (mobile) */}
          <button
            className="topbar-menu-btn"
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Mở menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          {/* Search */}
          <div className="topbar-search">
            <span className="material-symbols-outlined topbar-search__icon">search</span>
            <input
              className="topbar-search__input"
              type="text"
              placeholder="Tìm kiếm công việc..."
              value={filters.search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Tìm kiếm công việc"
              id="topbar-search-input"
            />
          </div>

          {/* Actions */}
          <div className="topbar-actions">
            <div className="topbar-divider" aria-hidden="true" />
            <button
              className="topbar-add-btn"
              id="topbar-add-task-btn"
              onClick={() => setIsCreateOpen(true)}
            >
              <span className="material-symbols-outlined">add</span>
              Thêm công việc
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="app-main">
          {/* ── Dashboard View ── */}
          {activeView === VIEW_DASHBOARD && (
            <>
              {/* Filter + Sort */}
              <div className="app-controls">
                <TaskFilter
                  search={filters.search}
                  status={filters.status}
                  onSearchChange={setSearch}
                  onStatusChange={setStatusFilter}
                />
                <SortSelector
                  sortBy={filters.sortBy}
                  sortDir={filters.sortDir}
                  onSortChange={setSort}
                />
              </div>

              {/* Task List */}
              <TaskList
                tasks={tasks}
                loading={loading}
                error={error}
                onEdit={setEditingTask}
                onDelete={handleDelete}
                onToggle={handleToggle}
                currentPage={pagination.page}
                onResetPage={() => setPage(0)}
              />

              {/* Pagination */}
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </>
          )}

          {/* ── Agenda View ── */}
          {activeView === VIEW_AGENDA && (
            <>
              <div className="agenda-header-bar flex items-center justify-center mb-6">
                <div className="flex items-center gap-4 bg-surface-container-low rounded-full p-2 px-6 border border-outline-variant/30 shadow-sm">
                  <button
                    className="topbar-icon-btn hover:bg-surface-variant rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                    onClick={() => {
                      const d = new Date(agendaStartDate + 'T00:00:00')
                      d.setDate(d.getDate() - 7)
                      const y = d.getFullYear()
                      const m = String(d.getMonth() + 1).padStart(2, '0')
                      const day = String(d.getDate()).padStart(2, '0')
                      setAgendaStartDate(`${y}-${m}-${day}`)
                    }}
                    title="Tuần trước"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>chevron_left</span>
                  </button>

                  <div className="flex items-center gap-2 min-w-[280px] justify-center">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>
                      calendar_month
                    </span>
                    <h1 className="agenda-heading" style={{ fontSize: '18px', whiteSpace: 'nowrap' }}>
                      Lịch trình 7 ngày (từ {formatDateDM(agendaStartDate)} đến {formatDateDM(agendaToDate)})
                    </h1>
                  </div>

                  <button
                    className="topbar-icon-btn hover:bg-surface-variant rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                    onClick={() => {
                      const d = new Date(agendaStartDate + 'T00:00:00')
                      d.setDate(d.getDate() + 7)
                      const y = d.getFullYear()
                      const m = String(d.getMonth() + 1).padStart(2, '0')
                      const day = String(d.getDate()).padStart(2, '0')
                      setAgendaStartDate(`${y}-${m}-${day}`)
                    }}
                    title="Tuần sau"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>chevron_right</span>
                  </button>
                </div>
              </div>

              <AgendaView
                groups={agendaGroups}
                loading={agendaLoading}
                error={agendaError}
                onEdit={setEditingTask}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            </>
          )}
        </main>
      </div>

      {/* ── Create Task Modal ── */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tạo công việc mới"
      >
        <TaskForm
          mode="create"
          onSuccess={() => {
            showToast('Tạo công việc thành công!')
            setIsCreateOpen(false)
            refetchAll()
          }}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>

      {/* ── Edit Task Modal ── */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Chỉnh sửa công việc"
      >
        {editingTask && (
          <TaskForm
            mode="edit"
            initialData={editingTask}
            onSuccess={() => {
              showToast('Cập nhật công việc thành công!')
              setEditingTask(null)
              refetchAll()
            }}
            onNotFound={() => {
              showToast('Công việc này không còn tồn tại, có thể đã bị xóa', 'error')
              setEditingTask(null)
              refetchAll()
            }}
            onCancel={() => setEditingTask(null)}
          />
        )}
      </Modal>

      {/* ── Delete Confirm Dialog ── */}
      <ConfirmDialog
        isOpen={!!deletingTask}
        message={`Bạn có chắc muốn xóa công việc '${deletingTask?.title}'? Hành động này không thể hoàn tác.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTask(null)}
      />
    </div>
  )
}

export default App
