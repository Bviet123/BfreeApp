import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaFilter, FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../../../pageCSS/User/BookShelfCss/BookShelfCss.css';
import UserAside from '../UserAside/UserAside';
import { database, auth } from '../../../firebaseConfig';
import { ref, onValue, update } from 'firebase/database';

const Bookshelf = () => {
    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [booksPerPage] = useState(6);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            setIsLoading(false);
            return;
        }

        const userRef = ref(database, `users/${currentUser.uid}`);
        const unsubscribeUser = onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                setUser(userData);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching user data:", error);
            setIsLoading(false);
        });

        return () => unsubscribeUser();
    }, []);

    // Fetch books data
    useEffect(() => {
        if (!user?.favoriteBooks) {
            setBooks([]);
            return;
        }

        const booksRef = ref(database, 'books');
        const unsubscribeBooks = onValue(booksRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const bookList = Object.entries(data)
                    .filter(([key]) => user.favoriteBooks[key])
                    .map(([key, value]) => ({
                        id: key,
                        ...value
                    }));
                setBooks(bookList);
            } else {
                setBooks([]);
            }
        }, (error) => {
            console.error("Error fetching books:", error);
        });

        return () => unsubscribeBooks();
    }, [user?.favoriteBooks]);

    const filteredBooks = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase().trim();
        if (lowercasedTerm === '') {
            return books;
        }
        return books.filter(book =>
            (book.title && book.title.toLowerCase().includes(lowercasedTerm)) ||
            (book.author && book.author.toLowerCase().includes(lowercasedTerm)) ||
            (book.genre && book.genre.toLowerCase().includes(lowercasedTerm)) ||
            (book.description && book.description.toLowerCase().includes(lowercasedTerm))
        );
    }, [books, searchTerm]);

    const removeFromFavorites = useCallback(async (bookId, e) => {
        e.stopPropagation();
        if (!auth.currentUser || !user) return;

        if (window.confirm('Bạn có chắc chắn muốn xóa cuốn sách này khỏi danh sách yêu thích?')) {
            try {
                const userRef = ref(database, `users/${auth.currentUser.uid}/favoriteBooks`);
                const updatedFavorites = { ...user.favoriteBooks };
                delete updatedFavorites[bookId];

                await update(userRef, updatedFavorites);

                if (filteredBooks.length === 1 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                }
            } catch (error) {
                console.error("Error removing book from favorites:", error);
                alert('Có lỗi xảy ra khi xóa sách khỏi danh sách yêu thích');
            }
        }
    }, [user, currentPage, filteredBooks.length]);

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    }, []);

    const handleBookClick = useCallback((bookId) => {
        navigate(`/book/${bookId}`, { state: { user } });
    }, [navigate, user]);

    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

    if (isLoading) {
        return (
            <div className="bs-loading-container">
                <div className="bs-loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="bs-bookshelf-container">
            <UserAside activeItem="Bookshelf" user={user} />
            <div className="bs-bookshelf">
                <h1>Sách yêu thích của tôi</h1>
                <div className="bs-bookshelf-actions">
                    <div className="bs-search-bar">
                        <input
                            type="text"
                            placeholder="Tìm kiếm sách..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <button type="button" aria-label="Search">
                            <FaSearch />
                        </button>
                    </div>
                    <button type="button" className="bs-filter-button">
                        <FaFilter /> Lọc
                    </button>
                </div>

                <div className="bs-bookshelf-list">
                    {currentBooks.length > 0 ? (
                        currentBooks.map(book => (
                            <div key={book.id} className="bs-book-item">
                                <div className='bs-book-image' onClick={() => handleBookClick(book.id)} style={{ cursor: 'pointer' }}>
                                    <img src={book.coverUrl} alt={book.title} className="bs-book-cover-library" />
                                    <div className="bs-book-info-library">
                                        <h3 className="bs-book-title">{book.title}</h3>
                                        <p className="bs-book-author">{book.author}</p>
                                        <p className="bs-book-genre">{book.genre}</p>
                                        <p className="bs-book-description">
                                            {book.description?.substring(0, 100)}...
                                        </p>
                                        <button
                                            className="bs-remove-favorite-btn"
                                            onClick={(e) => removeFromFavorites(book.id, e)}
                                            type="button"
                                        >
                                            <FaHeart /> Hủy yêu thích
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bs-no-books-message">
                            <p>{searchTerm ? 'Không tìm thấy sách phù hợp' : 'Bạn chưa có sách yêu thích nào'}</p>
                        </div>
                    )}
                </div>

                {filteredBooks.length > booksPerPage && (
                    <Pagination
                        booksPerPage={booksPerPage}
                        totalBooks={filteredBooks.length}
                        paginate={setCurrentPage}
                        currentPage={currentPage}
                    />
                )}
            </div>
        </div>
    );
};

const Pagination = ({ booksPerPage, totalBooks, paginate, currentPage }) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalBooks / booksPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="bs-pagination-container">
            <ul className="bs-pagination">
                {pageNumbers.map(number => (
                    <li
                        key={number}
                        className={`bs-page-item ${currentPage === number ? 'active' : ''}`}
                    >
                        <button
                            onClick={() => paginate(number)}
                            className="bs-page-link"
                            type="button"
                        >
                            {number}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Bookshelf;