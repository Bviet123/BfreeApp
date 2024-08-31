import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../pageCSS/User/UserProfileCss/UserProfileCss.css';
import { FaHome, FaBook, FaUser, FaPlus, FaUsers, FaEdit, FaEnvelope, FaBirthdayCake, FaVenusMars, FaBullseye, FaBookOpen, FaCalendarAlt, FaClock } from 'react-icons/fa';
import UserAside from '../UserAside/UserAside';

const sampleUserData = {
  avatar: 'https://example.com/avatar.jpg',
  fullName: 'Nguyễn Văn A',
  email: 'nguyenvana@email.com',
  role: 'Độc giả',
  birthDate: '15/08/1990',
  gender: 'Nam',
  favoriteGenres: {
    1: 'Tiểu thuyết',
    2: 'Khoa học viễn tưởng',
    3: 'Trinh thám',
    4: 'Lịch sử'
  },
  readingGoal: '50 cuốn sách/năm',
  booksRead: {
    1: 'Đắc Nhân Tâm - Dale Carnegie',
    2: 'Hai Số Phận - Jeffrey Archer',
    3: 'Nhà Giả Kim - Paulo Coelho',
    4: 'Sherlock Holmes - Sir Arthur Conan Doyle',
    5: 'Chiến Tranh và Hòa Bình - Leo Tolstoy'
  },
  createdAt: '2023-01-15T00:00:00.000Z',
  lastUpdated: '2024-08-20T10:30:00.000Z'
};


const UserProfile = () => {
  const user = sampleUserData;
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="user-profile-container">
      <UserAside activeItem="UserProfile" />
      <main className="user-profile">
        <h1>Hồ sơ người dùng</h1>
        <button className="edit-button"><FaEdit /> Chỉnh sửa thông tin</button>
        <div className="profile-content">
          <section className="user-info">
            <h3>Thông tin cá nhân</h3>
            <div className="info-item"><FaEnvelope /> <strong>Email:</strong> {user.email}</div>
            <div className="info-item"><FaBirthdayCake /> <strong>Ngày sinh:</strong> {user.birthDate}</div>
            <div className="info-item"><FaVenusMars /> <strong>Giới tính:</strong> {user.gender}</div>
          </section>
          <section className="reading-preferences">
            <h3>Sở thích đọc sách</h3>
            <div className="info-item"><FaBullseye /> <strong>Mục tiêu đọc sách:</strong> {user.readingGoal}</div>
            <div className="favorite-genres">
              <strong>Thể loại yêu thích:</strong>
              {Object.entries(user.favoriteGenres).map(([key, genre]) => (
                <span key={key} className="genre-tag">{genre}</span>
              ))}
            </div>
          </section>
          <section className="reading-activity">
            <h3>Hoạt động đọc sách</h3>
            <div className="info-item"><FaBookOpen /> <strong>Số sách đã đọc:</strong> {Object.keys(user.booksRead).length}</div>
            <ul className="books-read">
              {Object.entries(user.booksRead).map(([key, book]) => (
                <li key={key}>{book}</li>
              ))}
            </ul>
          </section>
          <section className="account-info">
            <h3>Thông tin tài khoản</h3>
            <div className="info-item"><FaCalendarAlt /> <strong>Ngày tạo:</strong> {new Date(user.createdAt).toLocaleDateString()}</div>
            <div className="info-item"><FaClock /> <strong>Cập nhật lần cuối:</strong> {new Date(user.lastUpdated).toLocaleDateString()}</div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;