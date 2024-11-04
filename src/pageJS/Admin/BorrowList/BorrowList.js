import React, { useState, useEffect, useCallback } from 'react';
import {
    FaBars, FaTimes, FaSearch, FaCheck, FaTimes as FaTimesCircle,
    FaUndo, FaChevronLeft, FaChevronRight, FaTrash, FaCalendar,
    FaUser, FaBook, FaInfoCircle, FaUndoAlt
} from 'react-icons/fa';
import Aside from '../Aside/Aside.js';
import BorrowModal from './BorrowModal/BorrowModal.js';
import ReturnModal from './BorrowModal/ReturnModal.js';
import DeleteModal from './DeleteModal.js';
import { ref, onValue, push, remove, update, serverTimestamp } from 'firebase/database';
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
const BookCard = ({ item, activeTab, openModal, openDeleteModal, onShowDetail, getUserInfo }) => {
    const userInfo = getUserInfo(item.requesterId);

    const getRequestTypeDisplay = (type) => {
        switch (type) {
            case 'borrow':
                return 'Mượn sách';
            case 'extend':
                return 'Gia hạn';
            default:
                return 'Không xác định';
        }
    };

    const getRequestTypeColor = (type) => {
        switch (type) {
            case 'borrow':
                return 'text-blue-600';
            case 'extend':
                return 'text-green-600';
            default:
                return 'text-gray-600';
        }
    };

    const renderStatus = () => {
        if (activeTab === 'requests') {
            return (
                <div className={`status-badge ${item.requestType === 'extend' ? 'extend' : 'borrow'}`}>
                    {item.requestType === 'extend' ? 'Gia hạn' : 'Mượn mới'}
                </div>
            );
        }

        if (activeTab === 'borrowed') {
            const isOverdue = new Date(item.dueDate) < new Date();
            return (
                <div className={`status-badge ${isOverdue ? 'overdue' : 'borrowed'}`}>
                    {isOverdue ? 'Quá hạn' : 'Đang mượn'}
                </div>
            );
        }

        if (activeTab === 'returned') {
            return (
                <div className="status-badge returned">
                    Đã trả
                </div>
            );
        }
    };

    const renderRequestInfo = () => {
        if (activeTab === 'requests') {
            const requestType = getRequestTypeDisplay(item.requestType);
            const typeColor = getRequestTypeColor(item.requestType);

            return (
                <>
                    <div className="book-info-row">
                        <FaUser className="info-icon" />
                        <span>Người yêu cầu: {userInfo.fullName}</span>
                    </div>
                    <div className="book-info-row">
                        <FaBook className="info-icon" />
                        <span className={typeColor}>Loại yêu cầu: {requestType}</span>
                    </div>
                    <div className="book-info-row">
                        <FaCalendar className="info-icon" />
                        <span>Ngày yêu cầu: {new Date(item.requestDate).toLocaleDateString('vi-VN')}</span>
                    </div>

                    {item.requestType === 'extend' && (
                        <div className="book-info-row text-gray-600">
                            <FaInfoCircle className="info-icon" />
                            <span>Sách đang mượn sẽ được gia hạn thêm 7 ngày</span>
                        </div>
                    )}
                </>
            );
        }

        if (activeTab === 'borrowed') {
            return (
                <>
                    <div className="book-info-row">
                        <FaUser className="info-icon" />
                        <span>Người mượn: {userInfo.fullName}</span>
                    </div>
                    <div className="book-info-row">
                        <FaCalendar className="info-icon" />
                        <span>Ngày mượn: {new Date(item.borrowDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="book-info-row">
                        <FaCalendar className="info-icon" />
                        <span>Hạn trả: {new Date(item.dueDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="book-info-row">
                        <FaInfoCircle className="info-icon" />
                        <span>Số lần gia hạn: {item.borrowCount || 0}</span>
                    </div>
                </>
            );
        }

        if (activeTab === 'returned') {
            return (
                <>
                    <div className="book-info-row">
                        <FaUser className="info-icon" />
                        <span>Người trả: {userInfo.fullName}</span>
                    </div>
                    <div className="book-info-row">
                        <FaCalendar className="info-icon" />
                        <span>Ngày mượn: {new Date(item.borrowDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="book-info-row">
                        <FaCalendar className="info-icon" />
                        <span>Ngày trả: {new Date(item.returnDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="book-info-row">
                        <FaInfoCircle className="info-icon" />
                        <span>Số lần đã gia hạn: {item.borrowCount || 0}</span>
                    </div>
                </>
            );
        }
    };

    return (
        <div className="bl-book-card">
            <div className="bl-book-card-header">
                <div className="bl-book-card-title">
                    <FaBook className="book-icon" />
                    <h3>{item.title}</h3>
                </div>
                {renderStatus()}
            </div>

            <div className="bl-book-card-content">
                {renderRequestInfo()}
            </div>

            <div className="bl-book-card-actions">
                <button
                    onClick={() => onShowDetail(item)}
                    className="action-btn detail-btn"
                    title="Xem chi tiết"
                >
                    <FaInfoCircle /> Chi tiết
                </button>

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
                        onClick={() => openModal('return', {
                            ...item,
                            requesterId: item.requesterId,
                            bookId: item.bookId,
                            title: item.title,
                            borrowDate: item.borrowDate,
                            borrowCount: item.borrowCount
                        })}
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
        </div>
    );
};

// Card Grid Component
const CardGrid = ({ items, activeTab, openModal, openDeleteModal, getUserInfo }) => {
    const [detailItem, setDetailItem] = useState(null);

    const handleShowDetail = (item) => {
        setDetailItem(item);
    };

    const handleCloseDetail = () => {
        setDetailItem(null);
    };

    return (
        <>
            <div className="book-card-grid">
                {items.map((item) => (
                    <MemoizedBookCard
                        key={item.id}
                        item={item}
                        activeTab={activeTab}
                        openModal={openModal}
                        openDeleteModal={openDeleteModal}
                        onShowDetail={handleShowDetail}
                        getUserInfo={getUserInfo}
                    />
                ))}
            </div>

            <DetailModal
                isOpen={Boolean(detailItem)}
                onClose={handleCloseDetail}
                data={detailItem}
                type={activeTab}
            />
        </>
    );
};

const MemoizedBookCard = React.memo(BookCard, (prevProps, nextProps) => {
    return (
        prevProps.item.id === nextProps.item.id &&
        prevProps.activeTab === nextProps.activeTab &&
        prevProps.getUserInfo === nextProps.getUserInfo
    );
});

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
    const [users, setUsers] = useState({});
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
    const itemsPerPage = 6;

    const getUserInfo = useCallback((userId) => {
        return users[userId] || { fullName: 'Unknown User', email: '' };
    }, [users]);

    useEffect(() => {
        const borrowRequestsRef = ref(database, 'borrowRequests');
        const borrowedBooksRef = ref(database, 'borrowedBooks');
        const returnedBooksRef = ref(database, 'returnedBooks');
        const usersRef = ref(database, 'users');

        onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const usersObject = {};
                Object.entries(data).forEach(([key, value]) => {
                    usersObject[key] = { fullName: value.fullName, email: value.email };
                });
                setUsers(usersObject);
            }
        });

        onValue(borrowRequestsRef, (snapshot) => {
            const data = snapshot.val();
            setBorrowRequests(data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : []);
        });

        onValue(borrowedBooksRef, (snapshot) => {
            const data = snapshot.val();
            setBorrowedBooks(data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : []);
        });

        onValue(returnedBooksRef, (snapshot) => {
            const data = snapshot.val();
            setReturnedBooks(data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : []);
        });
    }, []);

    const handleApproveRequest = async (id) => {
        const request = borrowRequests.find(req => req.id === id);
    
        if (request.requestType === 'extend') {
            // Tìm sách đang được mượn
            const borrowedBook = borrowedBooks.find(book =>
                book.bookId === request.bookId && book.requesterId === request.requesterId
            );
    
            if (borrowedBook) {
                // Tính ngày trả mới (thêm 7 ngày từ hạn trả hiện tại)
                const currentDueDate = new Date(borrowedBook.dueDate);
                const newDueDate = new Date(currentDueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    
                // Cập nhật thông tin sách đang mượn
                await update(ref(database, `borrowedBooks/${borrowedBook.id}`), {
                    dueDate: newDueDate.toISOString().split('T')[0],
                    borrowCount: (parseInt(borrowedBook.borrowCount || "0") + 1).toString()
                });
            }
        } else {
            // Nếu là yêu cầu mượn mới
            const borrowData = {
                ...request,
                borrowDate: new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'active',
                borrowCount: "0"
            };
            await push(ref(database, 'borrowedBooks'), borrowData);
        }
    
        // Thêm thông báo
        await push(ref(database, 'notifications'), {
            type: 'approve',
            bookTitle: request.title,
            requesterId: request.requesterId,
            message: request.requestType === 'extend'
                ? `Yêu cầu gia hạn sách "${request.title}" của bạn đã được chấp nhận`
                : `Yêu cầu mượn sách "${request.title}" của bạn đã được chấp nhận`,
            timestamp: serverTimestamp(),
            isRead: false
        });
    
        // Xóa yêu cầu
        await remove(ref(database, `borrowRequests/${id}`));
    };

    const handleReturnBook = async (book) => {
        const returnData = {
            bookId: book.bookId,
            title: book.title,
            requesterId: book.requesterId,
            borrowDate: book.borrowDate,
            returnDate: new Date().toISOString().split('T')[0],
            borrowCount: book.borrowCount || 0
        };

        await Promise.all([
            push(ref(database, 'returnedBooks'), returnData),
            push(ref(database, 'notifications'), {
                type: 'return',
                bookTitle: book.title,
                requesterId: book.requesterId,
                message: `Sách "${book.title}" đã được trả lại thành công`,
                timestamp: serverTimestamp(),
                isRead: false
            }),
            remove(ref(database, `borrowedBooks/${book.id}`))
        ]);

        setBorrowedBooks(prev => prev.filter(item => item.id !== book.id));
    };


    const handleRejectRequest = async (id, rejectReason) => {
        const request = borrowRequests.find(req => req.id === id);

        await push(ref(database, 'notifications'), {
            type: 'reject',
            bookTitle: request.title,
            requesterId: request.requesterId,
            message: `Yêu cầu mượn sách "${request.title}" của bạn đã bị từ chối${rejectReason ? `. Lý do: ${rejectReason}` : ''}`,
            timestamp: serverTimestamp(),
            isRead: false
        });

        await remove(ref(database, `borrowRequests/${id}`));
    };

    const handleDeleteBook = () => {
        if (bookToDelete?.id) {
            remove(ref(database, `returnedBooks/${bookToDelete.id}`));
            closeDeleteModal();
        }
    };

    // Modal handling functions
    const openModal = (action, book) => {
        setSelectedBook(book);
        if (action === 'return') {
            setReturnModalOpen(true);
        } else {
            setModalAction(action);
            setModalOpen(true);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalAction(null);
        setSelectedBook(null);
    };

    const closeReturnModal = () => {
        setReturnModalOpen(false);
        setSelectedBook(null);
    };

    const openDeleteModal = (book) => {
        setBookToDelete(book);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setBookToDelete(null);
    };

    const handleConfirmAction = (rejectReason) => {
        if (modalAction === 'approve') {
            handleApproveRequest(selectedBook.id);
        } else if (modalAction === 'reject') {
            handleRejectRequest(selectedBook.id, rejectReason);
        }
        closeModal();
    };

    // Filter and pagination logic
    const filteredItems = (activeTab === 'requests' ? borrowRequests :
        activeTab === 'borrowed' ? borrowedBooks : returnedBooks)
        .filter((item) => {
            if (!item) return false;

            const userInfo = getUserInfo(item.requesterId) || { fullName: '', email: '' };
            const title = item.title || '';
            const author = item.author || '';
            const searchTermLower = searchTerm.toLowerCase();

            return title.toLowerCase().includes(searchTermLower) ||
                author.toLowerCase().includes(searchTermLower) ||
                userInfo.fullName.toLowerCase().includes(searchTermLower) ||
                userInfo.email.toLowerCase().includes(searchTermLower);
        });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="book-lending-container">
            <Aside className={isAsideVisible ? 'visible' : 'hidden'} />
            <div className={`book-lending-main ${isAsideVisible ? '' : 'full-width'}`}>
                <Header isAsideVisible={isAsideVisible} toggleAside={() => setIsAsideVisible(!isAsideVisible)} />
                <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
                <Search searchTerm={searchTerm} handleSearch={(e) => setSearchTerm(e.target.value)} />
                <CardGrid
                    items={currentItems}
                    activeTab={activeTab}
                    openModal={openModal}
                    openDeleteModal={openDeleteModal}
                    getUserInfo={getUserInfo}
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