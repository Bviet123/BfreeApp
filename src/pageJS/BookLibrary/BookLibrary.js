import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { database } from '../../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import '../../pageCSS/BookLibraryCss/BookLibraryCss.css';
import HomeNav from '../Home/HomeNav';
import HomeFoot from '../Home/HomeFoot';
import FilterModal from './FilterModal';

function BookLibrary() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;

  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState({});
  const [genres, setGenres] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(12);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    genres: [],
    author: '',
    yearRange: { start: '', end: '' }
  });

  useEffect(() => {
    const booksRef = ref(database, 'books');
    const authorsRef = ref(database, 'authors');
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

    const unsubscribeAuthors = onValue(authorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const authorsMap = Object.entries(data).reduce((acc, [id, author]) => {
          acc[id] = author.name;
          return acc;
        }, {});
        setAuthors(authorsMap);
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
      unsubscribeAuthors();
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

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title && book.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAuthor = !activeFilters.author || 
      (book.authorIds && book.authorIds.some(authorId => 
        authors[authorId] && authors[authorId].toLowerCase() === activeFilters.author.toLowerCase()
      ));

    const matchesGenres = activeFilters.genres.length === 0 ||
      (book.genreIds && book.genreIds.some(id => activeFilters.genres.includes(id)));

    const publishYear = book.publicationDate ? parseInt(book.publicationDate.split('-')[0]) : null;
    const matchesYear = (!activeFilters.yearRange.start || (publishYear && publishYear >= parseInt(activeFilters.yearRange.start))) &&
      (!activeFilters.yearRange.end || (publishYear && publishYear <= parseInt(activeFilters.yearRange.end)));

    return matchesSearch && matchesAuthor && matchesGenres && matchesYear;
  });

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getGenreNames = (genreIds) => {
    if (!genreIds || !Array.isArray(genreIds)) return 'Không xác định';
    return genreIds.map(id => genres[id]?.name || 'Không xác định').join(', ');
  };

  return (
    <div className='book-library'>
      <HomeNav />
      <h1>Kho sách</h1>

      <div className="book-list-controls">
        <div className="book-list-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm sách..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <button
          className="filter-button"
          onClick={() => setIsFilterModalOpen(true)}
        >
          <FaFilter /> Bộ lọc
        </button>
      </div>

      <div className="active-filters">
        {activeFilters.author && (
          <span className="filter-tag">
            Tác giả: {activeFilters.author}
          </span>
        )}
        {activeFilters.genres.length > 0 && (
          <span className="filter-tag">
            Thể loại: {activeFilters.genres.map(id => genres[id]?.name).join(', ')}
          </span>
        )}
        {(activeFilters.yearRange.start || activeFilters.yearRange.end) && (
          <span className="filter-tag">
            Năm: {activeFilters.yearRange.start || '*'} - {activeFilters.yearRange.end || '*'}
          </span>
        )}
      </div>

      <div className="book-list">
        {currentBooks.map(book => (
          <div key={book.id} onClick={() => handleBookClick(book.id)} className="book-item">
            <img src={book.coverUrl || '/placeholder-image.jpg'} alt={book.title || 'Không có tiêu đề'} className="book-cover-library" />
            <div className="book-info-library">
              <h3 className="book-title">{book.title || 'Không có tiêu đề'}</h3>
              <p className="book-author">
                {book.authorIds 
                  ? book.authorIds.map(id => authors[id] || 'Không xác định').join(', ')
                  : 'Không xác định'}
              </p>
              <p className="book-genre">{getGenreNames(book.genreIds)}</p>
              <p className="book-description">{(book.description && book.description.substring(0, 100) + '...') || 'Không có mô tả'}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="no-results">
          Không tìm thấy sách phù hợp với điều kiện tìm kiếm
        </div>
      )}

      <div className="pagination">
        {Array.from({ length: Math.ceil(filteredBooks.length / booksPerPage) }, (_, i) => (
          <button
            key={i}
            onClick={() => paginate(i + 1)}
            className={currentPage === i + 1 ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        genres={genres}
        onApplyFilters={handleApplyFilters}
      />

      <HomeFoot />
    </div>
  );
}

export default BookLibrary;