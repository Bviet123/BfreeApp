// BorrowedBooksList.js
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDatabase, ref, push, get, onValue } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import {
  FaHandHoldingHeart,
  FaInfoCircle,
  FaBook,
  FaCalendarAlt,
  FaSearch,
  FaRedo,
  FaExclamationCircle,
  FaEdit,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import UserAside from '../UserAside/UserAside';
import '../../../pageCSS/User/UserProfileCss/BorrowedBookListCss.css';

const BorrowedBooksList = () => {
  const location = useLocation();
  const userFromState = location.state?.user;
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('requestDate');
  const [showRenewalConfirm, setShowRenewalConfirm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth();
      const currentUser = userFromState || auth.currentUser;

      if (!currentUser) {
        navigate('/login');
        return;
      }

      const database = getDatabase();
      const userRef = ref(database, `users/${currentUser.uid}`);
      const borrowedBooksRef = ref(database, 'borrowedBooks');

      try {
        const userSnapshot = await get(userRef);
        if (userSnapshot.exists()) {
          setUser({ ...currentUser, ...userSnapshot.val() });
        }

        onValue(borrowedBooksRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const userBooks = Object.entries(data)
              .map(([id, book]) => ({ id, ...book }))
              .filter(book =>
                book.requesterId === currentUser.uid &&
                book.status === "active"
              );
            setBorrowedBooks(userBooks);
          } else {
            setBorrowedBooks([]);
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userFromState, navigate]);

  const calculateDaysRemaining = (dueDate) => {
    const today = new Date();
    const dueDateObj = new Date(dueDate);
    return Math.ceil((dueDateObj - today) / (1000 * 60 * 60 * 24));
  };

  const getBookStatus = (dueDate) => {
    const daysRemaining = calculateDaysRemaining(dueDate);
    if (daysRemaining < 0) {
      return { status: 'overdue', className: 'bb-status-overdue', text: 'Quá hạn' };
    }
    if (daysRemaining <= 3) {
      return { status: 'nearDue', className: 'bb-status-near-due', text: 'Sắp đến hạn' };
    }
    return { status: 'normal', className: 'bb-status-normal', text: 'Đang mượn' };
  };

  const filteredAndSortedBooks = useMemo(() => {
    return borrowedBooks
      .filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase());
        const bookStatus = getBookStatus(book.requestDate).status;
        return statusFilter === 'all' || bookStatus === statusFilter ? matchesSearch : false;
      })
      .sort((a, b) => {
        return sortBy === 'requestDate'
          ? new Date(b.requestDate) - new Date(a.requestDate)
          : a.title.localeCompare(b.title);
      });
  }, [borrowedBooks, searchTerm, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedBooks.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredAndSortedBooks.slice(indexOfFirstBook, indexOfLastBook);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleRenewBook = async () => {
    try {
      const db = getDatabase();
      const requestsRef = ref(db, 'borrowRequests');

      await push(requestsRef, {
        bookId: selectedBook.bookId,
        title: selectedBook.title,
        author: selectedBook.author,
        requesterId: user.uid,
        requestDate: new Date().toISOString().split('T')[0],
        borrowDate: selectedBook.borrowDate,
        status: 'pending',
        coverUrl: selectedBook.coverUrl,
        requestType: 'extend',
        borrowCount: selectedBook.borrowCount?.toString() || "0",
        currentBorrowId: selectedBook.id
      });

      alert('Yêu cầu gia hạn đã được gửi. Vui lòng đợi quản trị viên phê duyệt.');
      setShowRenewalConfirm(false);
      setSelectedBook(null);

    } catch (error) {
      alert('Có lỗi xảy ra khi gửi yêu cầu gia hạn. Vui lòng thử lại sau.');
    }
  };

  if (loading) {
    return (
      <div className="bs-loading-container">
        <div className="bs-loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <UserAside activeItem="BorrowedBooks" user={user} />
      <main className="user-profile">
        <h1>Sách đang mượn</h1>
        <button
          className="edit-button"
          onClick={() => navigate('/library', { state: { user } })}
        >
          <FaEdit /> Mượn thêm sách
        </button>

        <div className="profile-content">
          <section className="borrowed-books">
            <h3>
              <FaHandHoldingHeart /> Danh sách sách đang mượn
              <span className="bb-count">Số sách: {filteredAndSortedBooks.length}</span>
            </h3>

            <div className="bb-controls">
              <div className="bb-search">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Tìm kiếm sách..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="bb-filters">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="normal">Đang mượn</option>
                  <option value="nearDue">Sắp đến hạn</option>
                  <option value="overdue">Quá hạn</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="requestDate">Sắp xếp theo ngày mượn</option>
                  <option value="title">Sắp xếp theo tên sách</option>
                </select>
              </div>
            </div>

            {filteredAndSortedBooks.length > 0 ? (
              <>
                <div className="bb-grid">
                  {currentBooks.map((book) => {
                    const { className, text } = getBookStatus(book.requestDate);
                    const daysRemaining = calculateDaysRemaining(book.requestDate);

                    return (
                      <div key={book.id} className={`bb-card ${className}`}>
                        <div className="bb-card-content">
                          <h4>{book.title}</h4>
                          <div className="bb-meta">
                            <span className="bb-due-date">
                              <FaCalendarAlt />
                              {calculateDaysRemaining(book.dueDate) > 0
                                ? `Còn ${calculateDaysRemaining(book.dueDate)} ngày`
                                : `Quá hạn ${Math.abs(calculateDaysRemaining(book.dueDate))} ngày`}
                            </span>
                            <span className={`bb-status ${getBookStatus(book.dueDate).className}`}>
                              {getBookStatus(book.dueDate).text}
                            </span>
                          </div>
                          <div className="bb-renewal-count">
                            Đã gia hạn: {book.borrowCount} lần
                          </div>
                        </div>

                        <div className="bb-actions">
                          <button
                            className="bb-btn bb-btn-renew"
                            onClick={() => {
                              setSelectedBook(book);
                              setShowRenewalConfirm(true);
                            }}
                            disabled={book.borrowCount >= 2 || daysRemaining < 0}
                          >
                            <FaRedo /> Gia hạn
                          </button>

                          <button
                            className="bb-btn bb-btn-details"
                            onClick={() => navigate(`/book/${book.bookId}`)}
                          >
                            <FaInfoCircle /> Chi tiết
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
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
                )}
              </>
            ) : (
              <div className="bb-empty">
                <FaBook />
                <p>Bạn chưa mượn sách nào</p>
              </div>
            )}
          </section>
        </div>
      </main>

      {showRenewalConfirm && selectedBook && (
        <div className="bb-modal-overlay">
          <div className="bb-modal">
            <h3>Xác nhận gửi yêu cầu gia hạn sách</h3>
            <p>Bạn có chắc muốn gửi yêu cầu gia hạn sách "{selectedBook.title}"?</p>
            <div className="bb-modal-info">
              <p>Ngày mượn: {new Date(selectedBook.borrowDate).toLocaleDateString('vi-VN')}</p>
              <p>Hạn trả hiện tại: {new Date(selectedBook.dueDate).toLocaleDateString('vi-VN')}</p>
            </div>
            <p>Sau khi được duyệt, thời hạn mới sẽ là 7 ngày kể từ ngày duyệt.</p>
            <p className="bb-modal-note">Lưu ý: Mỗi cuốn sách chỉ được gia hạn tối đa 2 lần</p>
            <div className="bb-modal-actions">
              <button
                onClick={handleRenewBook}
                className="bb-btn-primary"
              >
                Gửi yêu cầu
              </button>
              <button
                onClick={() => {
                  setShowRenewalConfirm(false);
                  setSelectedBook(null);
                }}
                className="bb-btn-secondary"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowedBooksList;