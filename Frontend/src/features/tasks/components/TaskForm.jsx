/**
 * features/tasks/components/TaskForm.jsx
 * Zenith Focus — underline title, textarea desc, priority card selector
 */
import { useState } from 'react'
import { createTask, updateTask } from '../api/taskApi'
import './TaskForm.css'

const TaskForm = ({ mode = 'create', initialData, onSuccess, onNotFound, onCancel }) => {
  const [formData, setFormData] = useState({
    title:       initialData?.title       || '',
    description: initialData?.description || '',
    priority:    initialData?.priority    || 'MEDIUM',
    dueDate:     initialData?.dueDate     || '',  // '' = không có deadline
  })

  const [errors, setErrors]         = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [globalError, setGlobalError]   = useState(null)

  const validate = () => {
    const newErrors = {}
    const titleTrimmed = formData.title.trim()

    if (!titleTrimmed) {
      newErrors.title = 'Tiêu đề không được để trống'
    } else if (titleTrimmed.length > 200) {
      newErrors.title = 'Tiêu đề tối đa 200 ký tự'
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Mô tả tối đa 1000 ký tự'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGlobalError(null)
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const payload = {
        title:       formData.title.trim(),
        description: formData.description.trim(),
        priority:    formData.priority,
        dueDate:     formData.dueDate || null,  // '' → null để backend lưu NULL
      }

      if (mode === 'create') {
        await createTask(payload)
        setFormData({ title: '', description: '', priority: 'MEDIUM', dueDate: '' })
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
      {/* Global error */}
      {globalError && (
        <div className="task-form__error-global" role="alert">
          {globalError}
        </div>
      )}

      {/* ── Title ── */}
      <div className="task-form__group">
        <label className="task-form__label" htmlFor="tf-title">Tiêu đề *</label>
        <input
          className={`task-form__input-title${errors.title ? ' is-invalid' : ''}`}
          type="text"
          id="tf-title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          disabled={isSubmitting}
          maxLength={200}
          placeholder="Công việc cần làm là gì?"
          autoFocus={mode === 'create'}
        />
        {errors.title && <span className="task-form__error-text">{errors.title}</span>}
      </div>

      {/* ── Description ── */}
      <div className="task-form__group">
        <label className="task-form__label" htmlFor="tf-desc">
          Mô tả <span style={{ textTransform: 'none', fontWeight: 400, letterSpacing: 0, opacity: 0.7 }}>(không bắt buộc)</span>
        </label>
        <textarea
          className={`task-form__textarea${errors.description ? ' is-invalid' : ''}`}
          id="tf-desc"
          name="description"
          value={formData.description}
          onChange={handleChange}
          disabled={isSubmitting}
          maxLength={1000}
          placeholder="Thêm ghi chú, link, hoặc mô tả chi tiết..."
          rows={3}
        />
        {errors.description && <span className="task-form__error-text">{errors.description}</span>}
      </div>

      {/* ── Priority — Card selector ── */}
      <div className="task-form__group">
        <label className="task-form__label">Mức độ ưu tiên</label>
        <div className="task-form__priority-grid">
          {/* Low */}
          <label className="task-form__priority-card task-form__priority-card--low">
            <input
              type="radio"
              name="priority"
              value="LOW"
              checked={formData.priority === 'LOW'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span className="task-form__priority-label">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>stat_minus_1</span>
              Thấp
            </span>
          </label>
          {/* Medium */}
          <label className="task-form__priority-card task-form__priority-card--medium">
            <input
              type="radio"
              name="priority"
              value="MEDIUM"
              checked={formData.priority === 'MEDIUM'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span className="task-form__priority-label">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>drag_handle</span>
              Vừa
            </span>
          </label>
          {/* High */}
          <label className="task-form__priority-card task-form__priority-card--high">
            <input
              type="radio"
              name="priority"
              value="HIGH"
              checked={formData.priority === 'HIGH'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span className="task-form__priority-label">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>priority_high</span>
              Cao
            </span>
          </label>
        </div>
        {errors.priority && <span className="task-form__error-text">{errors.priority}</span>}
      </div>

      {/* ── Due Date ── */}
      <div className="task-form__group">
        <label className="task-form__label" htmlFor="tf-due-date">
          Hạn hoàn thành{' '}
          <span style={{ textTransform: 'none', fontWeight: 400, letterSpacing: 0, opacity: 0.7 }}>
            (không bắt buộc)
          </span>
        </label>
        <div className="task-form__due-date-row">
          <input
            className="task-form__input-date"
            type="date"
            id="tf-due-date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {formData.dueDate && (
            <button
              type="button"
              className="task-form__due-clear"
              onClick={() => setFormData(prev => ({ ...prev, dueDate: '' }))}
              disabled={isSubmitting}
              aria-label="Xóa hạn hoàn thành"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              Xóa
            </button>
          )}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="task-form__actions">
        {(mode === 'edit' || mode === 'create') && onCancel && (
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="btn-cancel">
            Hủy
          </button>
        )}
        <button type="submit" disabled={isSubmitting} className="btn-submit">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            {mode === 'create' ? 'add' : 'check'}
          </span>
          {isSubmitting
            ? 'Đang xử lý...'
            : (mode === 'create' ? 'Tạo công việc' : 'Cập nhật')}
        </button>
      </div>
    </form>
  )
}

export default TaskForm
