import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDatabase, onValue, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { 
  FaEdit, FaEnvelope, FaBirthdayCake, FaVenusMars, 
  FaBullseye, FaHeart, FaCalendarAlt, FaClock
} from 'react-icons/fa';
import UserAside from '../UserAside/UserAside';
import EditUserModal from './UserModal/EditUserModal';
import '../../../pageCSS/User/UserProfileCss/UserProfileCss.css';

const UserProfile = () => {
  const location = useLocation();
  const userFromState = location.state?.user;
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState({});
  const [favoriteGenres, setFavoriteGenres] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [shouldReload, setShouldReload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth();
      let currentUser = userFromState || auth.currentUser;

      if (!currentUser) {
        setError("Vui lòng đăng nhập để xem thông tin");
        setIsLoading(false);
        navigate('/login');
        return;
      }

      const database = getDatabase();
      const userRef = ref(database, `users/${currentUser.uid}`);
      const categoriesRef = ref(database, 'categories');

      try {
        // Get initial user data
        const userSnapshot = await get(userRef);
        if (!userSnapshot.exists()) {
          setError("Không tìm thấy dữ liệu người dùng");
          setIsLoading(false);
          return;
        }

        const userData = userSnapshot.val();
        setUser({
          ...currentUser,
          ...userData,
        });

        // Set up real-time listeners
        const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
          setCategories(snapshot.val() || {});
        });

        const unsubscribeUser = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUser(prevUser => ({
              ...prevUser,
              ...data,
            }));
            setFavoriteGenres(data.favoriteGenres || {});
          }
        });

        return () => {
          unsubscribeCategories();
          unsubscribeUser();
        };
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Lỗi khi tải dữ liệu: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userFromState, navigate, shouldReload]);

  const handleEditClick = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleUserUpdate = useCallback((updatedUser) => {
    setUser(updatedUser);
    setFavoriteGenres(updatedUser.favoriteGenres || {});
    setShouldReload(prev => !prev);
  }, []);

  const getGenderDisplay = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return 'Nam';
      case 'female':
        return 'Nữ';
      default:
        return gender || 'Không có thông tin';
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/home')} className="return-home-button">
          Trở về trang chủ
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-container">
        <p>Không tìm thấy dữ liệu người dùng</p>
        <button onClick={() => navigate('/home')} className="return-home-button">
          Trở về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <UserAside activeItem="UserProfile" user={user} />
      <main className="user-profile">
        <div className="profile-header">
          <h1>Hồ sơ người dùng</h1>
          <button className="edit-button" onClick={handleEditClick}>
            <FaEdit /> Chỉnh sửa thông tin
          </button>
        </div>

        <div className="profile-content">
          <section className="user-info">
            <h3>Thông tin cá nhân</h3>
            <div className="info-grid">
              <div className="info-item">
                <FaEnvelope className="info-icon" />
                <div className="info-text">
                  <strong>Email:</strong>
                  <span>{user.email || 'Chưa cập nhật'}</span>
                </div>
              </div>

              <div className="info-item">
                <FaBirthdayCake className="info-icon" />
                <div className="info-text">
                  <strong>Ngày sinh:</strong>
                  <span>{user.birthDate || 'Chưa cập nhật'}</span>
                </div>
              </div>

              <div className="info-item">
                <FaVenusMars className="info-icon" />
                <div className="info-text">
                  <strong>Giới tính:</strong>
                  <span>{getGenderDisplay(user.gender)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="reading-preferences">
            <h3>Sở thích đọc sách</h3>
            <div className="info-grid">
              <div className="info-item">
                <FaBullseye className="info-icon" />
                <div className="info-text">
                  <strong>Mục tiêu đọc sách:</strong>
                  <span>{user.readingGoal || 'Chưa đặt mục tiêu'}</span>
                </div>
              </div>

              <div className="info-item favorite-genres">
                <FaHeart className="info-icon" />
                <div className="info-text">
                  <strong>Thể loại yêu thích:</strong>
                  <div className="genres-container">
                    {Object.keys(favoriteGenres).length > 0 ? (
                      Object.entries(favoriteGenres)
                        .filter(([key]) => key !== 'default')
                        .map(([genreId]) => (
                          <span key={genreId} className="genre-tag">
                            {categories[genreId]?.name || 'Không xác định'}
                          </span>
                        ))
                    ) : (
                      <span className="no-data">Chưa có thể loại yêu thích</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="account-info">
            <h3>Thông tin tài khoản</h3>
            <div className="info-grid">
              <div className="info-item">
                <FaCalendarAlt className="info-icon" />
                <div className="info-text">
                  <strong>Ngày tạo tài khoản:</strong>
                  <span>
                    {user.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString('vi-VN')
                      : 'Không có thông tin'
                    }
                  </span>
                </div>
              </div>

              <div className="info-item">
                <FaClock className="info-icon" />
                <div className="info-text">
                  <strong>Cập nhật lần cuối:</strong>
                  <span>
                    {user.lastUpdated 
                      ? new Date(user.lastUpdated).toLocaleDateString('vi-VN')
                      : 'Không có thông tin'
                    }
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {isEditModalOpen && (
          <EditUserModal
            user={user}
            onClose={handleCloseModal}
            onUpdate={handleUserUpdate}
            categories={categories}
          />
        )}
      </main>
    </div>
  );
};

export default UserProfile;