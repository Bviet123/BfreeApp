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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
              return {
                uid: userId,
                email: userData?.email || 'Người dùng ẩn',
              };
            })
          ).then((users) => {
            const filteredUsers = users.filter((user) => user !== null);
            setUserList(filteredUsers);
            setIsLoadingUsers(false);
          });
        } else {
          console.warn('Không có dữ liệu userMessages');
          setUserList([]);
          setIsLoadingUsers(false);
        }
      }, (error) => {
        console.error('Lỗi kết nối userMessages:', error);
        setIsLoadingUsers(false);
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

      return unsubscribe;
    } else {
      setMessages([]);
    }
  }, [selectedUser, database]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        text: newMessage,
        sender: isAdmin ? 'Admin' : 'user',
        timestamp: serverTimestamp(),
        read: false
      };

      const targetUserId = isAdmin ? selectedUser?.uid : user?.uid;
      const messagesRef = ref(database, `userMessages/${targetUserId}/messages`);
      
      const newMessageRef = await push(messagesRef, messageData);
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: newMessageRef.key, ...messageData },
      ]);
      
      setNewMessage('');
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error);
    }
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
          {!isAdmin && messages.filter(msg => msg.sender === 'Admin' && !msg.read).length > 0 && (
            <span className="unread-badge">
              {messages.filter(msg => msg.sender === 'Admin' && !msg.read).length}
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
                  ? 'Tin nhắn quản trị' 
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
                            <FaUser />
                            <span>{userData.email}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="chat-column">
                {(isAdmin ? selectedUser : true) && (
                  <>
                    <div className="chat-body">
                      <div className="message-list">
                        {messages.map((msg) => (
                          <div 
                            key={msg.id} 
                            className={`message ${
                              msg.sender === (isAdmin ? 'Admin' : 'user') 
                                ? 'sent-message' 
                                : 'received-message'
                            }`}
                          >
                            {msg.text}
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
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
                        disabled={isAdmin && !selectedUser}
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