/**
 * features/tasks/api/taskApi.js
 *
 * Các hàm gọi API cho resource Task.
 * - Mỗi hàm return Promise (không try/catch ở đây).
 * - Lỗi được xử lý tại component/hook sử dụng.
 */

import axiosClient from '../../../api/axiosClient'

/**
 * Lấy danh sách task có phân trang & lọc.
 * @param {object} params - query params (page, size, status, keyword, sortBy, sortDir...)
 * @param {AbortSignal} [signal] - AbortController signal để huỷ request khi cần
 * @returns {Promise<PageResponseDTO>}
 */
export const getTasks = (params, signal) => axiosClient.get('/tasks', { params, signal })

/**
 * Tạo task mới.
 * @param {object} data - TaskRequestDTO
 * @returns {Promise<TaskResponseDTO>}
 */
export const createTask = (data) => axiosClient.post('/tasks', data)

/**
 * Cập nhật task theo id.
 * @param {number} id
 * @param {object} data - TaskRequestDTO
 * @returns {Promise<TaskResponseDTO>}
 */
export const updateTask = (id, data) => axiosClient.put(`/tasks/${id}`, data)

/**
 * Xoá task theo id.
 * @param {number} id
 * @returns {Promise<void>}
 */
export const deleteTask = (id) => axiosClient.delete(`/tasks/${id}`)

/**
 * Đổi trạng thái task (toggle PENDING ↔ COMPLETED).
 * @param {number} id
 * @returns {Promise<TaskResponseDTO>}
 */
export const toggleTaskStatus = (id) => axiosClient.patch(`/tasks/${id}/toggle-status`)

/**
 * Lấy task nhóm theo ngày từ endpoint /by-date.
 * @param {string} fromDate - 'YYYY-MM-DD'
 * @param {string} toDate   - 'YYYY-MM-DD'
 * @param {AbortSignal} [signal] - AbortController signal để huỷ request khi navigate nhanh
 * @returns {Promise<Array<{ date: string, tasks: TaskResponseDTO[] }>>}
 */
export const getTasksByDate = (fromDate, toDate, signal) =>
  axiosClient.get('/tasks/by-date', { params: { fromDate, toDate }, signal })
