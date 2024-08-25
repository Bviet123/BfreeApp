import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import avatarIcon from '../../resource/image/Avatar.png';

function HomeNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;

  const genres = [
    "Tự giúp bản thân",
    "Tiểu thuyết",
    "Văn học Việt Nam",
    "Thơ",
    "Khoa học",
    "Giáo dục"
  ];

  const handleNavigation = (path) => {
    navigate(path, { state: { user } });
  };

  return (
    <header>
      <nav>
        <ul>
          <li><div onClick={() => handleNavigation('/')}>Trang chủ</div></li>
          <li>
            <div className="dropdown">
              <button className="dropbtn">Thể loại</button>
              <div className="dropdown-content">
                {genres.map((genre, index) => (
                  <div key={index} onClick={() => handleNavigation(`/theloai/${genre}`)}>{genre}</div>
                ))}
              </div>
            </div>
          </li>
          <li><div onClick={() => handleNavigation('/Author')}>Tác giả</div></li>
          <li><div onClick={() => handleNavigation('/BookLibrary')}>Kho sách</div></li>
        </ul>
        <div className='searchAvatar'>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm sách..."
            />
            <button type="submit">Tìm</button>
          </div>
          <div className="avatar">
            {user ? (
              <>
                <span>{user.email}</span>
                <img src={avatarIcon} alt="Avatar" />
              </>
            ) : (
              <div onClick={() => handleNavigation('/login')}>Đăng nhập</div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default HomeNav;