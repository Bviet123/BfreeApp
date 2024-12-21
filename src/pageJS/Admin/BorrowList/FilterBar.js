import React from 'react';
import { FaSync } from 'react-icons/fa';
import './FilterBar.css';

const FilterBar = ({ onReload, selectedStatus, onStatusChange }) => {
  return (
    <div className="filter-container">
      <div className="filter-status">
        <label>Trạng thái:</label>
        <select 
          value={selectedStatus} 
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">Tất cả</option>
          <option value="pending">Chờ duyệt</option>
          <option value="awaiting_pickup">Chờ lấy sách</option>
        </select>
      </div>
      <button className="reload-btn" onClick={onReload}>
        <FaSync className="reload-icon" />
        <span>Tải lại</span>
      </button>
    </div>
  );
};

export default FilterBar;