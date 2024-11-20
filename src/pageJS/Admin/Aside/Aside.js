import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../pageCSS/Admin/AsideCss.css';

function Aside() {
  const navigate = useNavigate();

  const handleNavigateHome = () => {
    const userData = localStorage.getItem('user');
    console.log('Navigating to home, user data:', userData);
    
    if (!userData) {
      console.log('No user data found');
      navigate('/login');
      return;
    }
    
    navigate('/home', { 
      state: { 
        user: JSON.parse(userData)
      } 
    });
  };

  return (
    <aside className="user-list-aside">
      <div className="aside-header">
        <h3>Admin DashBoard</h3>
      </div>
      <div className="admin-tools-list">
        <ul>
          <li onClick={handleNavigateHome}>
            <i className="fas fa-home"></i>
            <span>Trang chủ</span>
          </li>
          <li onClick={() => navigate('/admin/books')}>  
            <i className="fas fa-book"></i>
            <span>Quản lý sách</span>
          </li>
          <li onClick={() => navigate('/admin/users')}>  
            <i className="fas fa-users"></i>
            <span>Quản lý tài khoản</span>
          </li>
          <li onClick={() => navigate('/admin/other')}>  
            <i className="fas fa-tag"></i>
            <span>Thể loại và NSX</span>
          </li>
          <li onClick={() => navigate('/admin/borrows')}>  
            <i className="fas fa-book"></i>
            <span>Quản lý sách mượn</span>
          </li>
          <li onClick={() => {
            localStorage.removeItem('user'); 
            navigate('/login');
          }}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Đăng xuất</span>
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default Aside;