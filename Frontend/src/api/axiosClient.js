
import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor — chuẩn hoá lỗi
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Nếu request bị huỷ (do StrictMode hoặc user type nhanh), bỏ qua không parse lỗi
    if (axios.isCancel(error)) return Promise.reject(error)

    const status = error.response?.status
    const message =
      error.response?.data?.message ??
      'Không thể kết nối tới server, vui lòng kiểm tra kết nối mạng'
    const fieldErrors = error.response?.data?.fieldErrors ?? null

    return Promise.reject({ message, status, fieldErrors })
  }
)

export default axiosClient
