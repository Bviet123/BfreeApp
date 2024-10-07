import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaBook, FaUser, FaBookmark, FaHandHoldingHeart } from 'react-icons/fa';

const UserAside = ({ activeItem, user }) => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path, { state: { user } });
  };

  const userName = user?.fullName || user?.email || "Người dùng";
  const userAvatar = user?.avatar || "/path/to/default-avatar.png";

  const menuItems = [
    { path: '/Home', icon: FaHome, label: 'Trang chủ', id: 'Home' },
    { path: '/BookLibrary', icon: FaBook, label: 'Thư viện sách', id: 'BookLibrary' },
    { path: '/Bookshelf', icon: FaBookmark, label: 'Tủ sách của tôi', id: 'Bookshelf', count: user?.bookshelfCount },
    { path: '/user/borrowedbooklist', icon: FaHandHoldingHeart, label: 'Sách đang mượn', id: 'BorrowedBooks', count: user?.borrowedBooksCount },
    { path: `/user/profile/${user?.uid}`, icon: FaUser, label: 'Thông tin cá nhân', id: 'UserProfile' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={userAvatar} alt="Avatar" className="sidebar-avatar" />
        <h2>{userName}</h2>
      </div>
      <div>
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button 
                onClick={() => handleNavigation(item.path)} 
                className={activeItem === item.id ? 'active' : ''}
              >
                <item.icon />
                {item.label}
                {item.count !== undefined && <span className="count">({item.count})</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default UserAside;