import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaEdit, FaTrash, FaSearch, FaPlus } from 'react-icons/fa';
import Aside from '../Aside/Aside.js';
import '../../../pageCSS/Admin/BookListCss/BookListCss.css';
import { database } from '../../../firebaseConfig';
import { ref, onValue, remove } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import DeleteBookModal from './BookModal/DeleteModal.js';

function BookCardList() {
    const [books, setBooks] = useState([]);
    const [authors, setAuthors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isAsideVisible, setIsAsideVisible] = useState(true);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const booksRef = ref(database, 'books');
        const unsubscribe = onValue(booksRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const booksArray = Object.entries(data).map(([id, book]) => ({
                    id,
                    ...book
                }));
                setBooks(booksArray);
            } else {
                setBooks([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const authorsRef = ref(database, 'authors');
        const unsubscribe = onValue(authorsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setAuthors(data);
            } else {
                setAuthors({});
            }
        });

        return () => unsubscribe();
    }, []);

    const toggleAside = () => {
        setIsAsideVisible(!isAsideVisible);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredBooks = books.filter((book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (id) => {
        navigate(`/admin/books/BookDetail/${id}`);
    };

    const handleDelete = (book) => {
        setBookToDelete(book);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (bookToDelete) {
            const bookRef = ref(database, `books/${bookToDelete.id}`);
            remove(bookRef)
                .then(() => {
                    console.log('Book deleted successfully');
                    setIsDeleteModalOpen(false);
                    setBookToDelete(null);
                })
                .catch((error) => {
                    console.error('Error deleting book: ', error);
                });
        }
    };

    const handleAddBook = () => {
        navigate('/admin/books/add');
    };

    const getAuthorNames = (authorIds) => {
        if (!authorIds) return 'Unknown';
        return authorIds.map(id => authors[id]?.name || 'Unknown').join(', ');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="book-list-container">
            <Aside className={isAsideVisible ? 'visible' : 'hidden'} />
            <div className={`book-list-main ${isAsideVisible ? '' : 'full-width'}`}>
                <div className="book-list-header">
                    <div className='book-list-toggle'>
                        <button className="toggle-aside-btn" onClick={toggleAside}>
                            {isAsideVisible ? <FaTimes /> : <FaBars />}
                        </button>
                        <h2>Danh sách sách</h2>
                    </div>
                    <button className="add-book-btn" onClick={handleAddBook}>
                        <FaPlus /> Thêm sách
                    </button>
                </div>

                <div className="book-list-search">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm sách..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                <div className="book-card-grid">
                    {filteredBooks.map((book) => (
                        <div key={book.id} className="book-card">
                            <img src={book.coverUrl} alt={book.title} className="book-cover" />
                            <div className="book-info">
                                <h3>{book.title}</h3>
                                <p><strong>Tác giả:</strong> {getAuthorNames(book.authorIds)}</p>
                                <p><strong>Ngôn ngữ:</strong> {book.language}</p>
                                <p><strong>Số trang:</strong> {book.pages}</p>
                                <div className="book-actions">
                                    <button onClick={() => handleEdit(book.id)} className="edit-btn">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleDelete(book.id)} className="delete-btn">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <DeleteBookModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                bookTitle={bookToDelete?.title}
            />
        </div>
    );
}

export default BookCardList;