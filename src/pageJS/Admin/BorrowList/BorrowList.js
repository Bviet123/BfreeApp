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
const BookCard = ({ item, activeTab, openModal, openDeleteModal, onShowDetail }) => {
    const isOverdue = activeTab === 'borrowed' && new Date(item.dueDate) < new Date();

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

    // Xử lý hiển thị loại yêu cầu
    const getRequestTypeDisplay = (type) => {
        switch (type) {
            case 'borrow':
                return 'Mượn sách';
            case 'extend':
                return 'Gia hạn';
            default:
                return 'Mượn sách';
        }
    };

    // Xử lý màu sắc cho loại yêu cầu
    const getRequestTypeColor = (type) => {
        switch (type) {
            case 'borrow':
                return 'text-blue-600';
            case 'extend':
                return 'text-green-600';
            default:
                return 'text-blue-600';
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
                        <span>Người yêu cầu: {item.requester}</span>
                    </div>
                    <div className="book-info-row">
                        <FaBook className="info-icon" />
                        <span className={typeColor}>Loại yêu cầu: {requestType}</span>
                    </div>
                    <div className="book-info-row">
                        <FaCalendar className="info-icon" />
                        <span>Ngày yêu cầu: {new Date(item.requestDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="book-info-row">
                        <FaCalendar className="info-icon" />
                        <span>Thời gian mượn: 7 ngày</span>
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
                        <span>Người mượn: {item.borrower}</span>
                    </div>
                    <div className="book-info-row">
                        <FaCalendar className="info-icon" />
                        <span>Ngày mượn: {new Date(item.borrowDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="book-info-row">
                        <FaCalendar className="info-icon" />
                        <span>Hạn trả: {new Date(item.dueDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                </>
            );
        }

        if (activeTab === 'returned') {
            return (
                <>
                    <div className="book-info-row">
                        <FaUser className="info-icon" />
                        <span>Người trả: {item.borrower}</span>
                    </div>
                    <div className="book-info-row">
                        <FaCalendar className="info-icon" />
                        <span>Ngày mượn: {new Date(item.borrowDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="book-info-row">
                        <FaCalendar className="info-icon" />
                        <span>Ngày trả: {new Date(item.returnDate).toLocaleDateString('vi-VN')}</span>
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
        </div>
    );
};

// Card Grid Component
const CardGrid = ({ items, activeTab, openModal, openDeleteModal }) => {
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
        prevProps.activeTab === nextProps.activeTab
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

        // Giữ nguyên logic cho borrowRequests và returnedBooks
        onValue(borrowRequestsRef, (snapshot) => {
            const data = snapshot.val();
            const borrowRequestsList = data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : [];
            setBorrowRequests(borrowRequestsList);
        });

        // Tối ưu lại cấu trúc dữ liệu cho borrowedBooks
        onValue(borrowedBooksRef, (snapshot) => {
            const data = snapshot.val();
            const borrowedBooksList = data ? Object.entries(data).map(([key, value]) => ({
                id: key,
                bookId: value.bookId,
                title: value.title,
                borrower: value.borrower,
                borrowDate: value.borrowDate,
                dueDate: value.dueDate,
                status: value.status || 'active' // Thêm trạng thái mặc định
            })) : [];
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

    const createNotification = async (type, data) => {
        try {
            const notificationRef = ref(database, 'notifications');
            const notification = {
                type: type, // 'approve', 'reject'
                bookTitle: data.title,
                requester: data.requester,
                message: type === 'approve' 
                    ? `Yêu cầu mượn sách "${data.title}" của bạn đã được chấp nhận`
                    : `Yêu cầu mượn sách "${data.title}" của bạn đã bị từ chối${data.rejectReason ? `. Lý do: ${data.rejectReason}` : ''}`,
                timestamp: serverTimestamp(),
                isRead: false,
                userId: data.requesterId // ID của người yêu cầu
            };

            await push(notificationRef, notification);
        } catch (error) {
            console.error("Error creating notification:", error);
        }
    };

    const handleApproveRequest = async (id) => {
        const approvedRequest = borrowRequests.find(request => request.id === id);
        const today = new Date();
        let dueDate = new Date(today);
        dueDate.setDate(today.getDate() + 7);

        try {
            if (approvedRequest.requestType === 'extend') {
                const borrowedBook = borrowedBooks.find(book => 
                    book.bookId === approvedRequest.bookId && 
                    book.borrower === approvedRequest.requester
                );

                if (borrowedBook) {
                    const currentDueDate = new Date(borrowedBook.dueDate);
                    const newDueDate = new Date(currentDueDate);
                    newDueDate.setDate(currentDueDate.getDate() + 7);

                    await update(ref(database, `borrowedBooks/${borrowedBook.id}`), {
                        dueDate: newDueDate.toISOString().split('T')[0]
                    });

                    // Tạo thông báo cho gia hạn
                    await createNotification('approve', {
                        ...approvedRequest,
                        title: `${approvedRequest.title} (Gia hạn)`
                    });
                }
            } else {
                const newBorrowedBook = {
                    bookId: approvedRequest.bookId,
                    title: approvedRequest.title,
                    borrower: approvedRequest.requester,
                    borrowDate: today.toISOString().split('T')[0],
                    dueDate: dueDate.toISOString().split('T')[0],
                    status: 'active'
                };

                await push(ref(database, 'borrowedBooks'), newBorrowedBook);
                
                // Tạo thông báo cho mượn mới
                await createNotification('approve', approvedRequest);
            }

            // Xóa yêu cầu sau khi xử lý
            await remove(ref(database, `borrowRequests/${id}`));
        } catch (error) {
            console.error("Error handling approve request:", error);
        }
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

    const handleRejectRequest = async (id, rejectReason) => {
        try {
            const rejectedRequest = borrowRequests.find(request => request.id === id);
            
            // Tạo thông báo từ chối
            await createNotification('reject', {
                ...rejectedRequest,
                rejectReason: rejectReason
            });

            // Xóa yêu cầu
            await remove(ref(database, `borrowRequests/${id}`));
        } catch (error) {
            console.error("Error handling reject request:", error);
        }
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