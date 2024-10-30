import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDatabase, ref, update, get, onValue, push } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import {
  FaHandHoldingHeart, FaInfoCircle, FaBook, FaCalendarAlt,
  FaSearch, FaRedo, FaExclamationCircle, FaEdit
} from 'react-icons/fa';
import UserAside from '../UserAside/UserAside';
import '../../../pageCSS/User/UserProfileCss/BorrowedBookListCss.css';

const BorrowedBooksList = () => {
  const location = useLocation();
  const userFromState = location.state?.user;
  const navigate = useNavigate();
  
  // State declarations
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [showRenewalConfirm, setShowRenewalConfirm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth();
      let currentUser = userFromState || auth.currentUser;

      if (!currentUser) {
        setError("Vui lòng đăng nhập để xem thông tin");
        setLoading(false);
        navigate('/login');
        return;
      }

      const database = getDatabase();
      const userRef = ref(database, `users/${currentUser.uid}`);
      const borrowedBooksRef = ref(database, 'borrowedBooks');

      try {
        const userSnapshot = await get(userRef);
        if (!userSnapshot.exists()) {
          setError("Không tìm thấy dữ liệu người dùng");
          setLoading(false);
          return;
        }

        const userData = userSnapshot.val();
        
        const unsubscribeUser = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUser(prevUser => ({
              ...currentUser,
              ...data,
            }));
          }
        });

        const unsubscribeBorrowedBooks = onValue(borrowedBooksRef, (snapshot) => {
          try {
            const data = snapshot.val();
            if (data) {
              const userBooks = Object.entries(data)
                .map(([id, book]) => ({
                  id,
                  ...book
                }))
                .filter(book => book.requesterId === currentUser.uid);
              
              setBorrowedBooks(userBooks);
              
              setUser(prevUser => ({
                ...prevUser,
                borrowedBooks: userBooks
              }));
            } else {
              setBorrowedBooks([]);
            }
          } catch (err) {
            console.error('Error processing borrowed books:', err);
            setError('Có lỗi xảy ra khi tải dữ liệu sách. Vui lòng thử lại sau.');
          }
        });

        return () => {
          unsubscribeUser();
          unsubscribeBorrowedBooks();
        };
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Lỗi khi tải dữ liệu: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userFromState, navigate]);

  // Existing helper functions
  const calculateDaysRemaining = (borrowDate, dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  };

  const getBookStatus = (borrowDate, dueDate) => {
    const daysRemaining = calculateDaysRemaining(borrowDate, dueDate);
    if (daysRemaining < 0) {
      return { status: 'overdue', className: 'bb-status-overdue', text: 'Quá hạn' };
    } else if (daysRemaining <= 3) {
      return { status: 'nearDue', className: 'bb-status-near-due', text: 'Sắp đến hạn' };
    }
    return { status: 'normal', className: 'bb-status-normal', text: 'Đang mượn' };
  };

  const filteredAndSortedBooks = useMemo(() => {
    return borrowedBooks
      .filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase());
        const bookStatus = getBookStatus(book.borrowDate, book.dueDate).status;
        return statusFilter === 'all' || bookStatus === statusFilter ? matchesSearch : false;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return a.title.localeCompare(b.title);
      });
  }, [borrowedBooks, searchTerm, statusFilter, sortBy]);

  const handleRenewBook = async (bookId) => {
    setLoading(true);
    setError(null);

    try {
      const db = getDatabase();
      const requestsRef = ref(db, 'requests');
      
      // Create renewal request
      const renewalRequest = {
        bookId: selectedBook.id,
        title: selectedBook.title,
        author: selectedBook.author,
        requester: user.displayName || user.email,
        requesterId: user.uid,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        coverUrl: selectedBook.coverUrl,
        requestType: 'renewal',
        currentDueDate: selectedBook.dueDate,
        renewalCount: selectedBook.renewalCount || 0
      };

      // Push the renewal request to the database
      await push(requestsRef, renewalRequest);

      // Show success message
      alert('Yêu cầu gia hạn đã được gửi. Vui lòng đợi quản trị viên phê duyệt.');

      setShowRenewalConfirm(false);
      setSelectedBook(null);
    } catch (error) {
      console.error("Error sending renewal request:", error);
      setError("Có lỗi xảy ra khi gửi yêu cầu gia hạn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/home')} className="return-home-button">
          Trở về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <UserAside activeItem="BorrowedBooks" user={user} />
      <main className="user-profile">
        <h1>Sách đang mượn</h1>
        <button className="edit-button" onClick={() => navigate('/search-books')}>
          <FaEdit /> Mượn thêm sách            
        </button>

        <div className="profile-content">
          <section className="borrowed-books">
            <h3>
              <FaHandHoldingHeart /> Danh sách sách đang mượn
              <span className="bb-count">Số sách: {filteredAndSortedBooks.length}</span>
            </h3>

            {error && (
              <div className="bb-error">
                <FaExclamationCircle /> {error}
              </div>
            )}

            {loading ? (
              <div className="bb-loading">Đang tải...</div>
            ) : filteredAndSortedBooks.length > 0 ? (
              <>
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
                      <option value="dueDate">Sắp xếp theo ngày hạn</option>
                      <option value="title">Sắp xếp theo tên sách</option>
                    </select>
                  </div>
                </div>

                <div className="bb-grid">
                  {filteredAndSortedBooks.map((book) => {
                    const { className, text } = getBookStatus(book.borrowDate, book.dueDate);
                    const daysRemaining = calculateDaysRemaining(book.borrowDate, book.dueDate);

                    return (
                      <div key={book.id} className={`bb-card ${className}`}>
                        <div className="bb-card-content">
                          <h4>{book.title}</h4>
                          <div className="bb-meta">
                            <span className="bb-due-date">
                              <FaCalendarAlt />
                              {daysRemaining > 0 ?
                                `Còn ${daysRemaining} ngày` :
                                `Quá hạn ${Math.abs(daysRemaining)} ngày`}
                            </span>
                            <span className={`bb-status ${className}`}>{text}</span>
                          </div>
                          {book.renewalCount > 0 && (
                            <div className="bb-renewal-count">
                              Đã gia hạn: {book.renewalCount} lần
                            </div>
                          )}
                        </div>

                        <div className="bb-actions">
                          <button
                            className="bb-btn bb-btn-renew"
                            onClick={() => {
                              setSelectedBook(book);
                              setShowRenewalConfirm(true);
                            }}
                            disabled={book.renewalCount >= 2 || daysRemaining < 0}
                          >
                            <FaRedo /> Gia hạn
                          </button>

                          <button
                            className="bb-btn bb-btn-details"
                            onClick={() => navigate(`/book/${book.id}`)}
                          >
                            <FaInfoCircle /> Chi tiết
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
            <p>Sau khi được duyệt, thời hạn mới sẽ là 7 ngày kể từ ngày duyệt.</p>
            <p className="bb-modal-note">Lưu ý: Mỗi cuốn sách chỉ được gia hạn tối đa 2 lần</p>
            <div className="bb-modal-actions">
              <button
                onClick={() => handleRenewBook(selectedBook.id)}
                disabled={loading}
                className="bb-btn-primary"
              >
                {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
              </button>
              <button
                onClick={() => {
                  setShowRenewalConfirm(false);
                  setSelectedBook(null);
                }}
                disabled={loading}
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