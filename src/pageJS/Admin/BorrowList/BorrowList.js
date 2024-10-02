import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaSearch, FaCheck, FaTimes as FaTimesCircle, FaUndo, FaChevronLeft, FaChevronRight, FaTrash } from 'react-icons/fa';
import Aside from '../Aside/Aside.js';
import '../../../pageCSS/Admin/BorowListCss/BorrowListCss.css';
import BorrowModal from './BorrowModal/BorrowModal.js';
import ReturnModal from './BorrowModal/ReturnModal.js';
import DeleteModal from './DeleteModal.js';
import { ref, onValue, push, remove, update } from 'firebase/database';
import { database } from '../../../firebaseConfig.js';

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

// Table Component
const Table = ({ items, activeTab, openModal, openDeleteModal }) => (
    <div className={`${activeTab}-table`}>
        <table>
            <thead>
                <tr>
                    <th>Tựa sách</th>
                    <th>Tác giả</th>
                    {activeTab === 'requests' && <th>Người yêu cầu</th>}
                    {activeTab !== 'requests' && <th>Người mượn</th>}
                    {activeTab === 'requests' && <th>Ngày yêu cầu</th>}
                    {activeTab === 'borrowed' && <th>Ngày mượn</th>}
                    {activeTab === 'borrowed' && <th>Hạn trả</th>}
                    {activeTab === 'returned' && <th>Ngày mượn</th>}
                    {activeTab === 'returned' && <th>Ngày trả</th>}
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item) => (
                    <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.author}</td>
                        <td>{activeTab === 'requests' ? item.requester : item.borrower}</td>
                        {activeTab === 'requests' && <td>{item.requestDate}</td>}
                        {activeTab === 'borrowed' && <td>{item.borrowDate}</td>}
                        {activeTab === 'borrowed' && <td>{item.dueDate}</td>}
                        {activeTab === 'returned' && <td>{item.borrowDate}</td>}
                        {activeTab === 'returned' && <td>{item.returnDate}</td>}
                        <td>
                            {activeTab === 'requests' && (
                                <>
                                    <button onClick={() => openModal('approve', item)} className="approve-btn">
                                        <FaCheck /> Chấp nhận
                                    </button>
                                    <button onClick={() => openModal('reject', item)} className="reject-btn">
                                        <FaTimesCircle /> Từ chối
                                    </button>
                                </>
                            )}
                            {activeTab === 'borrowed' && (
                                <button onClick={() => openModal('return', item)} className="return-btn">
                                    <FaUndo /> Trả sách
                                </button>
                            )}
                            {activeTab === 'returned' && (
                                <button onClick={() => openDeleteModal(item)} className="delete-btn">
                                    <FaTrash /> Xóa
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
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

// Main BorrowList Component
function BorrowList() {
    const [borrowRequests, setBorrowRequests] = useState([]);
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [returnedBooks, setReturnedBooks] = useState([]);

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

    const handleReturnBook = (book) => {
        if (book && book.id) {
            const returnedBook = {
                ...book,
                returnDate: new Date().toISOString().split('T')[0],
            };
            push(ref(database, 'returnedBooks'), returnedBook);
            remove(ref(database, `borrowedBooks/${book.id}`));
            closeReturnModal();
        } else {
            console.error('Invalid book object passed to handleReturnBook');
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
        } else {
            console.error('Invalid book object passed to handleDeleteBook');
        }
    };

    // Filter logic
    const filteredItems = (activeTab === 'requests' ? borrowRequests : 
                           activeTab === 'borrowed' ? borrowedBooks : 
                           returnedBooks).filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.requester || item.borrower).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
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
                <Table 
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