import React, { useState, useEffect } from 'react';
import {
    FaBars, FaTimes, FaSearch, FaCheck, FaTimes as FaTimesCircle,
    FaUndo, FaChevronLeft, FaChevronRight, FaTrash, FaCalendar,
    FaUser, FaBook, FaInfoCircle, FaUndoAlt
} from 'react-icons/fa';
import Aside from '../Aside/Aside.js';
import BorrowModal from './BorrowModal/BorrowModal.js';
import ReturnModal from './BorrowModal/ReturnModal.js';
import DeleteModal from './DeleteModal.js';
import { ref, onValue, push, remove, update } from 'firebase/database';
import { database } from '../../../firebaseConfig.js';
import '../../../pageCSS/Admin/BorowListCss/BorrowListCss.css';
import DetailModal from './BorrowModal/DetailModal.js';

// Header Component
const Header = ({ isAsideVisible, toggleAside }) => (
    <div className="book-lending-header">
        <div className='book-lending-toggle'>
            <button className="toggle-aside-btn" onClick={toggleAside}>
                {isAsideVisible ? <FaTimes /> : <FaBars />}
            </button>
            <h2 className='ListContent'>Quản lý mượn sách</h2>
        </div>
    </div>
);

// Tabs Component
const Tabs = ({ activeTab, setActiveTab }) => (
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
);

// Search Component
const Search = ({ searchTerm, handleSearch }) => (
    <div className="book-lending-search">
        <FaSearch className="search-icon" />
        <input
            type="text"
            placeholder="Tìm kiếm sách, tác giả hoặc người mượn..."
            value={searchTerm}
            onChange={handleSearch}
        />
    </div>
);

// Book Card Component
const BookCard = ({ item, activeTab, openModal, openDeleteModal }) => {
    const [showDetail, setShowDetail] = useState(false);

    // Kiểm tra trạng thái quá hạn cho sách đang mượn
    const isOverdue = activeTab === 'borrowed' && new Date(item.dueDate) < new Date();

    // Hiển thị trạng thái sách
    const renderStatus = () => {
        if (activeTab === 'borrowed') {
            return (
                <div className={`book-status ${isOverdue ? 'overdue' : 'on-time'}`}>
                    {isOverdue ? 'Quá hạn' : 'Trong hạn'}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="book-card">
            {/* Header */}
            <div className="book-card-header">
                <div className="book-card-title">
                    <FaBook className="book-icon" />
                    <h3>{item.title}</h3>
                </div>
                {renderStatus()}
            </div>

            {/* Content */}
            <div className="book-card-content">
                {/* Thông tin người mượn */}
                <div className="book-info-row">
                    <FaUser className="info-icon" />
                    <span>{activeTab === 'requests' ? item.requester : item.borrower}</span>
                </div>

                {/* Thông tin ngày */}
                <div className="book-info-row">
                    <FaCalendar className="info-icon" />
                    {activeTab === 'requests' && (
                        <span>Yêu cầu: {new Date(item.requestDate).toLocaleDateString('vi-VN')}</span>
                    )}
                    {activeTab === 'borrowed' && (
                        <span>Hạn trả: {new Date(item.dueDate).toLocaleDateString('vi-VN')}</span>
                    )}
                    {activeTab === 'returned' && (
                        <span>Đã trả: {new Date(item.returnDate).toLocaleDateString('vi-VN')}</span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="book-card-actions">
                {/* Nút chi tiết - hiển thị ở tất cả các tab */}
                <button
                    onClick={() => setShowDetail(true)}
                    className="action-btn detail-btn"
                    title="Xem chi tiết"
                >
                    <FaInfoCircle /> Chi tiết
                </button>

                {/* Các nút điều khiển khác tùy theo tab */}
                {activeTab === 'requests' && (
                    <>
                        <button
                            onClick={() => openModal('approve', item)}
                            className="action-btn approve-btn"
                            title="Chấp nhận yêu cầu"
                        >
                            <FaCheck /> Chấp nhận
                        </button>
                        <button
                            onClick={() => openModal('reject', item)}
                            className="action-btn reject-btn"
                            title="Từ chối yêu cầu"
                        >
                            <FaTimes /> Từ chối
                        </button>
                    </>
                )}

                {activeTab === 'borrowed' && (
                    <button
                        onClick={() => openModal('return', item)}
                        className="action-btn return-btn"
                        title="Trả sách"
                    >
                        <FaUndoAlt /> Trả sách
                    </button>
                )}

                {activeTab === 'returned' && (
                    <button
                        onClick={() => openDeleteModal(item)}
                        className="action-btn delete-btn"
                        title="Xóa khỏi lịch sử"
                    >
                        <FaTrash /> Xóa
                    </button>
                )}
            </div>

            <DetailModal
                isOpen={showDetail}
                onClose={() => setShowDetail(false)}
                data={item}
                type={activeTab}
            />
        </div>
    );
};
// Card Grid Component
const CardGrid = ({ items, activeTab, openModal, openDeleteModal }) => (
    <div className="book-card-grid">
        {items.map((item) => (
            <BookCard
                key={item.id}
                item={item}
                activeTab={activeTab}
                openModal={openModal}
                openDeleteModal={openDeleteModal}
            />
        ))}
    </div>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, paginate }) => (
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
);

// Main Component
function BorrowList() {
    const [borrowRequests, setBorrowRequests] = useState([]);
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [returnedBooks, setReturnedBooks] = useState([]);
    const [activeTab, setActiveTab] = useState('requests');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAsideVisible, setIsAsideVisible] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);
    const itemsPerPage = 6; // Adjusted for card layout

    useEffect(() => {
        const borrowRequestsRef = ref(database, 'borrowRequests');
        const borrowedBooksRef = ref(database, 'borrowedBooks');
        const returnedBooksRef = ref(database, 'returnedBooks');

        onValue(borrowRequestsRef, (snapshot) => {
            const data = snapshot.val();
            const borrowRequestsList = data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : [];
            setBorrowRequests(borrowRequestsList);
        });

        onValue(borrowedBooksRef, (snapshot) => {
            const data = snapshot.val();
            const borrowedBooksList = data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : [];
            setBorrowedBooks(borrowedBooksList);
        });

        onValue(returnedBooksRef, (snapshot) => {
            const data = snapshot.val();
            const returnedBooksList = data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : [];
            setReturnedBooks(returnedBooksList);
        });
    }, []);

    const toggleAside = () => {
        setIsAsideVisible(!isAsideVisible);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleApproveRequest = (id) => {
        const approvedRequest = borrowRequests.find(request => request.id === id);
        const newBorrowedBook = {
            ...approvedRequest,
            borrower: approvedRequest.requester,
            borrowDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };

        push(ref(database, 'borrowedBooks'), newBorrowedBook);
        remove(ref(database, `borrowRequests/${id}`));
    };

    const openModal = (action, book) => {
        setSelectedBook(book);
        if (action === 'return') {
            setReturnModalOpen(true);
        } else {
            setModalAction(action);
            setModalOpen(true);
        }
    };

    const closeReturnModal = () => {
        setReturnModalOpen(false);
        setSelectedBook(null);
    };

    const handleReturnBook = async (book) => {
        if (book && book.id) {
            try {
                await remove(ref(database, `borrowedBooks/${book.id}`));

                const returnedBook = {
                    bookId: book.bookId,
                    title: book.title,
                    borrower: book.borrower,
                    borrowDate: book.borrowDate,
                    returnDate: new Date().toISOString().split('T')[0]
                };

                await push(ref(database, 'returnedBooks'), returnedBook);

                closeReturnModal();

                setBorrowedBooks(prev => prev.filter(item => item.id !== book.id));
            } catch (error) {
                console.error("Error returning book:", error);
            }
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalAction(null);
        setSelectedBook(null);
    };

    const handleConfirmAction = (rejectReason) => {
        if (modalAction === 'approve') {
            handleApproveRequest(selectedBook.id);
        } else if (modalAction === 'reject') {
            handleRejectRequest(selectedBook.id, rejectReason);
        }
        closeModal();
    };

    const handleRejectRequest = (id) => {
        remove(ref(database, `borrowRequests/${id}`));
    };

    const openDeleteModal = (book) => {
        setBookToDelete(book);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setBookToDelete(null);
    };

    const handleDeleteBook = () => {
        if (bookToDelete && bookToDelete.id) {
            remove(ref(database, `returnedBooks/${bookToDelete.id}`));
            closeDeleteModal();
        }
    };

    // Filter items
    const filteredItems = (activeTab === 'requests' ? borrowRequests :
        activeTab === 'borrowed' ? borrowedBooks :
            returnedBooks).filter((item) =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.requester || item.borrower).toLowerCase().includes(searchTerm.toLowerCase())
            );

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="book-lending-container">
            <Aside className={isAsideVisible ? 'visible' : 'hidden'} />
            <div className={`book-lending-main ${isAsideVisible ? '' : 'full-width'}`}>
                <Header isAsideVisible={isAsideVisible} toggleAside={toggleAside} />
                <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
                <Search searchTerm={searchTerm} handleSearch={handleSearch} />
                <CardGrid
                    items={currentItems}
                    activeTab={activeTab}
                    openModal={openModal}
                    openDeleteModal={openDeleteModal}
                />
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    paginate={paginate}
                />
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