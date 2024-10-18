import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { database } from '../../firebaseConfig';
import { ref, onValue } from 'firebase/database';

function HomeMain() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(6);

  useEffect(() => {
    const booksRef = ref(database, 'books');
    const genresRef = ref(database, 'categories');

    const unsubscribeBooks = onValue(booksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const booksArray = Object.entries(data).map(([id, book]) => ({
          id,
          ...book
        }));
        setBooks(booksArray);
      }
    });

    const unsubscribeGenres = onValue(genresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGenres(data);
      }
    });

    return () => {
      unsubscribeBooks();
      unsubscribeGenres();
    };
  }, []);

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`, { state: { user } });
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getGenreNames = (genreIds) => {
    if (!genreIds) return 'Không xác định';
    return genreIds.map(id => genres[id]?.name || 'Không xác định').join(', ');
  };

  // Sort books by publication date (newest first)
  const sortedNewBooks = [...books].sort((a, b) => 
    new Date(b.publicationDate) - new Date(a.publicationDate)
  );

  return (
    <div className='HomeMain'>
      <div className="book-list-search">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm sách..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <section className="featured-books">
        <h2>Sách nổi bật</h2>
        <div className="book-grid">
          {currentBooks.map(book => (
            <div key={book.id} onClick={() => handleBookClick(book.id)} className="book-card">
              <img src={book.coverUrl} alt={book.title} className="book-cover" />
              <div className="book-info">
                <h3>{book.title}</h3>
                <p className="book-genre">{getGenreNames(book.genreIds)}</p>
                <p className="book-description">{book.description.substring(0, 100)}...</p>
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

      <section className="new-releases">
        <h2>Sách mới phát hành</h2>
        <ul className="new-releases-list">
          {sortedNewBooks.slice(0, 8).map(book => (
            <li key={book.id} onClick={() => handleBookClick(book.id)}>
              <span className="book-title">{book.title}</span>
              <span className="release-date">{book.publicationDate}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default HomeMain;