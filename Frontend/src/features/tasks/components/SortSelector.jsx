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
    <div className="sort-selector">
      <select
        className="sort-selector__select"
        value={sortBy}
        onChange={handleSortByChange}
        aria-label="Sắp xếp theo"
      >
        <option value="CREATED_AT">Ngày tạo</option>
        <option value="TITLE">Tiêu đề</option>
        <option value="PRIORITY">Độ ưu tiên</option>
        <option value="DUE_DATE">Hạn hoàn thành</option>
      </select>
      <button
        type="button"
        className="sort-selector__dir-btn"
        onClick={handleSortDirToggle}
        aria-label={`Đổi chiều sắp xếp. Hiện tại: ${sortDir === 'ASC' ? 'Tăng dần' : 'Giảm dần'}`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          {sortDir === 'ASC' ? 'arrow_upward' : 'arrow_downward'}
        </span>
      </button>
    </div>
  );
};

export default SortSelector;
