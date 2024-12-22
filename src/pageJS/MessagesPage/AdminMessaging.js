import React, { useState, useEffect, useRef } from 'react';
import { database } from '../../firebaseConfig';
import { ref, push, onValue, serverTimestamp, get } from 'firebase/database';
import { 
  FaCommentDots, 
  FaPaperPlane, 
  FaTimes, 
  FaUser
} from 'react-icons/fa';
import '../../pageCSS/AdminMessaging/AdminMessagingCss.css';

function AdminMessaging({ user, isAdmin }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userList, setUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load tin nhắn cho người dùng thường
  useEffect(() => {
    if (!isAdmin && user && chatOpen) {
      setIsLoadingMessages(true);
      const messagesRef = ref(database, `userMessages/${user.uid}/messages`);
      
      const unsubscribe = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const messageList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setMessages(messageList);
        } else {
          setMessages([]);
        }
        setIsLoadingMessages(false);
      });

      return () => unsubscribe();
    }
  }, [user, chatOpen, isAdmin]);

  useEffect(() => {
    if (isAdmin && chatOpen) {
      setIsLoadingUsers(true);
      const usersRef = ref(database, 'userMessages');
  
      const loadUserList = onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const userIds = Object.keys(data);
          Promise.all(
            userIds.map(async (userId) => {
              const userDetailRef = ref(database, `users/${userId}`);
              const userSnapshot = await get(userDetailRef);
              const userData = userSnapshot.val();
              
              // Đếm tin nhắn chưa đọc
              const messagesRef = ref(database, `userMessages/${userId}/messages`);
              const messagesSnapshot = await get(messagesRef);
              let unreadCount = 0;
              
              if (messagesSnapshot.exists()) {
                messagesSnapshot.forEach((msgSnapshot) => {
                  const msg = msgSnapshot.val();
                  if (msg.sender === 'user') {
                    unreadCount++;
                  }
                });
              }
              
              return {
                uid: userId,
                email: userData?.email || 'Người dùng ẩn',
                unreadCount,
                lastActive: userData?.lastActive || null
              };
            })
          ).then((users) => {
            const filteredUsers = users.filter((user) => user !== null)
              .sort((a, b) => b.unreadCount - a.unreadCount || (b.lastActive || 0) - (a.lastActive || 0));
            setUserList(filteredUsers);
            setIsLoadingUsers(false);
          });
        } else {
          setUserList([]);
          setIsLoadingUsers(false);
        }
      });
  
      return () => loadUserList();
    }
  }, [isAdmin, chatOpen]);

  useEffect(() => {
    if (selectedUser) {
      const messagesRef = ref(database, `userMessages/${selectedUser.uid}/messages`);
      
      const unsubscribe = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const messageList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setMessages(messageList);
        } else {
          setMessages([]);
        }
      });

      return () => unsubscribe();
    } else if (isAdmin) {
      setMessages([]);
    }
  }, [selectedUser, database, isAdmin]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        text: newMessage,
        sender: isAdmin ? 'Admin' : 'user',
        timestamp: serverTimestamp()
      };

      const targetUserId = isAdmin ? selectedUser?.uid : user?.uid;
      const messagesRef = ref(database, `userMessages/${targetUserId}/messages`);
      
      await push(messagesRef, messageData);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const handleCloseModal = () => {
    setChatOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="admin-messaging-container">
      {user && (
        <button 
          className={`chat-button ${chatOpen ? 'active' : ''}`}
          onClick={() => setChatOpen(true)}
        >
          <FaCommentDots />
          {!isAdmin && messages.filter(msg => msg.sender === 'Admin').length > 0 && (
            <span className="unread-badge">
              {messages.filter(msg => msg.sender === 'Admin').length}
            </span>
          )}
        </button>
      )}

      {chatOpen && (
        <div className="chat-modal-overlay">
          <div className="chat-window-two-column">
            <div className="chat-header">
              <h3>
                {isAdmin 
                  ? `Tin nhắn quản trị ${selectedUser ? `- ${selectedUser.email}` : ''}` 
                  : 'Tin nhắn Admin'}
              </h3>
              <button onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <div className="chat-content-wrapper">
              {isAdmin && (
                <div className="user-list-column">
                  {isLoadingUsers ? (
                    <div className="bs-loading-container">
                      <div className="bs-loading-spinner"></div>
                    </div>
                  ) : (
                    <div className="user-list">
                      {userList.length === 0 ? (
                        <div className="no-users">Không có người dùng</div>
                      ) : (
                        userList.map((userData) => (
                          <div 
                            key={userData.uid} 
                            className={`user-item ${selectedUser?.uid === userData.uid ? 'selected' : ''}`}
                            onClick={() => setSelectedUser(userData)}
                          >
                            <div className="user-item-left">
                              <FaUser />
                              <span>{userData.email}</span>
                            </div>
                            {userData.unreadCount > 0 && (
                              <span className="unread-count">{userData.unreadCount}</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="chat-column">
                {((isAdmin && selectedUser) || !isAdmin) && (
                  <>
                    <div className="chat-body">
                      {isLoadingMessages ? (
                        <div className="bs-loading-container">
                          <div className="bs-loading-spinner"></div>
                        </div>
                      ) : (
                        <div className="message-list">
                          {messages.length === 0 ? (
                            <div className="no-messages">
                              Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                            </div>
                          ) : (
                            messages.map((msg, index) => {
                              const showTimestamp = index === 0 || 
                                (messages[index - 1]?.timestamp && 
                                 msg.timestamp && 
                                 (msg.timestamp - messages[index - 1].timestamp > 300000));
                              
                              return (
                                <React.Fragment key={msg.id}>
                                  {showTimestamp && (
                                    <div className="timestamp-divider">
                                      {formatTimestamp(msg.timestamp)}
                                    </div>
                                  )}
                                  <div 
                                    className={`message ${
                                      msg.sender === (isAdmin ? 'Admin' : 'user') 
                                        ? 'sent-message' 
                                        : 'received-message'
                                    }`}
                                  >
                                    <div className="message-content">
                                      {msg.text}
                                    </div>
                                  </div>
                                </React.Fragment>
                              );
                            })
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </div>

                    <div className="chat-input">
                      <input 
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        disabled={isAdmin && !selectedUser}
                      />
                      <button 
                        onClick={sendMessage}
                        disabled={isAdmin && !selectedUser || !newMessage.trim()}
                        className={!newMessage.trim() ? 'disabled' : ''}
                      >
                        <FaPaperPlane />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMessaging;