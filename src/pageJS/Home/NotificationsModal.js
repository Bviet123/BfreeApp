import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, onValue, query, orderByChild, update, remove } from "firebase/database";
import { Bell, Trash2, X } from 'lucide-react';
import '../../pageCSS/HomeCss/NotificationsModalCss.css';

const NotificationsModal = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const modalRef = useRef(null);
  const deleteModalRef = useRef(null);

  useEffect(() => {
    if (!user?.uid) return;

    const db = getDatabase();
    const notificationsRef = query(
      ref(db, 'notifications'),
      orderByChild('requesterId'),
    );

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const notificationsData = [];
      snapshot.forEach((childSnapshot) => {
        const notification = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        };
        if (notification.requesterId === user.uid) {
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
    if (isModalOpen && notifications.length > 0) {
      const db = getDatabase();
      const updates = {};
      
      notifications.forEach(notification => {
        if (!notification.isRead) {
          updates[`notifications/${notification.id}/isRead`] = true;
        }
      });

      if (Object.keys(updates).length > 0) {
        update(ref(db), updates).then(() => {
          setNotifications(prevNotifications =>
            prevNotifications.map(notif => ({
              ...notif,
              isRead: true
            }))
          );
          setUnreadCount(0);
        }).catch((error) => {
          console.error("Error marking notifications as read:", error);
        });
      }
    }
  }, [isModalOpen, notifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
      if (deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        setIsDeleteModalOpen(false);
        setNotificationToDelete(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteClick = (notification) => {
    setNotificationToDelete(notification);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!notificationToDelete) return;

    try {
      const db = getDatabase();
      await remove(ref(db, `notifications/${notificationToDelete.id}`));
      
      setNotifications(prevNotifications =>
        prevNotifications.filter(n => n.id !== notificationToDelete.id)
      );

      if (!notificationToDelete.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      setIsDeleteModalOpen(false);
      setNotificationToDelete(null);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

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

  return (
    <div className="notifications-wrapper">
      <div className="notifications-container" ref={modalRef}>
        <button
          className="notifications-button"
          onClick={() => setIsModalOpen(!isModalOpen)}
        >
          <Bell />
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
              <button 
                className="close-button"
                onClick={() => setIsModalOpen(false)}
              >
                <X />
              </button>
            </div>
            
            {isLoading ? (
              <div className="notifications-loading">
                <div className="loading-spinner"></div>
                <span>Đang tải thông báo...</span>
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
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteClick(notification)}
                      >
                        <Trash2 className="delete-icon" />
                      </button>
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

      {isDeleteModalOpen && (
        <div className="delete-modal-overlay">
          <div className="delete-modal" ref={deleteModalRef}>
            <div className="delete-modal-header">
              <h4>Xác nhận xóa thông báo</h4>
              <button 
                className="close-button"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                <X />
              </button>
            </div>
            <div className="delete-modal-content">
              <p>Bạn có chắc chắn muốn xóa thông báo này không?</p>
              <p>Hành động này không thể hoàn tác.</p>
            </div>
            <div className="delete-modal-footer">
              <button 
                className="cancel-button"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Hủy
              </button>
              <button 
                className="confirm-button"
                onClick={handleDeleteConfirm}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsModal;