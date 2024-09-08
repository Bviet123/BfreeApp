import React, { useState } from 'react';
import { FaBars, FaTimes, FaSearch, FaCheck, FaTimes as FaTimesCircle, FaUndo, FaChevronLeft, FaChevronRight, FaTrash } from 'react-icons/fa';
import Aside from '../Aside/Aside.js';
import '../../../pageCSS/Admin/BorowListCss/BorrowListCss.css';
import BorrowModal from './BorrowModal/BorrowModal.js';
import ReturnModal from './BorrowModal/ReturnModal.js';
import DeleteModal from './DeleteModal.js';

// Initial data for borrow requests
const initialBorrowRequests = [
    {
        id: 1,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        requester: "John Doe",
        requestDate: "2024-08-10",
    },
    // ... (other borrow requests)
];

// Initial data for borrowed books
const initialBorrowedBooks = [
    {
        id: 1,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        borrower: "Bob Wilson",
        borrowDate: "2024-08-01",
        dueDate: "2024-09-01",
    },
    // ... (other borrowed books)
];

// Initial data for returned books
const initialReturnedBooks = [
    {
        id: 1,
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        borrower: "Emma Thompson",
        borrowDate: "2024-07-15",
        returnDate: "2024-08-14",
    },
    // ... (other returned books)
];

function BorrowList() {
    // State for the three lists
    const [borrowRequests, setBorrowRequests] = useState(initialBorrowRequests);
    const [borrowedBooks, setBorrowedBooks] = useState(initialBorrowedBooks);
    const [returnedBooks, setReturnedBooks] = useState(initialReturnedBooks);

    // Other state variables
    const [activeTab, setActiveTab] = useState('requests');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAsideVisible, setIsAsideVisible] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [modalOpen, setModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);

    // Toggle sidebar visibility
    const toggleAside = () => {
        setIsAsideVisible(!isAsideVisible);
    };

    // Handle search input
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    // Approve a borrow request
    const handleApproveRequest = (id) => {
        const approvedRequest = borrowRequests.find(request => request.id === id);
        setBorrowRequests(borrowRequests.filter(request => request.id !== id));
        setBorrowedBooks([...borrowedBooks, {
            ...approvedRequest,
            id: borrowedBooks.length + 1,
            borrower: approvedRequest.requester,
            borrowDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }]);
    };

    // Open modal for various actions
    const openModal = (action, book) => {
        setSelectedBook(book);
        if (action === 'return') {
            setReturnModalOpen(true);
        } else {
            setModalAction(action);
            setModalOpen(true);
        }
    };

    // Close return modal
    const closeReturnModal = () => {
        setReturnModalOpen(false);
        setSelectedBook(null);
    };

    // Handle returning a book
    const handleReturnBook = (book) => {
        if (book && book.id) {
            // Move the book from borrowed to returned
            const returnedBook = {
                ...book,
                returnDate: new Date().toISOString().split('T')[0],
            };
            setReturnedBooks([...returnedBooks, returnedBook]);
            setBorrowedBooks(borrowedBooks.filter(b => b.id !== book.id));
            closeReturnModal();
        } else {
            console.error('Invalid book object passed to handleReturnBook');
        }
    };

    // Close modal
    const closeModal = () => {
        setModalOpen(false);
        setModalAction(null);
        setSelectedBook(null);
    };

    // Confirm action in modal
    const handleConfirmAction = (rejectReason) => {
        if (modalAction === 'approve') {
            handleApproveRequest(selectedBook.id);
        } else if (modalAction === 'reject') {
            handleRejectRequest(selectedBook.id, rejectReason);
        }
        closeModal();
    };

    // Reject a borrow request
    const handleRejectRequest = (id) => {
        setBorrowRequests(borrowRequests.filter(request => request.id !== id));
    };

    // Filter borrow requests based on search term
    const filteredRequests = borrowRequests.filter((request) =>
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter borrowed books based on search term
    const filteredBorrowedBooks = borrowedBooks.filter((book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.borrower.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter returned books based on search term
    const filteredReturnedBooks = returnedBooks.filter((book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.borrower.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Mở modal xóa
    const openDeleteModal = (book) => {
        setBookToDelete(book);
        setDeleteModalOpen(true);
    };

    // Đóng modal xóa
    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setBookToDelete(null);
    };

    // Xử lý xóa sách
    const handleDeleteBook = () => {
        if (bookToDelete && bookToDelete.id) {
            setReturnedBooks(returnedBooks.filter(book => book.id !== bookToDelete.id));
            closeDeleteModal();
        } else {
            console.error('Invalid book object passed to handleDeleteBook');
        }
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = activeTab === 'requests'
        ? filteredRequests.slice(indexOfFirstItem, indexOfLastItem)
        : activeTab === 'borrowed'
            ? filteredBorrowedBooks.slice(indexOfFirstItem, indexOfLastItem)
            : filteredReturnedBooks.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(
        (activeTab === 'requests'
            ? filteredRequests.length
            : activeTab === 'borrowed'
                ? filteredBorrowedBooks.length
                : filteredReturnedBooks.length) / itemsPerPage
    );

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="book-lending-container">
            <Aside className={isAsideVisible ? 'visible' : 'hidden'} />
            <div className={`book-lending-main ${isAsideVisible ? '' : 'full-width'}`}>
                <div className="book-lending-header">
                    <div className='book-lending-toggle'>
                        <button className="toggle-aside-btn" onClick={toggleAside}>
                            {isAsideVisible ? <FaTimes /> : <FaBars />}
                        </button>
                        <h2 className='ListContent'>Quản lý mượn sách</h2>
                    </div>
                </div>

                {/* Tabs for switching between lists */}
                <div className="book-lending-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        Yêu cầu mượn sách
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'borrowed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('borrowed')}
                    >
                        Sách đã mượn
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'returned' ? 'active' : ''}`}
                        onClick={() => setActiveTab('returned')}
                    >
                        Sách đã trả
                    </button>
                </div>

                {/* Search bar */}
                <div className="book-lending-search">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm sách, tác giả hoặc người mượn..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                {/* Borrow Requests Table */}
                {activeTab === 'requests' && (
                    <div className="borrow-requests-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Tựa sách</th>
                                    <th>Tác giả</th>
                                    <th>Người yêu cầu</th>
                                    <th>Ngày yêu cầu</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.title}</td>
                                        <td>{item.author}</td>
                                        <td>{item.requester}</td>
                                        <td>{item.requestDate}</td>
                                        <td>
                                            <button onClick={() => openModal('approve', item)} className="approve-btn">
                                                <FaCheck /> Chấp nhận
                                            </button>
                                            <button onClick={() => openModal('reject', item)} className="reject-btn">
                                                <FaTimesCircle /> Từ chối
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Borrowed Books Table */}
                {activeTab === 'borrowed' && (
                    <div className="borrowed-books-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Tựa sách</th>
                                    <th>Tác giả</th>
                                    <th>Người mượn</th>
                                    <th>Ngày mượn</th>
                                    <th>Hạn trả</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((book) => (
                                    <tr key={book.id}>
                                        <td>{book.title}</td>
                                        <td>{book.author}</td>
                                        <td>{book.borrower}</td>
                                        <td>{book.borrowDate}</td>
                                        <td>{book.dueDate}</td>
                                        <td>
                                            <button onClick={() => openModal('return', book)} className="return-btn">
                                                <FaUndo /> Trả sách
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Returned Books Table */}
                {activeTab === 'returned' && (
                <div className="returned-books-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Tựa sách</th>
                                <th>Tác giả</th>
                                <th>Người mượn</th>
                                <th>Ngày mượn</th>
                                <th>Ngày trả</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((book) => (
                                <tr key={book.id}>
                                    <td>{book.title}</td>
                                    <td>{book.author}</td>
                                    <td>{book.borrower}</td>
                                    <td>{book.borrowDate}</td>
                                    <td>{book.returnDate}</td>
                                    <td>
                                        <button onClick={() => openDeleteModal(book)} className="delete-btn">
                                            <FaTrash /> Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
                {/* Pagination */}
                <div className="pagination">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        <FaChevronLeft />
                    </button>
                    <span>{currentPage} / {totalPages}</span>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        <FaChevronRight />
                    </button>
                </div>

                {/* Modals */}
                <BorrowModal
                    isOpen={modalOpen}
                    onClose={closeModal}
                    action={modalAction}
                    bookTitle={selectedBook?.title}
                    onConfirm={handleConfirmAction}
                />
                <ReturnModal
                    isOpen={returnModalOpen}
                    onClose={closeReturnModal}
                    book={selectedBook}
                    onConfirm={() => selectedBook && handleReturnBook(selectedBook)}
                />
                <DeleteModal
                    isOpen={deleteModalOpen}
                    onClose={closeDeleteModal}
                    book={bookToDelete}
                    onConfirm={handleDeleteBook}
                />
            </div>
        </div>
    );
}

export default BorrowList;