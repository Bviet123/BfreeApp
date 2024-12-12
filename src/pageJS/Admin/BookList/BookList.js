import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaEdit, FaTrash, FaSearch, FaPlus } from 'react-icons/fa';
import { database } from '../../../firebaseConfig';
import { ref, onValue, remove } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import Aside from '../Aside/Aside.js';
import DeleteBookModal from './BookModal/DeleteModal.js';
import '../../../pageCSS/Admin/BookListCss/BookListCss.css';

const BookCard = ({ book, authors, genres, onEdit, onDelete }) => (
  <div className="bcl-card">
    <div className="bcl-cover-wrap">
      <img src={book.coverUrl} alt={book.title} className="bcl-cover" />
    </div>
    <div className="bcl-info">
      <h3>{book.title}</h3>
      <p><strong>Tác giả:</strong> {
        book.authorIds?.map(id => authors[id]?.name || 'Unknown').join(', ') || 'Unknown'
      }</p>
      <p><strong>Thể loại:</strong> {
        book.genreIds ?
          Object.entries(book.genreIds)
            .map(([_, genreId]) => genres[genreId]?.name || 'Unknown')
            .join(', ')
          : 'Chưa phân loại'
      }</p>
      <p><strong>Lượt đọc:</strong> {book.readCount || 0}</p>
    </div>
    <div className="bcl-actions">
      <button onClick={() => onEdit(book.id)} className="bcl-btn-edit">
        <FaEdit />
      </button>
      <button onClick={() => onDelete(book)} className="bcl-btn-delete">
        <FaTrash />
      </button>
    </div>
  </div>
);

const SearchBar = ({ searchTerm, onSearch }) => (
  <div className="bcl-search">
    <FaSearch className="bcl-search-icon" />
    <input
      type="text"
      placeholder="Tìm kiếm sách..."
      value={searchTerm}
      onChange={onSearch}
      className="bcl-search-input"
    />
  </div>
);

const Pagination = ({ currentPage, totalPages, paginate }) => (
  <nav className="bcl-pagination">
    <ul className="bcl-pagination-list">
      {[...Array(totalPages)].map((_, i) => (
        <li
          key={i + 1}
          className={i + 1 === currentPage ? 'bcl-page-active' : 'bcl-page-item'}
        >
          <button
            onClick={() => paginate(i + 1)}
            className="bcl-page-btn"
          >
            {i + 1}
          </button>
        </li>
      ))}
    </ul>
  </nav>
);

function BookCardList() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState({});
  const [genres, setGenres] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isAsideVisible, setIsAsideVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const BOOKS_PER_PAGE = 8;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = () => {
      const unsubscribeBooks = onValue(ref(database, 'books'), (snapshot) => {
        const data = snapshot.val();
        const booksArray = data ?
          Object.entries(data).map(([id, book]) => ({ id, ...book })) : [];
        const sortedBooks = booksArray.sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        setBooks(sortedBooks);
        setLoading(false);
      });

      const unsubscribeAuthors = onValue(ref(database, 'authors'), (snapshot) => {
        setAuthors(snapshot.val() || {});
      });

      const unsubscribeGenres = onValue(ref(database, 'categories'), (snapshot) => {
        setGenres(snapshot.val() || {});
      });

      return () => {
        unsubscribeBooks();
        unsubscribeAuthors();
        unsubscribeGenres();
      };
    };

    return fetchData();
  }, []);

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.authorIds?.some(id =>
      authors[id]?.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    book.genreIds && Object.entries(book.genreIds).some(([_, genreId]) =>
      genres[genreId]?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const currentBooks = filteredBooks.slice(
    (currentPage - 1) * BOOKS_PER_PAGE,
    currentPage * BOOKS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);


  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleToggleAside = () => {
    setIsAsideVisible(!isAsideVisible);
  };

  const handleEdit = (id) => {
    navigate(`/admin/books/${id}`);
  };

  const handleAddBook = () => {
    navigate('/admin/books/add');
  };

  const handleDelete = (book) => {
    setBookToDelete(book);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;

    try {
      await remove(ref(database, `books/${bookToDelete.id}`));
      setIsDeleteModalOpen(false);
      setBookToDelete(null);
    } catch (error) {
      console.error('Lỗi khi xóa sách:', error);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setBookToDelete(null);
  };

  if (loading) {
    return (
      <div className="bs-loading-container">
        <div className="bs-loading-spinner"></div>
      </div>
    );
  }

  if (!loading && filteredBooks.length === 0) {
    return (
      <div className="bcl-container">
        <Aside className={`bcl-aside ${isAsideVisible ? 'bcl-aside-visible' : 'bcl-aside-hidden'}`} />
        <div className={`bcl-main ${isAsideVisible ? '' : 'bcl-full-width'}`}>
          <div className="bcl-header">
            <div className="bcl-header-left">
              <button
                className="bcl-toggle-btn"
                onClick={handleToggleAside}
                aria-label={isAsideVisible ? "Ẩn thanh bên" : "Hiện thanh bên"}
              >
                {isAsideVisible ? <FaTimes /> : <FaBars />}
              </button>
              <h2 className="bcl-title">Danh sách sách</h2>
            </div>
            <button className="bcl-add-btn" onClick={handleAddBook}>
              <FaPlus /> Thêm sách
            </button>
          </div>
          <SearchBar searchTerm={searchTerm} onSearch={handleSearchChange} />
          <div className="bcl-empty-state">
            <p>Không tìm thấy sách nào{searchTerm ? ' phù hợp với tìm kiếm' : ''}.</p>
            <button className="bcl-add-btn" onClick={handleAddBook}>
              <FaPlus /> Thêm sách mới
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bcl-container">
      <Aside className={`bcl-aside ${isAsideVisible ? 'bcl-aside-visible' : 'bcl-aside-hidden'}`} />
      <div className={`bcl-main ${isAsideVisible ? '' : 'bcl-full-width'}`}>
        <div className="bcl-header">
          <div className="bcl-header-left">
            <button
              className="bcl-toggle-btn"
              onClick={handleToggleAside}
              aria-label={isAsideVisible ? "Ẩn thanh bên" : "Hiện thanh bên"}
            >
              {isAsideVisible ? <FaTimes /> : <FaBars />}
            </button>
            <h2 className="bcl-title">Danh sách sách</h2>
          </div>
          <button className="bcl-add-btn" onClick={handleAddBook}>
            <FaPlus /> Thêm sách
          </button>
        </div>

        <SearchBar searchTerm={searchTerm} onSearch={handleSearchChange} />

        <div className="bcl-grid">
          {currentBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              authors={authors}
              genres={genres}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            paginate={setCurrentPage}
          />
        )}
      </div>

      <DeleteBookModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        bookTitle={bookToDelete?.title}
      />
    </div>
  );
}

export default BookCardList;