import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDatabase, onValue, ref, update } from 'firebase/database';
import { FaEdit, FaEnvelope, FaBirthdayCake, FaVenusMars, FaBullseye, FaHeart, FaHandHoldingHeart, FaCalendarAlt, FaClock, FaInfoCircle, FaTrash } from 'react-icons/fa';
import UserAside from '../UserAside/UserAside';
import '../../../pageCSS/User/UserProfileCss/UserProfileCss.css';
import EditUserModal from './UserModal/EditUserModal';

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
  const [favoriteBooks, setFavoriteBooks] = useState({});
  const [allBooks, setAllBooks] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (userFromState && userFromState.uid) {
        const database = getDatabase();
        const userRef = ref(database, `users/${userFromState.uid}`);
        const categoriesRef = ref(database, 'categories');
        const booksRef = ref(database, 'books');

        try {
          // Fetch categories
          onValue(categoriesRef, (snapshot) => {
            const data = snapshot.val();
            setCategories(data || {});
          });

          // Fetch all books
          onValue(booksRef, (snapshot) => {
            const data = snapshot.val();
            setAllBooks(data || {});
          });

          // Fetch user data
          const unsubscribe = onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
              setUser({
                ...data,
                favoriteBooks: data.favoriteBooks && typeof data.favoriteBooks === 'object' ? data.favoriteBooks : {},
                borrowedBooks: data.borrowedBooks && typeof data.borrowedBooks === 'object' ? data.borrowedBooks : {},
              });
              setFavoriteBooks(data.favoriteBooks || {});
              setFavoriteGenres(data.favoriteGenres || {});
            } else {
              setError("Không tìm thấy dữ liệu người dùng");
            }
            setIsLoading(false);
          }, (error) => {
            console.error("Error fetching user data:", error);
            setError("Lỗi khi tải dữ liệu người dùng: " + error.message);
            setIsLoading(false);
          });

          return () => unsubscribe();
        } catch (error) {
          console.error("Error setting up Firebase listener:", error);
          setError("Lỗi khi thiết lập kết nối Firebase: " + error.message);
          setIsLoading(false);
        }
      } else {
        console.error("No user UID available");
        setError("Không có UID người dùng");
        setIsLoading(false);
        navigate('/Home');
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
    setShouldReload(true);
  }, []);

  useEffect(() => {
    if (shouldReload) {
      setShouldReload(false);
    }
  }, [shouldReload]);

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

  const handleGoToBookDetails = (bookId) => {
    navigate(`/book/${bookId}`, { state: { user } });
  };

  const handleUnfavoriteBook = async (bookId) => {
    if (!user || !user.uid) return;

    const db = getDatabase();
    const userFavoriteBooksRef = ref(db, `users/${user.uid}/favoriteBooks`);

    try {
      const updatedFavoriteBooks = { ...favoriteBooks };
      delete updatedFavoriteBooks[bookId];

      await update(userFavoriteBooksRef, updatedFavoriteBooks);

      setFavoriteBooks(updatedFavoriteBooks);
      setUser(prevUser => ({
        ...prevUser,
        favoriteBooks: updatedFavoriteBooks
      }));
    } catch (error) {
      console.error("Error removing favorite book:", error);
      setError("Lỗi khi xóa sách yêu thích: " + error.message);
    }
  };

  const renderFavoriteBooks = () => {
    const favoriteBooksEntries = Object.entries(favoriteBooks).filter(([key]) => key !== 'default');
    return (
      <div className="favorite-books">
        <h3>Sách yêu thích</h3>
        <div className="info-item">
          <FaHeart /> <strong>Số sách yêu thích:</strong> {favoriteBooksEntries.length}
        </div>
        {favoriteBooksEntries.length > 0 ? (
          <ul className="books-list">
            {favoriteBooksEntries.map(([bookId, value]) => {
              const book = allBooks[bookId];
              return book ? (
                <li key={bookId}>
                  {book.title}
                  <button onClick={() => handleGoToBookDetails(bookId)} className="action-button">
                    <FaInfoCircle /> Chi tiết
                  </button>
                  <button onClick={() => handleUnfavoriteBook(bookId)} className="action-button">
                    <FaTrash /> Hủy yêu thích
                  </button>
                </li>
              ) : (
                <li key={bookId}>ID sách: {bookId}</li>
              );
            })}
          </ul>
        ) : (
          <p>Chưa có sách yêu thích</p>
        )}
      </div>
    );
  };

  const renderFavoriteGenres = () => {
    const genreEntries = Object.entries(favoriteGenres).filter(([key]) => key !== 'default');
    return (
      <div className="favorite-genres">
        <strong>Thể loại yêu thích:</strong>
        {genreEntries.length > 0 ? (
          genreEntries.map(([genreId, value]) => {
            const genre = categories[genreId];
            return genre ? (
              <span key={genreId} className="genre-tag">{genre.name}</span>
            ) : (
              <span key={genreId} className="genre-tag">ID: {genreId}</span>
            );
          })
        ) : (
          <span>Chưa có thể loại yêu thích</span>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (error) {
    return <div>Lỗi: {error}</div>;
  }

  if (!user) {
    return <div>Không tìm thấy dữ liệu người dùng</div>;
  }

  return (
    <div className="user-profile-container">
      <UserAside activeItem="UserProfile" user={user}/>
      <main className="user-profile">
        <h1>Hồ sơ người dùng</h1>
        <button className="edit-button" onClick={handleEditClick}>
          <FaEdit /> Chỉnh sửa thông tin
        </button>
        {isEditModalOpen && (
          <EditUserModal 
            user={user} 
            onClose={handleCloseModal} 
            onUpdate={handleUserUpdate}
          />
        )}
        <div className="profile-content">
          <section className="user-info">
            <h3>Thông tin cá nhân</h3>
            <div className="info-item"><FaEnvelope /> <strong>Email:</strong> {user.email || 'Không có thông tin'}</div>
            <div className="info-item"><FaBirthdayCake /> <strong>Ngày sinh:</strong> {user.birthDate || 'Không có thông tin'}</div>
            <div className="info-item"><FaVenusMars /> <strong>Giới tính:</strong> {getGenderDisplay(user.gender)}</div>
          </section>
          <section className="reading-preferences">
            <h3>Sở thích đọc sách</h3>
            <div className="info-item"><FaBullseye /> <strong>Mục tiêu đọc sách:</strong> {user.readingGoal || 'Chưa đặt mục tiêu'}</div>
            {renderFavoriteGenres()}
          </section>
          {renderFavoriteBooks()}
          <section className="borrowed-books">
            <h3>Sách đang mượn</h3>
            <div className="info-item"><FaHandHoldingHeart /> <strong>Số sách đang mượn:</strong> {Object.keys(user.borrowedBooks).length > 0 && user.borrowedBooks.default !== "Chưa có" ? Object.keys(user.borrowedBooks).length : 0}</div>
            {Object.keys(user.borrowedBooks).length > 0 && user.borrowedBooks.default !== "Chưa có" ? (
              <ul className="books-list">
                {Object.entries(user.borrowedBooks).map(([key, book]) => (
                  <li key={key}>
                    {book.title} <span className="due-date">(Hạn trả: {new Date(book.dueDate).toLocaleDateString()})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Không có sách đang mượn</p>
            )}
          </section>
          <section className="account-info">
            <h3>Thông tin tài khoản</h3>
            <div className="info-item"><FaCalendarAlt /> <strong>Ngày tạo:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Không có thông tin'}</div>
            <div className="info-item"><FaClock /> <strong>Cập nhật lần cuối:</strong> {user.lastUpdated ? new Date(user.lastUpdated).toLocaleDateString() : 'Không có thông tin'}</div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;