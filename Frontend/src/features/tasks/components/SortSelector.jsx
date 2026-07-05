import './SortSelector.css';

const SortSelector = ({ sortBy, sortDir, onSortChange }) => {
  const handleSortByChange = (e) => {
    onSortChange(e.target.value, sortDir);
  };

  const handleSortDirToggle = () => {
    const newDir = sortDir === 'ASC' ? 'DESC' : 'ASC';
    onSortChange(sortBy, newDir);
  };

  return (
    <div className="sort-selector flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <div className="sort-selector__field flex-1">
        <select 
          value={sortBy} 
          onChange={handleSortByChange}
          aria-label="Sắp xếp theo"
          className="w-full h-[44px] px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="CREATED_AT">Ngày tạo</option>
          <option value="TITLE">Tiêu đề</option>
          <option value="PRIORITY">Độ ưu tiên</option>
        </select>
      </div>
      <button 
        type="button"
        className="sort-selector__dir min-h-[44px] min-w-[44px] px-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        onClick={handleSortDirToggle}
        aria-label={`Đổi chiều sắp xếp. Hiện tại: ${sortDir === 'ASC' ? 'Tăng dần' : 'Giảm dần'}`}
      >
        {sortDir === 'ASC' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path></svg>
        )}
      </button>
    </div>
  );
};

export default SortSelector;
