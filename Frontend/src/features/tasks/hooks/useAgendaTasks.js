/**
 * features/tasks/hooks/useAgendaTasks.js
 *
 * Hook chuyên dụng cho Agenda View.
 *
 * - Gọi GET /api/tasks/by-date?fromDate=...&toDate=...
 * - Tự động fetch lại khi fromDate/toDate thay đổi
 * - Dùng AbortController để cancel request cũ khi user bấm
 *   "Tuần trước/Tuần sau" liên tiếp nhanh (tránh race condition)
 * - Trả về groups: [{ date: 'YYYY-MM-DD', tasks: [...] }]
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import { getTasksByDate } from '../api/taskApi'

/**
 * @param {string} fromDate - 'YYYY-MM-DD'
 * @param {string} toDate   - 'YYYY-MM-DD'
 */
export function useAgendaTasks(fromDate, toDate) {
  const [groups, setGroups]     = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [fetchKey, setFetchKey] = useState(0)

  // Track active AbortController để cancel khi fromDate/toDate đổi
  const abortControllerRef = useRef(null)

  useEffect(() => {
    if (!fromDate || !toDate) return

    // Cancel request đang chạy (nếu có)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    const doFetch = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getTasksByDate(fromDate, toDate, controller.signal)
        setGroups(data ?? [])
      } catch (err) {
        if (axios.isCancel(err)) return  // request bị cancel — bỏ qua, không setState
        setError(
          err.response?.data?.message
            ?? err.message
            ?? 'Đã xảy ra lỗi không xác định'
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    doFetch()

    return () => {
      controller.abort()
    }
  }, [fromDate, toDate, fetchKey])

  const refetch = useCallback(() => {
    setFetchKey(k => k + 1)
  }, [])

  /**
   * Cập nhật 1 task trong groups (optimistic update / sau refetch).
   * @param {Function} updater - nhận task cũ, trả về task mới (hoặc null để loại khỏi nhóm)
   */
  const updateTaskInGroups = useCallback((taskId, updater) => {
    setGroups(prev => prev.map(group => ({
      ...group,
      tasks: group.tasks.map(t => t.id === taskId ? updater(t) : t),
    })))
  }, [])

  return { groups, setGroups, loading, error, refetch, updateTaskInGroups }
}
