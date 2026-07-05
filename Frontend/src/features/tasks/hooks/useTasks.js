/**
 * features/tasks/hooks/useTasks.js
 *
 * Custom hook quản lý toàn bộ state và logic cho danh sách task:
 * - Fetch dữ liệu từ API với filter, sort, phân trang
 * - Debounce search (400ms) bằng useEffect + setTimeout
 * - AbortController: hủy request cũ trước khi gửi request mới (tránh race condition)
 * - Phân biệt AbortError (không set error) và lỗi API thật (set error)
 * - useCallback cho các action để tránh re-render thừa ở component con
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import { getTasks } from '../api/taskApi'

const DEFAULT_PAGE_SIZE = 10

export function useTasks({ 
  initialSearch = '', 
  initialStatus = '',
  initialSortBy = 'CREATED_AT',
  initialSortDir = 'DESC',
  initialPage = 0
} = {}) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [pagination, setPagination] = useState({
    page: Number(initialPage) || 0,
    size: DEFAULT_PAGE_SIZE,
    totalPages: 0,
    totalElements: 0,
  })

  const [filters, setFilters] = useState({
    search: initialSearch,
    status: initialStatus,
    sortBy: initialSortBy || 'CREATED_AT',
    sortDir: initialSortDir || 'DESC',
  })

  // fetchKey tăng lên 1 mỗi khi gọi refetch() để force re-run effect
  const [fetchKey, setFetchKey] = useState(0)

  // ── Debounce search ───────────────────────────────────────────────────────
  // Không để component tự quản lý timer — debounce ngay trong hook
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 400)
    return () => clearTimeout(timer) // cleanup: hủy timer cũ khi search thay đổi
  }, [filters.search])

  // ── AbortController ref ───────────────────────────────────────────────────
  // Dùng ref (không phải state) vì không cần trigger re-render
  const abortControllerRef = useRef(null)

  // ── Main fetch effect ─────────────────────────────────────────────────────
  useEffect(() => {
    // Tạo controller mới cho mỗi request
    const controller = new AbortController()
    abortControllerRef.current = controller

    const doFetch = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = {
          page: pagination.page,
          size: pagination.size,
          sortBy: filters.sortBy,
          sortDir: filters.sortDir,
          ...(debouncedSearch && { keyword: debouncedSearch }),
          ...(filters.status && { status: filters.status }),
        }

        const data = await getTasks(params, controller.signal)

        setTasks(data.content ?? [])
        setPagination((prev) => ({
          ...prev,
          totalPages: data.totalPages ?? 0,
          totalElements: data.totalElements ?? 0,
        }))
      } catch (err) {
        // Request bị hủy chủ động (AbortController) — KHÔNG set error,
        // vì đây không phải lỗi thật, chỉ là race condition prevention
        if (axios.isCancel(err)) return

        setError(err.message ?? 'Đã xảy ra lỗi không xác định')
      } finally {
        // Chỉ tắt loading nếu controller chưa bị abort (tránh update state
        // trên request đã bị hủy — component vẫn còn mounted nhưng request cũ)
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    doFetch()

    // Cleanup: hủy request khi effect re-run hoặc component unmount
    return () => controller.abort()
  }, [
    pagination.page,
    pagination.size,
    debouncedSearch,
    filters.status,
    filters.sortBy,
    filters.sortDir,
    fetchKey,
  ])

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Cập nhật từ khoá tìm kiếm.
   * Reset về trang 0 để kết quả bắt đầu từ đầu.
   * Debounce 400ms được xử lý tự động trong hook.
   */
  const setSearch = useCallback((value) => {
    setFilters((prev) => ({ ...prev, search: value }))
    setPagination((prev) => ({ ...prev, page: 0 }))
  }, [])

  /**
   * Lọc theo trạng thái task ('', 'PENDING', 'COMPLETED').
   * Reset về trang 0.
   */
  const setStatusFilter = useCallback((value) => {
    setFilters((prev) => ({ ...prev, status: value }))
    setPagination((prev) => ({ ...prev, page: 0 }))
  }, [])

  /**
   * Đổi tiêu chí và chiều sắp xếp.
   * @param {string} field - tên field (vd: 'createdAt', 'title')
   * @param {string} dir   - 'asc' | 'desc'
   * Reset về trang 0.
   */
  const setSort = useCallback((field, dir) => {
    setFilters((prev) => ({ ...prev, sortBy: field, sortDir: dir }))
    setPagination((prev) => ({ ...prev, page: 0 }))
  }, [])

  /**
   * Chuyển trang.
   * @param {number} page - index trang (0-based)
   */
  const setPage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }))
  }, [])

  /**
   * Gọi lại fetch với params hiện tại (vd: sau khi tạo/sửa/xoá task).
   */
  const refetch = useCallback(() => {
    setFetchKey((k) => k + 1)
  }, [])

  // ── Return ────────────────────────────────────────────────────────────────
  return {
    // State
    tasks,
    setTasks,
    loading,
    error,
    pagination,
    filters,
    // Actions
    setSearch,
    setStatusFilter,
    setSort,
    setPage,
    refetch,
  }
}
