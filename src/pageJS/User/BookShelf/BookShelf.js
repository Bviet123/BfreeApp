import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaFilter, FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../../../pageCSS/User/BookShelfCss/BookShelfCss.css';
import UserAside from '../UserAside/UserAside';
import { database, auth } from '../../../firebaseConfig';
import { ref, onValue, update } from 'firebase/database';
import FilterModal from '../../BookLibrary/FilterModal';

const Bookshelf = () => {
    // State Management
    const [books, setBooks] = useState([]);
    const [genres, setGenres] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [booksPerPage] = useState(6);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedAuthor, setSelectedAuthor] = useState(null);
    const [activeFilters, setActiveFilters] = useState({
        genres: [],
        author: { id: '', name: '' },
        yearRange: { start: '', end: '' }
    });

    const navigate = useNavigate();

    // Fetch user data
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

    // Fetch genres data
    useEffect(() => {
        const genresRef = ref(database, 'categories');
        const unsubscribeGenres = onValue(genresRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setGenres(data);
            }
        }, (error) => {
            console.error("Error fetching genres:", error);
        });

        return () => unsubscribeGenres();
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
                console.log('Fetched books:', bookList);
            } else {
                setBooks([]);
            }
        }, (error) => {
            console.error("Error fetching books:", error);
        });

        return () => unsubscribeBooks();
    }, [user?.favoriteBooks]);

    // Filter books
    const filteredBooks = useMemo(() => {
        console.log('Filtering with:', { 
            activeFilters, 
            totalBooks: books.length,
            searchTerm
        }); // Debug log

        const lowercasedTerm = searchTerm.toLowerCase().trim();

        const filtered = books.filter(book => {
            // Search matching
            const matchesSearch = !lowercasedTerm || 
                (book.title && book.title.toLowerCase().includes(lowercasedTerm)) ||
                (book.author && book.author.toLowerCase().includes(lowercasedTerm));

            // Author filter matching
            const matchesAuthor = !activeFilters.author.id || 
                (book.authorIds && book.authorIds.includes(activeFilters.author.id));

            // Genre filter matching
            const matchesGenres = activeFilters.genres.length === 0 ||
                (book.genreIds && book.genreIds.some(genreId => 
                    activeFilters.genres.includes(genreId)
                ));

            // Year range filter matching
            const yearStart = activeFilters.yearRange.start ? parseInt(activeFilters.yearRange.start) : null;
            const yearEnd = activeFilters.yearRange.end ? parseInt(activeFilters.yearRange.end) : null;
            const publishYear = book.publicationYear ? parseInt(book.publicationYear) : null;

            const matchesYear = (!yearStart || (publishYear && publishYear >= yearStart)) &&
                (!yearEnd || (publishYear && publishYear <= yearEnd));

            const result = matchesSearch && matchesAuthor && matchesGenres && matchesYear;

            console.log('Book filtering:', {
                id: book.id,
                title: book.title,
                matchesSearch,
                matchesAuthor,
                matchesGenres,
                matchesYear,
                result
            });

            return result;
        });

        console.log('Filtered result:', filtered.length, 'books'); 
        return filtered;
    }, [books, searchTerm, activeFilters]);

    // Handle filter application
    const handleApplyFilters = useCallback((filters) => {
        console.log('Applying filters:', filters); 
        setActiveFilters({
            genres: filters.genres,
            author: {
                id: filters.author.id || '',
                name: filters.author.name || ''
            },
            yearRange: {
                start: filters.yearRange.start || '',
                end: filters.yearRange.end || ''
            }
        });
        setCurrentPage(1);
    }, []);

    // Remove filter handlers
    const handleRemoveAuthorFilter = useCallback(() => {
        setActiveFilters(prev => ({
            ...prev,
            author: { id: '', name: '' }
        }));
        setSelectedAuthor(null);
    }, []);

    const handleRemoveGenreFilters = useCallback(() => {
        setActiveFilters(prev => ({
            ...prev,
            genres: []
        }));
    }, []);

    const handleRemoveYearFilter = useCallback(() => {
        setActiveFilters(prev => ({
            ...prev,
            yearRange: { start: '', end: '' }
        }));
    }, []);

    // Handle book removal from favorites
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

    // Handle search input change
    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    }, []);

    // Handle book click navigation
    const handleBookClick = useCallback((bookId) => {
        navigate(`/book/${bookId}`, { state: { user } });
    }, [navigate, user]);

    // Calculate pagination
    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

    // Loading state
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

                {/* Search and Filter Section */}
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
                    <button
                        type="button"
                        className="bs-filter-button"
                        onClick={() => setIsFilterModalOpen(true)}
                    >
                        <FaFilter /> Lọc
                    </button>
                </div>

                {/* Filter Modal */}
                <FilterModal
                    isOpen={isFilterModalOpen}
                    onClose={() => setIsFilterModalOpen(false)}
                    genres={genres}
                    onApplyFilters={handleApplyFilters}
                    selectedAuthor={selectedAuthor}
                    onAuthorSelect={setSelectedAuthor}
                />

                {/* Active Filters Display */}
                <div className="bs-active-filters">
                    {activeFilters.author.name && (
                        <span className="bs-filter-tag">
                            Tác giả: {activeFilters.author.name}
                            <button
                                onClick={handleRemoveAuthorFilter}
                                className="bs-remove-filter"
                            >
                                ×
                            </button>
                        </span>
                    )}
                    {activeFilters.genres.length > 0 && (
                        <span className="bs-filter-tag">
                            Thể loại: {activeFilters.genres.map(genreId =>
                                genres[genreId]?.name
                            ).join(', ')}
                            <button
                                onClick={handleRemoveGenreFilters}
                                className="bs-remove-filter"
                            >
                                ×
                            </button>
                        </span>
                    )}
                    {(activeFilters.yearRange.start || activeFilters.yearRange.end) && (
                        <span className="bs-filter-tag">
                            Năm: {activeFilters.yearRange.start || '*'} - {activeFilters.yearRange.end || '*'}
                            <button
                                onClick={handleRemoveYearFilter}
                                className="bs-remove-filter"
                            >
                                ×
                            </button>
                        </span>
                    )}
                </div>

                {/* Books Grid */}
                <div className="bs-bookshelf-list">
                    {currentBooks.length > 0 ? (
                        currentBooks.map(book => (
                            <div key={book.id} className="bs-book-item">
                                <div className='bs-book-image' onClick={() => handleBookClick(book.id)} style={{ cursor: 'pointer' }}>
                                    <img src={book.coverUrl} alt={book.title} className="bs-book-cover-library" />
                                    <div className="bs-book-info-library">
                                        <h3 className="bs-book-title">{book.title}</h3>
                                        <p className="bs-book-author">{book.author}</p>
                                        <p className="bs-book-genre">
                                            {book.genreIds?.map(genreId => genres[genreId]?.name).join(', ')}
                                        </p>
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
                            <p>{searchTerm || Object.values(activeFilters).some(f => 
                                Array.isArray(f) ? f.length > 0 : 
                                typeof f === 'object' ? Object.values(f).some(v => v !== '') : 
                                f !== ''
                            ) ? 'Không tìm thấy sách phù hợp' : 'Bạn chưa có sách yêu thích nào'}</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
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

// Pagination Component
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