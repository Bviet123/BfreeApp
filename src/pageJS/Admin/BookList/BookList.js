import React, { useState } from 'react';
import { FaBars, FaTimes, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import Aside from '../Aside/Aside.js';
import '../../../pageCSS/Admin/BookListCss/BookListCss.css';

const initialBooks = [
  {
    id: "book1",
    title: "Đắc Nhân Tâm",
    authorId: "author1",
    coverUrl: "https://example.com/images/dacnhantam.jpg",
    genreIds: ["genre1", "genre2"],
    publisherId: "publisher1",
    description: "Đắc Nhân Tâm của Dale Carnegie là một trong những cuốn sách bán chạy nhất mọi thời đại. Đây là cuốn sách dạy về cách ứng xử, cư xử trong cuộc sống để đạt được thành công.",
    publicationDate: "1936-10-17",
    pages: 292,
    language: "Tiếng Việt",
    isbn: "978-604-1-XXXXX-X",
    availability: {
      status: "available",
      copiesAvailable: 5
    },
    content: {
      totalChapters: 30,
      lastUpdated: "2024-09-08T10:00:00Z",
      chapters: [
        {
          chapterNumber: 1,
          title: "Chương 1: Nghệ thuật ứng xử",
          content: "Nội dung của chương 1...",
          createdAt: "2024-01-01T08:00:00Z",
          updatedAt: "2024-01-01T08:00:00Z"
        },
      ]
    }
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
        book.title.toLowerCase().includes(searchTerm.toLowerCase())
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
                            <img src={book.coverUrl} alt={book.title} className="book-cover" />
                            <div className="book-info">
                                <h3>{book.title}</h3>
                                <p><strong>ISBN:</strong> {book.isbn}</p>
                                <p><strong>Ngôn ngữ:</strong> {book.language}</p>
                                <p><strong>Số trang:</strong> {book.pages}</p>
                                <p><strong>Ngày xuất bản:</strong> {book.publicationDate}</p>
                                <p className="book-description">{book.description}</p>
                            </div>
                            <div className="book-actions">
                                <button onClick={() => handleEdit(book.id)} className="edit-btn">
                                    <FaEdit />
                                </button>
                                <button onClick={() => handleDelete(book.id)} className="delete-btn">
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default BookCardList;