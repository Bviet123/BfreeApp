import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBookReader, FaStar } from 'react-icons/fa';
import { database } from '../../firebaseConfig';
import { ref, onValue, update, get } from 'firebase/database';
import '../../pageCSS/HomeCss/HomeCss.css';
import AdminMessaging from '../MessagesPage/AdminMessaging';

function HomeMain() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState({});
  const [authors, setAuthors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(6);
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const isAdmin = user && user.role === 'Admin';
  const isLoggedIn = !!user;

  useEffect(() => {
    localStorage.removeItem('user');

    const fetchData = async () => {
      try {
        const booksSnapshot = await get(ref(database, 'books'));
        const genresSnapshot = await get(ref(database, 'categories'));
        const authorsSnapshot = await get(ref(database, 'authors'));

        // Xử lý dữ liệu sách khi chưa đăng nhập
        const booksData = booksSnapshot.val();
        if (booksData) {
          const booksArray = Object.entries(booksData).map(([id, book]) => ({
            id,
            readCount: book.readCount || 0,
            ...book
          }));

          booksArray.sort((a, b) => (b.readCount || 0) - (a.readCount || 0));
          setBooks(booksArray);

          // Nếu đăng nhập thì mới lấy thêm thông tin gợi ý
          if (isLoggedIn && user.uid) {
            const userSnapshot = await get(ref(database, `users/${user.uid}`));
            const userFavoriteGenres = userSnapshot.val()?.favoriteGenres
              ? Object.keys(userSnapshot.val().favoriteGenres)
              : [];
            setFavoriteGenres(userFavoriteGenres);

            // Tính toán sách gợi ý
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

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const filteredBooks = books
    .filter((book) => book.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

      <div className="book-list-search">
        <FaSearch />
        <input
          type="text"
          placeholder="Tìm kiếm sách..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Section sách nổi bật */}
      <section className="featured-books">
        <h2>Sách nổi bật</h2>
        <div className="book-grid">
          {currentBooks.map(book => (
            <div key={book.id} onClick={() => handleBookClick(book.id)} className="book-card">
              <img src={book.coverUrl} alt={book.title} className="book-cover" />
              <div className="book-info">
                <h3>{book.title}</h3>
                <p className="book-genre">{getGenreNames(book.genreIds)}</p>
                <p className="book-authors">{getAuthorNames(book.authorIds)}</p>
                <div className="book-stats">
                  <FaBookReader />
                  <span>{book.readCount || 0} lượt đọc</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="pagination">
          {Array.from({ length: Math.ceil(filteredBooks.length / booksPerPage) }, (_, i) => (
            <button key={i} onClick={() => paginate(i + 1)} className={currentPage === i + 1 ? 'active' : ''}>
              {i + 1}
            </button>
          ))}
        </div>
      </section>

      {/* Section gợi ý sách thông minh */}
      {isLoggedIn && favoriteGenres.length > 0 && (
        <section className="book-recommendation">
          <h2>Gợi ý sách dành riêng cho bạn</h2>
          {recommendedBooks.length > 0 ? (
            <div className="book-recommendation-grid">
              {recommendedBooks.slice(0, 6).map(book => {
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
        <h2>Sách mới phát hành</h2>
        <ul className="new-releases-list">
          {sortedNewBooks.map(book => (
            <li key={book.id} onClick={() => handleBookClick(book.id)}>
              <span className="book-title">{book.title}</span>
              <span className="book-authors">{getAuthorNames(book.authorIds)}</span>
              <span className="book-stats">
                <FaBookReader />
                <span>{book.readCount || 0}</span>
              </span>
              <span className="release-date">{book.publicationDate}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default HomeMain;