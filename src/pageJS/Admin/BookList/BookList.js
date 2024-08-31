import React, { useState } from 'react';
import { FaBars, FaTimes, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import '../../../pageCSS/Admin/BookListCss/BookListCss.css';
import Aside from '../Aside/Aside.js';
import img1 from '../../../resource/image/DacNhanTam.jpeg';
const initialBooks = [
    {
        id: 1,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        year: 1960,
        genre: "Fiction",
        image: img1
    },
    {
        id: 2,
        title: "1984",
        author: "George Orwell",
        year: 1949,
        genre: "Science Fiction",
        image: img1
    },
    {
        id: 3,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        year: 1813,
        genre: "Romance",
        image: img1
    },
    {
        id: 4,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        year: 1925,
        genre: "Fiction",
        image: img1
    },
    {
        id: 5,
        title: "To the Lighthouse",
        author: "Virginia Woolf",
        year: 1927,
        genre: "Modernist",
        image: img1
    }
];

function BookCardList() {
    const [books, setBooks] = useState(initialBooks);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAsideVisible, setIsAsideVisible] = useState(true);

    const toggleAside = () => {
        setIsAsideVisible(!isAsideVisible);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredBooks = books.filter((book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (id) => {
        console.log('Edit book with id:', id);
    };

    const handleDelete = (id) => {
        setBooks(books.filter(book => book.id !== id));
    };

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
                            <img src={book.image} alt={book.title} className="bookList-cover" />
                            <div className="book-info">
                                <h3>{book.title}</h3>
                                <p>Tác giả: {book.author}</p>
                                <p>Năm: {book.year}</p>
                                <p>Thể loại: {book.genre}</p>
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
        </div>
    );
}

export default BookCardList;