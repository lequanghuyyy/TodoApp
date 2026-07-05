/**
 * features/tasks/components/TaskList.jsx
 * Hiển thị danh sách các TaskItem.
 */

import TaskItem from './TaskItem'

const TaskList = ({ tasks, onToggle, onDelete, onEdit }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Chưa có task nào. Hãy tạo task đầu tiên!</p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  )
}

export default TaskList
