import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBookReader } from 'react-icons/fa';
import { database } from '../../firebaseConfig';
import { ref, onValue, update, get } from 'firebase/database';
import '../../pageCSS/HomeCss/HomeCss.css';

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

  useEffect(() => {
    console.log('Checking user in HomeMain');
    const userData = localStorage.getItem('user');
    console.log('User data:', userData);

    if (!userData) {
        console.log('No user found, redirecting to login');
        navigate('/login');
        return;
    }

    const user = JSON.parse(userData);
    const userRef = ref(database, `users/${user.uid}`);
    const booksRef = ref(database, 'books');
    const genresRef = ref(database, 'categories');
    const authorsRef = ref(database, 'authors');

    // Lắng nghe thể loại yêu thích của user
    const unsubscribeUser = onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      if (userData?.favoriteGenres) {
        setFavoriteGenres(Object.keys(userData.favoriteGenres));
      }
    });

    const unsubscribeBooks = onValue(booksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const booksArray = Object.entries(data).map(([id, book]) => ({
          id,
          readCount: book.readCount || 0,
          ...book
        }));

        booksArray.sort((a, b) => (b.readCount || 0) - (a.readCount || 0));
        setBooks(booksArray);
        
        // Lọc sách theo thể loại yêu thích
        if (favoriteGenres.length > 0) {
          const recommended = booksArray.filter(book => 
            book.genreIds?.some(genreId => favoriteGenres.includes(genreId))
          );
          setRecommendedBooks(recommended);
        }
      }
    });

    const unsubscribeGenres = onValue(genresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGenres(data);
      }
    });

    const unsubscribeAuthors = onValue(authorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAuthors(data);
      }
    });

    return () => {
      unsubscribeUser();
      unsubscribeBooks();
      unsubscribeGenres();
      unsubscribeAuthors();
    };
  }, [navigate, favoriteGenres]);

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

  const sortedNewBooks = [...books]
    .sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate))
    .slice(0, 8);

  return (
    <div className='HomeMain'>
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

      {/* Section sách theo thể loại yêu thích */}
      {favoriteGenres.length > 0 && recommendedBooks.length > 0 && (
        <section className="featured-books">
          <h2>Sách theo sở thích của bạn</h2>
          <div className="book-grid">
            {recommendedBooks.slice(0, 6).map(book => (
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