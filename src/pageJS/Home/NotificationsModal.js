import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, onValue, query, orderByChild } from "firebase/database";
import { Bell } from 'lucide-react';
import '../../pageCSS/HomeCss/NotificationsModalCss.css';

const NotificationsModal = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!user?.uid) return;

    const db = getDatabase();
    const notificationsRef = query(
      ref(db, 'notifications'),
      orderByChild('userId'),
    );

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const notificationsData = [];
      snapshot.forEach((childSnapshot) => {
        const notification = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        };
        if (notification.userId === user.uid) {
          notificationsData.push(notification);
        }
      });

      const sortedNotifications = notificationsData.sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(sortedNotifications);
      setUnreadCount(sortedNotifications.filter(notif => !notif.isRead).length);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reject':
        return '❌';
      case 'accept':
        return '✅';
      default:
        return '📩';
    }
  };

  return (
    <div className="notifications-container" ref={modalRef}>
      <button
        className="notifications-button"
        onClick={() => setIsModalOpen(!isModalOpen)}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount}
          </span>
        )}
      </button>

      {isModalOpen && (
        <div className="notifications-modal">
          <div className="notifications-header">
            <h3>Thông báo</h3>
          </div>
          
          {isLoading ? (
            <div className="notifications-loading">
              Đang tải thông báo...
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  >
                    <div className="notification-content">
                      <span className="notification-icon">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="notification-text">
                        <p className="notification-message">{notification.message}</p>
                        <div className="notification-meta">
                          <span className="notification-time">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {notification.bookTitle && (
                            <span className="notification-book">
                              Sách: {notification.bookTitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="notifications-empty">
                  Không có thông báo nào
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsModal;