import React, { useState, useEffect } from 'react';
import { database } from '../../firebaseConfig';
import { ref, push, onValue, serverTimestamp } from 'firebase/database';
import { FaCommentDots, FaPaperPlane } from 'react-icons/fa';
import '../../pageCSS/AdminMessaging/AdminMessagingCss.css';

const AdminMessaging = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!user) return;

    const messagesRef = ref(database, `userMessages/${user.uid}`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        })).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messagesList);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messagesRef = ref(database, `userMessages/${user.uid}`);
      await push(messagesRef, {
        text: newMessage,
        sender: 'user',
        timestamp: serverTimestamp(),
        read: false
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="admin-messaging">
      <button 
        className="contact-admin-btn"
        onClick={toggleModal}
      >
        <FaCommentDots />
      </button>

      {isModalOpen && (
        <div className="admin-message-modal">
          <div className="admin-message-header">
            <h3>Tin nhắn với Admin</h3>
            <button onClick={toggleModal}>×</button>
          </div>
          <div className="admin-message-body">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`message ${msg.sender === 'user' ? 'user-message' : 'admin-message'}`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="admin-message-input">
            <input 
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessaging;