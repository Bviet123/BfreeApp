import React, { useState, useEffect } from 'react';
import {
  Calendar, Book, Clock, AlertTriangle,
  Users, BookOpen, RotateCcw, TrendingUp,
  Menu, X, Bell, TrendingDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { ref, onValue, push, set, get } from 'firebase/database';
import { database } from '../../../firebaseConfig.js';
import Aside from '../Aside/Aside.js';
import '../../../pageCSS/Admin/StatisticsCss/StatisticsCss.css';

const Statistics = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [users, setUsers] = useState({});
  const [isAsideVisible, setIsAsideVisible] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  
  // Pagination states for popular books
  const [currentPopularPage, setCurrentPopularPage] = useState(1);
  const popularItemsPerPage = 9;
  
  // Pagination states for overdue books
  const [currentOverduePage, setCurrentOverduePage] = useState(1);
  const overdueItemsPerPage = 5;

  useEffect(() => {
    const loadData = async () => {
      try {
        const borrowedBooksRef = ref(database, 'borrowedBooks');
        const returnedBooksRef = ref(database, 'returnedBooks');
        const borrowRequestsRef = ref(database, 'borrowRequests');
        const usersRef = ref(database, 'users');
        const booksRef = ref(database, 'books');

        onValue(borrowedBooksRef, (snapshot) => {
          const data = snapshot.val();
          setBorrowedBooks(data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : []);
        });

        onValue(returnedBooksRef, (snapshot) => {
          const data = snapshot.val();
          setReturnedBooks(data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : []);
        });

        onValue(borrowRequestsRef, (snapshot) => {
          const data = snapshot.val();
          setBorrowRequests(data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : []);
        });

        onValue(usersRef, (snapshot) => {
          const data = snapshot.val();
          setUsers(data || {});
        });

        onValue(booksRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const booksArray = Object.entries(data).map(([key, value]) => ({
              id: key,
              ...value,
              popularity: (value.readCount * 0.7 || 0) + (value.borrowCount * 1.0 || 0)
            }));

            setBooks(booksArray);

            const sortedBooks = [...booksArray].sort((a, b) => b.popularity - a.popularity);
            setPopularBooks(sortedBooks);
          }
        });

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const overdueBooks = borrowedBooks.filter(book => {
    const dueDate = new Date(book.dueDate);
    return dueDate < new Date();
  });

  const totalActiveLoans = borrowedBooks.length;
  const totalRequests = borrowRequests.filter(req => !req.status || req.status !== 'awaiting_pickup').length;
  const awaitingPickup = borrowRequests.filter(req => req.status === 'awaiting_pickup').length;
  const totalReturned = returnedBooks.length;

  // Pagination calculations for popular books
  const totalPopularPages = Math.ceil(popularBooks.length / popularItemsPerPage);
  const indexOfLastPopularBook = currentPopularPage * popularItemsPerPage;
  const indexOfFirstPopularBook = indexOfLastPopularBook - popularItemsPerPage;
  const currentPopularBooks = popularBooks.slice(indexOfFirstPopularBook, indexOfLastPopularBook);

  // Pagination calculations for overdue books
  const totalOverduePages = Math.ceil(overdueBooks.length / overdueItemsPerPage);
  const indexOfLastOverdueBook = currentOverduePage * overdueItemsPerPage;
  const indexOfFirstOverdueBook = indexOfLastOverdueBook - overdueItemsPerPage;
  const currentOverdueBooks = overdueBooks.slice(indexOfFirstOverdueBook, indexOfLastOverdueBook);

  const sendOverdueNotification = async (userId, bookTitle, daysOverdue) => {
    try {
      const notificationsRef = ref(database, 'notifications');
      const newNotification = {
        bookTitle,
        message: `Sách "${bookTitle}" của bạn đã quá hạn ${daysOverdue} ngày. Vui lòng trả sách sớm để tránh bị phạt.`,
        requesterId: userId,
        timestamp: Date.now(),
        type: 'overdue_warning',
        isRead: false
      };

      await push(notificationsRef, newNotification);
      alert(`Đã gửi thông báo cảnh báo đến người dùng về sách quá hạn: ${bookTitle}`);
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Không thể gửi thông báo. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="statistics-container">
      {isAsideVisible && <Aside currentUser={currentUser} />}

      <main className={`statistics-main ${isAsideVisible ? 'with-aside' : 'without-aside'}`}>
        <div className="statistics-header">
          <button className="toggle-btn" onClick={() => setIsAsideVisible(!isAsideVisible)}>
            {isAsideVisible ? <X className="icon" /> : <Menu className="icon" />}
          </button>
          <h1 className="header-title">Thống Kê Thư Viện</h1>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="statistics-content">
            {/* Main Statistics */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-content">
                  <Book className="stat-icon blue" />
                  <div className="stat-info">
                    <p className="stat-label">Đang mượn</p>
                    <h3 className="stat-value">{totalActiveLoans}</h3>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <BookOpen className="stat-icon yellow" />
                  <div className="stat-info">
                    <p className="stat-label">Yêu cầu mới</p>
                    <h3 className="stat-value">{totalRequests}</h3>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <Clock className="stat-icon green" />
                  <div className="stat-info">
                    <p className="stat-label">Chờ lấy sách</p>
                    <h3 className="stat-value">{awaitingPickup}</h3>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <RotateCcw className="stat-icon purple" />
                  <div className="stat-info">
                    <p className="stat-label">Đã trả</p>
                    <h3 className="stat-value">{totalReturned}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Simplified Statistics */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-content">
                  <AlertTriangle className="stat-icon red" />
                  <div className="stat-info">
                    <p className="stat-label">Sách quá hạn</p>
                    <h3 className="stat-value">{overdueBooks.length}</h3>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <Users className="stat-icon cyan" />
                  <div className="stat-info">
                    <p className="stat-label">Tổng độc giả</p>
                    <h3 className="stat-value">{Object.keys(users).length}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Books Section */}
            <div className="popular-books-section">
              <div className="section-header">
                <h2 className="section-title">Sách Phổ Biến Nhất</h2>
                <TrendingUp className="section-icon" />
              </div>
              <div className="popular-books-grid">
                {currentPopularBooks.map((book, index) => (
                  <div key={book.id} className="popular-book-card">
                    <div className="book-rank">#{(currentPopularPage - 1) * popularItemsPerPage + index + 1}</div>
                    <img src={book.coverUrl} alt={book.title} className="book-cover" />
                    <div className="book-details">
                      <h3 className="book-title">{book.title}</h3>
                      <div className="Sta-book-stats">
                        <div className="stat">
                          <BookOpen className="stat-icon" />
                          <span>{book.readCount || 0} đọc</span>
                        </div>
                        <div className="stat">
                          <Book className="stat-icon" />
                          <span>{book.borrowCount || 0} mượn</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pagination">
                <button
                  onClick={() => setCurrentPopularPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPopularPage === 1}
                  className={currentPopularPage === 1 ? 'disabled' : ''}
                >
                  <ChevronLeft size={18} />
                </button>
                <span>{currentPopularPage} / {totalPopularPages}</span>
                <button
                  onClick={() => setCurrentPopularPage(prev => Math.min(prev + 1, totalPopularPages))}
                  disabled={currentPopularPage === totalPopularPages}
                  className={currentPopularPage === totalPopularPages ? 'disabled' : ''}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Overdue Books Table */}
            {overdueBooks.length > 0 && (
              <div className="overdue-table">
                <div className="table-header">
                  <h2 className="table-title">Chi Tiết Sách Quá Hạn</h2>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Tên Sách</th>
                        <th>Người Mượn</th>
                        <th>Ngày Đến Hạn</th>
                        <th>Số Ngày Quá Hạn</th>
                        <th>Số Lần Gia Hạn</th>
                        <th>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOverdueBooks.map((book) => {
                        const userInfo = users[book.requesterId] || { fullName: 'Unknown User' };
                        const dueDate = new Date(book.dueDate);
                        const today = new Date();
                        const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

                        return (
                          <tr key={book.id}>
                            <td>{book.title}</td>
                            <td>{userInfo.fullName}</td>
                            <td>{new Date(book.dueDate).toLocaleDateString('vi-VN')}</td>
                            <td>{daysOverdue}</td>
                            <td>{book.borrowCount || 0}</td>
                            <td>
                              <button
                                className="notification-btn"
                                onClick={() => sendOverdueNotification(book.requesterId, book.title, daysOverdue)}
                              >
                                <Bell className="icon" /> Gửi thông báo
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="pagination">
                  <button
                    onClick={() => setCurrentOverduePage(prev => Math.max(prev - 1, 1))}
                    disabled={currentOverduePage === 1}
                    className={currentOverduePage === 1 ? 'disabled' : ''}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span>{currentOverduePage} / {totalOverduePages}</span>
                  <button
                    onClick={() => setCurrentOverduePage(prev => Math.min(prev + 1, totalOverduePages))}
                    disabled={currentOverduePage === totalOverduePages}
                    className={currentOverduePage === totalOverduePages ? 'disabled' : ''}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Statistics;