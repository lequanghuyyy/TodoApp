/**
 * api/axiosInstance.js
 *
 * Axios instance dùng chung cho toàn app.
 * - Đọc baseURL từ biến môi trường Vite (VITE_API_BASE_URL)
 * - Request interceptor: có thể gắn Authorization header ở đây
 * - Response interceptor: xử lý lỗi tập trung (401, 500...)
 */

import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach token nếu có
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — xử lý lỗi tập trung
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      // TODO: redirect to login hoặc refresh token
      console.warn('Unauthorized — cần đăng nhập lại')
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
