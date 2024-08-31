import React, { useState } from 'react';
import { FaSearch, FaFilter, FaTrash } from 'react-icons/fa';
import '../../../pageCSS/User/BookShelfCss/BookShelfCss.css';
import UserAside from '../UserAside/UserAside';

const sampleBookshelfData = [
    {
        id: 1,
        title: "Đắc Nhân Tâm",
        author: "Dale Carnegie",
        cover: "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
        genre: "Tự giúp bản thân",
        description: "Đắc nhân tâm của Dale Carnegie là quyển sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại. Tác phẩm đã được chuyển ngữ sang hầu hết các thứ tiếng trên thế giới và có mặt ở hàng trăm quốc gia.",
        rating: 4.5,
        price: 86000
    },

    {
        id: 2,
        title: "Đắc Nhân Tâm",
        author: "Dale Carnegie",
        cover: "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
        genre: "Tự giúp bản thân",
        description: "Đắc nhân tâm của Dale Carnegie là quyển sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại. Tác phẩm đã được chuyển ngữ sang hầu hết các thứ tiếng trên thế giới và có mặt ở hàng trăm quốc gia.",
        rating: 4.5,
        price: 86000
    },

    {
        id: 3,
        title: "Đắc Nhân Tâm",
        author: "Dale Carnegie",
        cover: "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
        genre: "Tự giúp bản thân",
        description: "Đắc nhân tâm của Dale Carnegie là quyển sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại. Tác phẩm đã được chuyển ngữ sang hầu hết các thứ tiếng trên thế giới và có mặt ở hàng trăm quốc gia.",
        rating: 4.5,
        price: 86000
    },

    {
        id: 4,
        title: "Đắc Nhân Tâm",
        author: "Dale Carnegie",
        cover: "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
        genre: "Tự giúp bản thân",
        description: "Đắc nhân tâm của Dale Carnegie là quyển sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại. Tác phẩm đã được chuyển ngữ sang hầu hết các thứ tiếng trên thế giới và có mặt ở hàng trăm quốc gia.",
        rating: 4.5,
        price: 86000
    },

    {
        id: 5,
        title: "Đắc Nhân Tâm",
        author: "Dale Carnegie",
        cover: "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
        genre: "Tự giúp bản thân",
        description: "Đắc nhân tâm của Dale Carnegie là quyển sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại. Tác phẩm đã được chuyển ngữ sang hầu hết các thứ tiếng trên thế giới và có mặt ở hàng trăm quốc gia.",
        rating: 4.5,
        price: 86000
    },

    {
        id: 6,
        title: "Đắc Nhân Tâm",
        author: "Dale Carnegie",
        cover: "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
        genre: "Tự giúp bản thân",
        description: "Đắc nhân tâm của Dale Carnegie là quyển sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại. Tác phẩm đã được chuyển ngữ sang hầu hết các thứ tiếng trên thế giới và có mặt ở hàng trăm quốc gia.",
        rating: 4.5,
        price: 86000
    },

    {
        id: 7,
        title: "Đắc Nhân Tâm",
        author: "Dale Carnegie",
        cover: "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
        genre: "Tự giúp bản thân",
        description: "Đắc nhân tâm của Dale Carnegie là quyển sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại. Tác phẩm đã được chuyển ngữ sang hầu hết các thứ tiếng trên thế giới và có mặt ở hàng trăm quốc gia.",
        rating: 4.5,
        price: 86000
    },

    {
        id: 8,
        title: "Đắc Nhân Tâm",
        author: "Dale Carnegie",
        cover: "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
        genre: "Tự giúp bản thân",
        description: "Đắc nhân tâm của Dale Carnegie là quyển sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại. Tác phẩm đã được chuyển ngữ sang hầu hết các thứ tiếng trên thế giới và có mặt ở hàng trăm quốc gia.",
        rating: 4.5,
        price: 86000
    },

    {
        id: 9,
        title: "Đắc Nhân Tâm",
        author: "Dale Carnegie",
        cover: "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
        genre: "Tự giúp bản thân",
        description: "Đắc nhân tâm của Dale Carnegie là quyển sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại. Tác phẩm đã được chuyển ngữ sang hầu hết các thứ tiếng trên thế giới và có mặt ở hàng trăm quốc gia.",
        rating: 4.5,
        price: 86000
    },

];

const Bookshelf = () => {
    const [books, setBooks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [booksPerPage] = useState(4);

    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = sampleBookshelfData.slice(indexOfFirstBook, indexOfLastBook);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const removeBook = (id) => {
        // Xác nhận trước khi xóa
        if (window.confirm('Bạn có chắc chắn muốn xóa cuốn sách này khỏi danh sách đã lưu?')) {
            setBooks(books.filter(book => book.id !== id));
            // Nếu trang hiện tại không còn sách nào, chuyển về trang trước đó
            if (currentBooks.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        }
    };

    return (
        <div className="bookshelf-container">
            <UserAside activeItem="Bookshelf" />
            <div className="bookshelf">
                <h1>Tủ sách của tôi</h1>
                <div className="bookshelf-actions">
                    <div className="search-bar">
                        <input type="text" placeholder="Tìm kiếm sách..." />
                        <button><FaSearch /></button>
                    </div>
                    <button className="filter-button"><FaFilter /> Lọc</button>
                </div>
                <div className="bookshelf-list">
                    {currentBooks.map(book => (
                        <div key={book.id} className="book-item">
                            <img src={book.cover} alt={book.title} className="book-cover-library" />
                            <div className="book-info-library">
                                <h3 className="book-title">{book.title}</h3>
                                <p className="book-author">{book.author}</p>
                                <p className="book-genre">{book.genre}</p>
                                <p className="book-description">{book.description.substring(0, 100)}...</p>
                                <button className="remove-book-btn" onClick={() => removeBook(book.id)}>
                                    <FaTrash /> Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <Pagination
                    booksPerPage={booksPerPage}
                    totalBooks={sampleBookshelfData.length}
                    paginate={paginate}
                    currentPage={currentPage}
                />
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
        <div className='pagination-container'>
            <ul className='pagination'>
                {pageNumbers.map(number => (
                    <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                        <a onClick={() => paginate(number)} href='#!' className='page-link'>
                            {number}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Bookshelf;