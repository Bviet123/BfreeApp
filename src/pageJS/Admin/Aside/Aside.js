import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../pageCSS/Admin/AsideCss.css';

function Aside({ currentUser }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleAside = () => setIsOpen(!isOpen);

  return (
    <>
      <button className="aside-toggle" onClick={toggleAside}>
        ☰
      </button>
      <aside className={`user-list-aside ${isOpen ? 'open' : ''}`}>
        <div className="aside-header">
          <h3>Admin Tools</h3>
        </div>
        {currentUser?.email === 'buiducvan12346@gmail.com' && (
          <div className="admin-tools-list">
            <ul>
              <li onClick={() => navigate('/book-management')}>
                <i className="fas fa-book"></i>
                <span>Quản lý sách</span>
              </li>
              <li onClick={() => navigate('/user-management')}>
                <i className="fas fa-users"></i>
                <span>Quản lý tài khoản</span>
              </li>
              <li onClick={() => navigate('/category-management')}>
                <i className="fas fa-tag"></i>
                <span>Quản lý thể loại</span>
              </li>
              <li onClick={() => navigate('/report-management')}>
                <i className="fas fa-chart-bar"></i>
                <span>Quản lý báo cáo</span>
              </li>
            </ul>
          </div>
        )}
      </aside>
      {isOpen && <div className="aside-overlay" onClick={toggleAside}></div>}
    </>
  );
}

export default Aside;