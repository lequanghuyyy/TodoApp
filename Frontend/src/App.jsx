import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTasks } from './features/tasks/hooks/useTasks'
import TaskList from './features/tasks/components/TaskList'
import TaskForm from './features/tasks/components/TaskForm'
import TaskFilter from './features/tasks/components/TaskFilter'
import SortSelector from './features/tasks/components/SortSelector'
import Pagination from './features/tasks/components/Pagination'
import ConfirmDialog from './components/ConfirmDialog/ConfirmDialog'
import Modal from './components/Modal/Modal'
import { deleteTask, toggleTaskStatus } from './features/tasks/api/taskApi'
import './App.css'

function App() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const initialStatus = searchParams.get('status') || ''
  const initialSortBy = searchParams.get('sortBy') || 'CREATED_AT'
  const initialSortDir = searchParams.get('sortDir') || 'DESC'
  const initialPage = parseInt(searchParams.get('page') || '0', 10)

  const { tasks, setTasks, loading, error, pagination, filters, setSearch, setStatusFilter, setSort, setPage, refetch } = useTasks({ 
    initialSearch, 
    initialStatus,
    initialSortBy,
    initialSortDir,
    initialPage
  })
  
  // Sync filter state to URL (using replaceState)
  useEffect(() => {
    const newParams = new URLSearchParams()
    if (filters.search) newParams.set('search', filters.search)
    if (filters.status) newParams.set('status', filters.status)
    if (filters.sortBy && filters.sortBy !== 'CREATED_AT') newParams.set('sortBy', filters.sortBy)
    if (filters.sortDir && filters.sortDir !== 'DESC') newParams.set('sortDir', filters.sortDir)
    if (pagination.page > 0) newParams.set('page', pagination.page.toString())
    setSearchParams(newParams, { replace: true })
  }, [filters.search, filters.status, filters.sortBy, filters.sortDir, pagination.page, setSearchParams])
  
  // -- State quản lý UI --
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)
  const [toast, setToast] = useState(null) // { message, type: 'success' | 'error' }
  const togglingTaskIds = useRef(new Set())

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingTask) return
    try {
      await deleteTask(deletingTask.id)
      showToast('Xóa công việc thành công!')
      refetch()
    } catch (error) {
      if (error.status === 404) {
        showToast('Công việc này không còn tồn tại, có thể đã bị xóa', 'error')
        refetch() // Vẫn refetch để đồng bộ UI
      } else {
        showToast(error.message || 'Lỗi khi xóa công việc', 'error')
      }
    } finally {
      setDeletingTask(null)
    }
  }

  const handleToggle = async (id) => {
    if (togglingTaskIds.current.has(id)) return
    
    const taskIndex = tasks.findIndex(t => t.id === id)
    if (taskIndex === -1) return
    const task = tasks[taskIndex]
    const originalStatus = task.status
    const newStatus = originalStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED'

    // 1. Optimistic Update
    togglingTaskIds.current.add(id)
    setTasks(currentTasks => {
      const idx = currentTasks.findIndex(t => t.id === id)
      if (idx === -1) return currentTasks
      const updated = [...currentTasks]
      updated[idx] = { ...updated[idx], status: newStatus }
      return updated
    })

    // 2. Call API
    try {
      await toggleTaskStatus(id)
    } catch (error) {
      // 3. Rollback UI on failure
      setTasks(currentTasks => {
        const idx = currentTasks.findIndex(t => t.id === id)
        if (idx === -1) return currentTasks // có thể task đã bị xóa ở tab khác
        const reverted = [...currentTasks]
        reverted[idx] = { ...reverted[idx], status: originalStatus }
        return reverted
      })
      showToast('Không thể cập nhật trạng thái, công việc có thể đã bị thay đổi hoặc xóa', 'error')
    } finally {
      togglingTaskIds.current.delete(id)
    }
  }

  return (
    <div className="app">
      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`toast-notification toast--${toast.type}`} role="alert">
          {toast.message}
        </div>
      )}

      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__brand">
            <span className="app-header__logo-bar" aria-hidden="true" />
            <h1 className="app-header__title">SRT Todo</h1>
          </div>
          <span className="app-header__count">
            {loading ? '…' : `${pagination.totalElements} công việc`}
          </span>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="app-main">
        <div className="app-content">
          <TaskForm 
            mode="create" 
            onSuccess={() => {
              showToast('Tạo công việc thành công!')
              refetch()
            }} 
          />

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

          <TaskList
            tasks={tasks}
            loading={loading}
            error={error}
            onEdit={setEditingTask}
            onDelete={(id) => {
              const task = tasks.find(t => t.id === id)
              if (task) setDeletingTask(task)
            }}
            onToggle={handleToggle}
            currentPage={pagination.page}
            onResetPage={() => setPage(0)}
          />

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      </main>

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
              refetch()
            }}
            onNotFound={() => {
              showToast('Công việc này không còn tồn tại, có thể đã bị xóa', 'error')
              setEditingTask(null)
              refetch()
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
