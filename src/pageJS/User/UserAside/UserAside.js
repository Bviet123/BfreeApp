import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaBook, FaUser, FaBookmark } from 'react-icons/fa';

const UserAside = ({ activeItem }) => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="https://example.com/user-avatar.jpg" alt="Avatar" className="sidebar-avatar" />
        <h2>Nguyễn Văn A</h2>
      </div>
      <div>
        <ul>
          <li><button onClick={() => handleNavigation('/Home')} className={activeItem === 'Home' ? 'active' : ''}><FaHome /> Trang chủ</button></li>
          <li><button onClick={() => handleNavigation('/BookLibrary')} className={activeItem === 'BookLibrary' ? 'active' : ''}><FaBook /> Thư viện sách</button></li>
          <li><button onClick={() => handleNavigation('/Bookshelf')} className={activeItem === 'Bookshelf' ? 'active' : ''}><FaBookmark /> Tủ sách của tôi</button></li>
          <li><button onClick={() => handleNavigation('/UserProfile')} className={activeItem === 'UserProfile' ? 'active' : ''}><FaUser /> Thông tin cá nhân</button></li>
        </ul>
      </div>
    </aside>
  );
};

export default UserAside;