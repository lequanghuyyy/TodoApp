import './TaskFilter.css';

const TaskFilter = ({ search, status, onSearchChange, onStatusChange }) => {
  return (
    <div className="task-filter flex flex-col sm:flex-row gap-4 w-full flex-1">
      <div className="task-filter__search flex-1 w-full">
        <input 
          type="text" 
          placeholder="Tìm kiếm công việc..." 
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Tìm kiếm công việc"
          className="w-full h-[44px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="task-filter__status w-full sm:w-auto">
        <select 
          value={status} 
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Lọc theo trạng thái"
          className="w-full h-[44px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Tất cả</option>
          <option value="PENDING">Chưa hoàn thành</option>
          <option value="COMPLETED">Đã hoàn thành</option>
        </select>
      </div>
    </div>
  );
};

export default TaskFilter;
