import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../pageCSS/Admin/AsideCss.css';

function Aside({ currentUser, className }) {
  const navigate = useNavigate();

  return (
    <aside className={`user-list-aside ${className}`}>
      <div className="aside-header">
        <h3>Admin DashBoard</h3>
      </div>
      <div className="admin-tools-list">
        <ul>
          <li onClick={() => navigate('/borrows')}>
            <i className="fas fa-book"></i>
            <span>Quản lý sách</span>
          </li>
          <li onClick={() => navigate('')}>
            <i className="fas fa-users"></i>
            <span>Quản lý tài khoản</span>
          </li>
          <li onClick={() => navigate('')}>
            <i className="fas fa-tag"></i>
            <span>Thể loại và NSX</span>
          </li>
          <li onClick={() => navigate('')}>
            <i class="fas fa-book"></i>
            <span>Quản lý sách mượn</span>
          </li>
        </ul>
      </div>

    </aside>
  );
}

export default Aside;