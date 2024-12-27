import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBookReader } from 'react-icons/fa';
import { database } from '../../firebaseConfig';
import { ref, update, get } from 'firebase/database';
import '../../pageCSS/HomeCss/HomeCss.css';
import AdminMessaging from '../MessagesPage/AdminMessaging';
import DateFormatter from '../../Format/DateFormatter';

function HomeMain() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState({});
  const [authors, setAuthors] = useState({});
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [topBorrowedBooks, setTopBorrowedBooks] = useState([]);
  const isAdmin = user && user.role === 'Admin';
  const isLoggedIn = !!user;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data từ Firebase
        const booksSnapshot = await get(ref(database, 'books'));
        const genresSnapshot = await get(ref(database, 'categories'));
        const authorsSnapshot = await get(ref(database, 'authors'));

        const booksData = booksSnapshot.val();
        if (booksData) {
          // Chuyển đổi dữ liệu sách thành mảng và thêm readCount và borrowCount
          const booksArray = Object.entries(booksData).map(([id, book]) => ({
            id,
            readCount: book.readCount || 0,
            borrowCount: book.borrowCount || 0,
            ...book
          }));

          // Sắp xếp theo readCount cho sách nổi bật
          booksArray.sort((a, b) => (b.readCount || 0) - (a.readCount || 0));
          setBooks(booksArray);

          // Lấy top sách được mượn nhiều nhất
          const topBorrowedBooks = [...booksArray]
            .sort((a, b) => (b.borrowCount || 0) - (a.borrowCount || 0))
            .slice(0, 8);
          setTopBorrowedBooks(topBorrowedBooks);

          // Xử lý sách được đề xuất cho người dùng đã đăng nhập
          if (isLoggedIn && user.uid) {
            const userSnapshot = await get(ref(database, `users/${user.uid}`));
            const userFavoriteGenres = userSnapshot.val()?.favoriteGenres
              ? Object.keys(userSnapshot.val().favoriteGenres)
              : [];
            setFavoriteGenres(userFavoriteGenres);

            if (userFavoriteGenres.length > 0) {
              const recommended = booksArray.filter(book => {
                const genreScore = book.genreIds?.filter(genreId =>
                  userFavoriteGenres.includes(genreId)
                ).length || 0;

                return genreScore > 0;
              }).sort((a, b) => {
                const aGenreScore = a.genreIds?.filter(genreId =>
                  userFavoriteGenres.includes(genreId)
                ).length || 0;

                const bGenreScore = b.genreIds?.filter(genreId =>
                  userFavoriteGenres.includes(genreId)
                ).length || 0;

                return bGenreScore - aGenreScore;
              });

              setRecommendedBooks(recommended);
            }
          }
        }

        // Set genres và authors state
        setGenres(genresSnapshot.val() || {});
        setAuthors(authorsSnapshot.val() || {});

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [isLoggedIn]);

  const handleBookClick = async (bookId) => {
    try {
      const bookRef = ref(database, `books/${bookId}`);
      const snapshot = await get(bookRef);
      const currentBook = snapshot.val();

      const currentReadCount = currentBook.readCount || 0;
      const newReadCount = currentReadCount + 1;

      await update(bookRef, {
        readCount: newReadCount
      });

      console.log(`Updated read count for book ${bookId} to ${newReadCount}`);

      navigate(`/book/${bookId}`);
    } catch (error) {
      console.error('Error updating read count:', error);
    }
  };

  const topReadBooks = [...books]
    .sort((a, b) => (b.readCount || 0) - (a.readCount || 0))
    .slice(0, 8);

  const getGenreNames = (genreIds) => {
    if (!genreIds) return 'Không xác định';
    return genreIds.map(id => genres[id]?.name || 'Không xác định').join(', ');
  };

  const getAuthorNames = (authorIds) => {
    if (!authorIds) return 'Không xác định';
    return authorIds.map(id => authors[id]?.name || 'Không xác định').join(', ');
  };

  const calculateRecommendationScore = (book) => {
    const genreScore = book.genreIds?.filter(genreId =>
      favoriteGenres.includes(genreId)
    ).length * 5 || 0;

    const readCountScore = Math.min(book.readCount || 0, 20);
    return genreScore + readCountScore;
  };

  const sortedNewBooks = [...books]
    .sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate))
    .slice(0, 8);

  return (
    <div className='HomeMain'>
      {isLoggedIn && (
        <AdminMessaging user={user} isAdmin={isAdmin} />
      )}

      {/* Section sách nổi bật */}
      <section className="featured-books">
        <h2>Sách nổi bật</h2>
        <div className="book-grid">
          {topReadBooks.map(book => (
            <div key={book.id} onClick={() => handleBookClick(book.id)} className="book-card">
              <img src={book.coverUrl} alt={book.title} className="book-cover" />
              <div className="book-info">
                <h3>{book.title}</h3>
                <p className="book-authors">{getAuthorNames(book.authorIds)}</p>
                <p className="book-genre">{getGenreNames(book.genreIds)}</p>
                <div className="book-stats">
                  <FaBookReader />
                  <span>{book.readCount || 0} lượt đọc</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/*section sách được mượn nhiều */}
      <section className="most-borrowed-books">
        <h2>Sách được mượn nhiều nhất</h2>
        <div className="book-grid">
          {topBorrowedBooks.map(book => (
            <div key={book.id} onClick={() => handleBookClick(book.id)} className="book-card">
              <img src={book.coverUrl} alt={book.title} className="book-cover" />
              <div className="book-info">
                <h3>{book.title}</h3>
                <p className="book-authors">{getAuthorNames(book.authorIds)}</p>
                <p className="book-genre">{getGenreNames(book.genreIds)}</p>
                <div className="book-stats">
                  <FaBookReader />
                  <span className="borrow-count">
                    {book.borrowCount || 0} lượt mượn
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section gợi ý sách */}
      {isLoggedIn && favoriteGenres.length > 0 && (
        <section className="book-recommendation">
          <h2>Gợi ý sách dành riêng cho bạn</h2>
          {recommendedBooks.length > 0 ? (
            <div className="book-recommendation-grid">
              {recommendedBooks.slice(0, 4).map(book => {
                const totalScore = calculateRecommendationScore(book);

                return (
                  <div
                    key={book.id}
                    onClick={() => handleBookClick(book.id)}
                    className="book-recommendation-card"
                  >
                    <div className="recommendation-badge">
                      Điểm phù hợp: {totalScore}
                    </div>
                    <img src={book.coverUrl} alt={book.title} className="book-cover" />
                    <div className="book-info">
                      <h3>{book.title}</h3>
                      <p className="book-genre">{getGenreNames(book.genreIds)}</p>
                      <p className="book-authors">{getAuthorNames(book.authorIds)}</p>
                      <div className="book-recommendation-details">
                        <span>🔥 {book.readCount || 0} lượt đọc</span>
                        <span>✨ Phù hợp {totalScore}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-recommendations">
              <p>Chúng tôi chưa tìm được sách phù hợp. Hãy cập nhật thêm sở thích của bạn!</p>
              <button
                onClick={() => navigate('/profile')}
                className="update-preferences-btn"
              >
                Cập Nhật Sở Thích
              </button>
            </div>
          )}
        </section>
      )}

      {/* Section sách mới phát hành */}
      <section className="new-releases">
        <h2>Sách mới</h2>
        <ul className="new-releases-list">
          {sortedNewBooks.map(book => (
            <li key={book.id} onClick={() => handleBookClick(book.id)}>
              <span className="book-title">{book.title}</span>
              <span className="book-authors">{getAuthorNames(book.authorIds)}</span>
              <span className="book-stats">
                <FaBookReader />
                <span>{book.readCount || 0}</span>
              </span>
              <span className="release-date">
                <DateFormatter
                  dateString={book.publicationDate}
                  format="DD/MM/YYYY"
                  showError={true}
                />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default HomeMain;