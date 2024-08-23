import React from 'react';
import { useLocation } from 'react-router-dom';
import avatarIcon from '../../resource/image/Avatar.png';

function HomeNav() {
  const location = useLocation();
  const user = location.state?.user;

  const genres = [
    "Tất cả",
    "Tự giúp bản thân",
    "Tiểu thuyết",
    "Văn học Việt Nam",
    "Thơ",
    "Khoa học",
    "Giáo dục"
  ];

  return (
    <header>
      <nav>
        <ul>
          <li><a href="/">Trang chủ</a></li>
          <li>
            <div className="dropdown">
              <button className="dropbtn">Thể loại</button>
              <div className="dropdown-content">
                {genres.map((genre, index) => (
                  <a key={index} href={`/theloai/${genre}`}>{genre}</a>
                ))}
              </div>
            </div>
          </li>
          <li><a href="/xephang">Xếp hạng</a></li>
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
            <span>{user.email}</span>
            <img src={avatarIcon} alt="Avatar" />
          </div>
        </div>
      </nav>
    </header>
  );
}

export default HomeNav;