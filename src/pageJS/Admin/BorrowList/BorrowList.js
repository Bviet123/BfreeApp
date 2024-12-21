import React, { useState, useEffect, useCallback } from 'react';
import {
    FaBars, FaTimes, FaSearch, FaCheck, FaTimes as FaTimesCircle,
    FaUndo, FaChevronLeft, FaChevronRight, FaTrash, FaCalendar,
    FaUser, FaBook, FaInfoCircle, FaUndoAlt,
    FaSync
} from 'react-icons/fa';
import Aside from '../Aside/Aside.js';
import BorrowModal from './BorrowModal/BorrowModal.js';
import ReturnModal from './BorrowModal/ReturnModal.js';
import DeleteModal from './DeleteModal.js';
import { ref, onValue, push, remove, update, serverTimestamp, set, get } from 'firebase/database';
import { database } from '../../../firebaseConfig.js';
import '../../../pageCSS/Admin/BorowListCss/BorrowListCss.css';
import '../../../pageCSS/Admin/BorowListCss/FilterBarCss.css'
import DetailModal from './BorrowModal/DetailModal.js';
import PickupModal from './BorrowModal/PickUpModal.js';

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
            className={`tab-btn ${activeTab === 'awaiting' ? 'active' : ''}`}
            onClick={() => setActiveTab('awaiting')}
        >
            Chờ lấy sách
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
        switch (activeTab) {
            case 'requests':
                return (
                    <div className={`status-badge ${item.requestType === 'extend' ? 'extend' : 'borrow'}`}>
                        {item.requestType === 'extend' ? 'Gia hạn' : 'Mượn mới'}
                    </div>
                );
            case 'awaiting':
                return (
                    <div className="status-badge awaiting-pickup">
                        Chờ lấy sách
                    </div>
                );
            case 'borrowed':
                const isOverdue = new Date(item.dueDate) < new Date();
                return (
                    <div className={`status-badge ${isOverdue ? 'overdue' : 'borrowed'}`}>
                        {isOverdue ? 'Quá hạn' : 'Đang mượn'}
                    </div>
                );
            case 'returned':
                return (
                    <div className="status-badge returned">
                        Đã trả
                    </div>
                );
            default:
                return null;
        }
    };

    const renderRequestInfo = () => {
        if (activeTab === 'requests' || activeTab === 'awaiting') {
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

    const renderActions = () => {
        switch (activeTab) {
            case 'requests':
                return (
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
                );
            case 'awaiting':
                return (
                    <button
                        onClick={() => openModal('pickup', item)}
                        className="action-btn pickup-btn"
                        title="Xác nhận lấy sách"
                    >
                        <FaCheck /> Lấy sách
                    </button>
                );
            case 'borrowed':
                return (
                    <button
                        onClick={() => openModal('return', item)}
                        className="action-btn return-btn"
                        title="Trả sách"
                    >
                        <FaUndoAlt /> Trả sách
                    </button>
                );
            case 'returned':
                return (
                    <button
                        onClick={() => openDeleteModal(item)}
                        className="action-btn delete-btn"
                        title="Xóa khỏi lịch sử"
                    >
                        <FaTrash /> Xóa
                    </button>
                );
            default:
                return null;
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
                {renderActions()}
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
    const [pickupModalOpen, setPickupModalOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);
    const itemsPerPage = 6;
    const [selectedStatus, setSelectedStatus] = useState('all');

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

        try {
            if (request.requestType === 'extend') {
                // Xử lý yêu cầu gia hạn
                const borrowedBookRef = ref(database, `borrowedBooks/${request.currentBorrowId}`);

                const snapshot = await get(borrowedBookRef);
                if (!snapshot.exists()) {
                    throw new Error('Không tìm thấy thông tin sách đang mượn');
                }

                const currentBorrowData = snapshot.val();
                const currentDueDate = new Date(currentBorrowData.dueDate);
                const newDueDate = new Date(currentDueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
                const newBorrowCount = (parseInt(currentBorrowData.borrowCount || "0") + 1).toString();

                // Cập nhật thông tin gia hạn
                await update(borrowedBookRef, {
                    dueDate: newDueDate.toISOString().split('T')[0],
                    borrowCount: newBorrowCount
                });

                // Tạo thông báo gia hạn
                await push(ref(database, 'notifications'), {
                    type: 'extend_approve',
                    bookTitle: request.title,
                    requesterId: request.requesterId,
                    message: `Yêu cầu gia hạn sách "${request.title}" đã được chấp nhận. Hạn mới: ${newDueDate.toLocaleDateString('vi-VN')}`,
                    timestamp: serverTimestamp(),
                    isRead: false
                });

                // Xóa yêu cầu gia hạn
                await remove(ref(database, `borrowRequests/${id}`));

            } else {
                // Xử lý yêu cầu mượn mới
                // Kiểm tra và cập nhật số lượng sách
                const bookRef = ref(database, `books/${request.bookId}/availability`);
                const bookSnapshot = await get(bookRef);

                if (!bookSnapshot.exists()) {
                    throw new Error('Không tìm thấy thông tin sách');
                }

                const currentQuantity = bookSnapshot.val().copiesAvailable;

                if (currentQuantity <= 0) {
                    throw new Error('Sách đã hết');
                }

                // Cập nhật số lượng sách
                await update(bookRef, {
                    copiesAvailable: currentQuantity - 1,
                    status: currentQuantity - 1 === 0 ? 'unavailable' : 'available'
                });

                // Cập nhật trạng thái sang chờ lấy sách
                await update(ref(database, `borrowRequests/${id}`), {
                    status: 'awaiting_pickup'
                });

                // Tạo thông báo mượn sách
                await push(ref(database, 'notifications'), {
                    type: 'borrow_approve',
                    bookTitle: request.title,
                    requesterId: request.requesterId,
                    message: `Yêu cầu mượn sách "${request.title}" đã được chấp nhận. Sách đang chờ bạn đến lấy.`,
                    timestamp: serverTimestamp(),
                    isRead: false
                });
            }
        } catch (error) {
            console.error('Error processing request:', error);
            throw new Error('Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại.');
        }
    };
    // Thêm hàm mới để xác nhận lấy sách
    const handlePickupBook = async (id) => {
        const request = borrowRequests.find(req => req.id === id);

        try {
            const borrowData = {
                bookId: request.bookId,
                title: request.title,
                author: request.author,
                requesterId: request.requesterId,
                borrowDate: new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'active',
                borrowCount: "0",
                coverUrl: request.coverUrl
            };

            // Thêm vào bảng sách đang mượn
            const newBorrowRef = await push(ref(database, 'borrowedBooks'), borrowData);

            // Xóa khỏi yêu cầu mượn
            await remove(ref(database, `borrowRequests/${id}`));

            // Thông báo
            await push(ref(database, 'notifications'), {
                type: 'book_pickup',
                bookTitle: request.title,
                requesterId: request.requesterId,
                message: `Bạn đã lấy sách "${request.title}" thành công.`,
                timestamp: serverTimestamp(),
                isRead: false
            });
        } catch (error) {
            console.error('Error picking up book:', error);
            throw new Error('Có lỗi xảy ra khi xác nhận lấy sách. Vui lòng thử lại.');
        }
    };

    const handleReturnBook = async (bookData) => {
        const returnData = {
            bookId: bookData.bookId,
            title: bookData.title,
            requesterId: bookData.requesterId,
            borrowDate: bookData.borrowDate,
            returnDate: new Date().toISOString().split('T')[0],
            borrowCount: bookData.borrowCount || 0,
            bookStatus: bookData.bookStatus,
            notes: bookData.notes
        };

        try {
            // Cập nhật số lượng sách
            const bookRef = ref(database, `books/${bookData.bookId}/availability`);
            const bookSnapshot = await get(bookRef);

            if (!bookSnapshot.exists()) {
                throw new Error('Không tìm thấy thông tin sách');
            }

            const currentQuantity = bookSnapshot.val().copiesAvailable;

            // Cập nhật số lượng và trạng thái sách
            await update(bookRef, {
                copiesAvailable: currentQuantity + 1,
                status: 'available'
            });

            // Thực hiện các thao tác trả sách
            await Promise.all([
                // Thêm vào lịch sử sách đã trả
                push(ref(database, 'returnedBooks'), returnData),

                // Tạo thông báo
                push(ref(database, 'notifications'), {
                    type: 'return',
                    bookTitle: bookData.title,
                    requesterId: bookData.requesterId,
                    message: `Sách "${bookData.title}" đã được trả lại thành công`,
                    timestamp: serverTimestamp(),
                    isRead: false
                }),

                // Xóa khỏi danh sách sách đang mượn
                remove(ref(database, `borrowedBooks/${bookData.id}`))
            ]);
        } catch (error) {
            console.error('Error returning book:', error);
            throw new Error('Có lỗi xảy ra khi trả sách. Vui lòng thử lại.');
        }
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

    const getFilteredItems = () => {
        switch (activeTab) {
            case 'requests':
                return borrowRequests.filter(item => !item.status || item.status !== 'awaiting_pickup');
            case 'awaiting':
                return borrowRequests.filter(item => item.status === 'awaiting_pickup');
            case 'borrowed':
                return borrowedBooks;
            case 'returned':
                return returnedBooks;
            default:
                return [];
        }
    };

    // Modal handling functions
    const openModal = (action, book) => {
        setSelectedBook(book);
        if (action === 'return') {
            setReturnModalOpen(true);
        } else if (action === 'pickup') {
            setPickupModalOpen(true);
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

    const openPickupModal = (book) => {
        setSelectedBook(book);
        setPickupModalOpen(true);
    };

    const closePickupModal = () => {
        setSelectedBook(null);
        setPickupModalOpen(false);
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
    const filteredItems = getFilteredItems().filter(item => {
        const userInfo = getUserInfo(item.requesterId) || { fullName: '', email: '' };
        const searchLower = searchTerm.toLowerCase();

        return (
            item.title?.toLowerCase().includes(searchLower) ||
            item.author?.toLowerCase().includes(searchLower) ||
            userInfo.fullName.toLowerCase().includes(searchLower) ||
            userInfo.email.toLowerCase().includes(searchLower)
        );
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
                <div className="book-lending-controls">
                    <div className="book-lending-search">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sách, tác giả hoặc người mượn..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
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
                    onConfirm={(returnData) => selectedBook && handleReturnBook(returnData)}
                />
                <DeleteModal
                    isOpen={deleteModalOpen}
                    onClose={closeDeleteModal}
                    book={bookToDelete}
                    onConfirm={handleDeleteBook}
                />
                <PickupModal
                    isOpen={pickupModalOpen}
                    onClose={closePickupModal}
                    bookTitle={selectedBook?.title}
                    onConfirm={async () => {
                        try {
                            if (selectedBook) {
                                await handlePickupBook(selectedBook.id);
                                closePickupModal();
                            }
                        } catch (error) {
                            console.error("Error:", error);
                        }
                    }}
                />
            </div>
        </div>
    );
}

export default BorrowList;