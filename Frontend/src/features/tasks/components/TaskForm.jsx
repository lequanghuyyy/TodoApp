/**
 * features/tasks/components/TaskForm.jsx
 */
import { useState } from 'react'
import { createTask, updateTask } from '../api/taskApi'
import './TaskForm.css'

const TaskForm = ({ mode = 'create', initialData, onSuccess, onNotFound, onCancel }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'MEDIUM',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState(null)

  const validate = () => {
    const newErrors = {}
    const titleTrimmed = formData.title.trim()

    if (!titleTrimmed) {
      newErrors.title = 'Title không được để trống'
    } else if (titleTrimmed.length > 200) {
      newErrors.title = 'Title tối đa 200 ký tự'
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description tối đa 1000 ký tự'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Xoá lỗi khi user gõ lại
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGlobalError(null)

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
      }

      if (mode === 'create') {
        await createTask(payload)
        // Reset form
        setFormData({ title: '', description: '', priority: 'MEDIUM' })
      } else {
        await updateTask(initialData.id, payload)
      }
      
      if (onSuccess) onSuccess()

    } catch (error) {
      if (error.status === 400 && error.fieldErrors) {
        setErrors(error.fieldErrors)
      } else if (mode === 'edit' && error.status === 404) {
        if (onNotFound) onNotFound()
      } else if (mode === 'edit' && error.status === 409) {
        setGlobalError(
          <span>
            Dữ liệu đã bị thay đổi, vui lòng tải lại trang.
            <button 
              type="button" 
              onClick={() => window.location.reload()} 
              style={{ marginLeft: 8, textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 600 }}
            >
              Tải lại
            </button>
          </span>
        )
      } else {
        setGlobalError(error.message || 'Đã xảy ra lỗi, vui lòng thử lại.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      {globalError && (
        <div className="task-form__error-global" role="alert">
          {globalError}
        </div>
      )}
      
      <div className="task-form__group">
        <label htmlFor="title">Tiêu đề *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          disabled={isSubmitting}
          maxLength={200}
          className={`min-h-[44px] ${errors.title ? 'is-invalid' : ''}`}
          placeholder="Nhập tiêu đề công việc"
        />
        {errors.title && <span className="task-form__error-text">{errors.title}</span>}
      </div>

      <div className="task-form__group">
        <label htmlFor="description">Mô tả</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          disabled={isSubmitting}
          maxLength={1000}
          className={`min-h-[44px] ${errors.description ? 'is-invalid' : ''}`}
          placeholder="Nhập mô tả chi tiết (không bắt buộc)"
          rows={3}
        />
        {errors.description && <span className="task-form__error-text">{errors.description}</span>}
      </div>

      <div className="task-form__group">
        <label htmlFor="priority">Mức độ ưu tiên</label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          disabled={isSubmitting}
          className="min-h-[44px] bg-white"
        >
          <option value="LOW">Thấp (Low)</option>
          <option value="MEDIUM">Trung bình (Medium)</option>
          <option value="HIGH">Cao (High)</option>
        </select>
        {errors.priority && <span className="task-form__error-text">{errors.priority}</span>}
      </div>

      <div className="task-form__actions w-full sm:w-auto flex flex-col sm:flex-row gap-3">
        {mode === 'edit' && onCancel && (
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="btn-cancel min-h-[44px] w-full sm:w-auto">
            Hủy
          </button>
        )}
        <button type="submit" disabled={isSubmitting} className="btn-submit min-h-[44px] w-full sm:w-auto">
          {isSubmitting 
            ? 'Đang xử lý...' 
            : (mode === 'create' ? 'Thêm công việc' : 'Cập nhật công việc')}
        </button>
      </div>
    </form>
  )
}

export default TaskForm
