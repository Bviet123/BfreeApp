import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaBook, FaUser, FaBookmark } from 'react-icons/fa';

const UserAside = ({ activeItem, user }) => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Sử dụng dữ liệu người dùng hoặc giá trị mặc định nếu không có
  const userName = user?.fullName ||   "Người dùng";
  const userAvatar = user?.avatar || "/path/to/default-avatar.png"; // Thay thế bằng đường dẫn đến avatar mặc định của bạn

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={userAvatar} alt="Avatar" className="sidebar-avatar" />
        <h2>{userName}</h2>
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