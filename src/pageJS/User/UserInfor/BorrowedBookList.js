import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, update, get } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  FaHandHoldingHeart, FaInfoCircle, FaBook, FaCalendarAlt,
  FaSearch, FaRedo, FaExclamationCircle, FaEdit
} from 'react-icons/fa';
import UserAside from '../UserAside/UserAside';
import '../../../pageCSS/User/UserProfileCss/BorrowedBookListCss.css';

const BorrowedBooksList = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [showRenewalConfirm, setShowRenewalConfirm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [borrowedBooks, setBorrowedBooks] = useState({});
  const [booksDetails, setBooksDetails] = useState({});

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Fetch additional user data from your database
        const db = getDatabase();
        const userRef = ref(db, `users/${currentUser.uid}`);
        get(userRef).then((snapshot) => {
          if (snapshot.exists()) {
            setUser({ ...currentUser, ...snapshot.val() });
          } else {
            setUser(currentUser);
          }
        }).catch((error) => {
          console.error("Error fetching user data:", error);
        });
      } else {
        navigate('/Home');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchBooksDetails = async () => {
      if (!user?.uid) return;

      setLoading(true);
      const db = getDatabase();
      const userBorrowedBooksRef = ref(db, `users/${user.uid}/borrowedBooks`);

      try {
        const snapshot = await get(userBorrowedBooksRef);
        const borrowedBooksData = snapshot.val() || {};

        const validBorrowedBooks = Object.entries(borrowedBooksData)
          .filter(([key, value]) => key !== 'default' && value === true)
          .reduce((acc, [key]) => {
            acc[key] = true;
            return acc;
          }, {});

        setBorrowedBooks(validBorrowedBooks);

        const booksRef = ref(db, 'books');
        const booksSnapshot = await get(booksRef);
        const booksData = booksSnapshot.val() || {};

        const relevantBooksDetails = Object.keys(validBorrowedBooks).reduce((acc, bookId) => {
          if (booksData[bookId]) {
            acc[bookId] = booksData[bookId];
          }
          return acc;
        }, {});

        setBooksDetails(relevantBooksDetails);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Có lỗi xảy ra khi tải dữ liệu sách. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      fetchBooksDetails();
    }
  }, [user?.uid]);

  const calculateDaysRemaining = (borrowDate) => {
    const today = new Date();
    const borrowed = new Date(borrowDate);
    const dueDate = new Date(borrowed);
    dueDate.setDate(dueDate.getDate() + 14);
    return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  };

  const getBookStatus = (borrowDate) => {
    const daysRemaining = calculateDaysRemaining(borrowDate);
    if (daysRemaining < 0) {
      return { status: 'overdue', className: 'bb-status-overdue', text: 'Quá hạn' };
    } else if (daysRemaining <= 3) {
      return { status: 'nearDue', className: 'bb-status-near-due', text: 'Sắp đến hạn' };
    }
    return { status: 'normal', className: 'bb-status-normal', text: 'Đang mượn' };
  };

  const filteredAndSortedBooks = useMemo(() => {
    return Object.entries(booksDetails)
      .filter(([bookId, book]) => {
        if (!borrowedBooks[bookId]) return false;
        const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase());
        const bookStatus = getBookStatus(book.borrowDate).status;
        return statusFilter === 'all' || bookStatus === statusFilter ? matchesSearch : false;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          return new Date(a[1].borrowDate) - new Date(b[1].borrowDate);
        }
        return a[1].title.localeCompare(b[1].title);
      });
  }, [booksDetails, borrowedBooks, searchTerm, statusFilter, sortBy]);

  const handleRenewBook = async (bookId) => {
    setLoading(true);
    setError(null);

    try {
      const db = getDatabase();
      const bookRef = ref(db, `books/${bookId}`);
      const newBorrowDate = new Date().toISOString();

      await update(bookRef, { borrowDate: newBorrowDate });

      setBooksDetails(prev => ({
        ...prev,
        [bookId]: { ...prev[bookId], borrowDate: newBorrowDate }
      }));

      setShowRenewalConfirm(false);
      setSelectedBook(null);
    } catch (error) {
      console.error("Error renewing book:", error);
      setError("Có lỗi xảy ra khi gia hạn sách. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

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
                  {filteredAndSortedBooks.map(([bookId, book]) => {
                    const { status, className, text } = getBookStatus(book.borrowDate);
                    const daysRemaining = calculateDaysRemaining(book.borrowDate);

                    return (
                      <div key={bookId} className={`bb-card ${className}`}>
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
                        </div>

                        <div className="bb-actions">
                          <button
                            className="bb-btn bb-btn-renew"
                            onClick={() => {
                              setSelectedBook({ id: bookId, ...book });
                              setShowRenewalConfirm(true);
                            }}
                            disabled={status === 'overdue'}
                          >
                            <FaRedo /> Gia hạn
                          </button>

                          <button
                            className="bb-btn bb-btn-details"
                            onClick={() => navigate(`/book/${bookId}`)}
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
            <h3>Xác nhận gia hạn sách</h3>
            <p>Bạn có chắc muốn gia hạn sách "{selectedBook.title}"?</p>
            <p>Thời hạn mới sẽ là 14 ngày kể từ hôm nay.</p>

            <div className="bb-modal-actions">
              <button
                onClick={() => handleRenewBook(selectedBook.id)}
                disabled={loading}
                className="bb-btn-primary"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận'}
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