import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, get, onValue, remove, update, push, set, serverTimestamp } from 'firebase/database';
import { auth, database } from '../../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import '../../../pageCSS/Admin/UserListCss/UserListCss.css';
import Aside from '../Aside/Aside.js';
import { FaBars, FaTimes } from 'react-icons/fa';
import UserModal from './Model/UserModel';


function UserList() {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [showPasswords, setShowPasswords] = useState({});

    const [modalAction, setModalAction] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(5);

    const [isAsideVisible, setIsAsideVisible] = useState(true);

    const toggleAside = () => {
        setIsAsideVisible(!isAsideVisible);
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setCurrentUser(user);
                const usersRef = ref(database, 'users');
                onValue(usersRef, (snapshot) => {
                    const usersData = snapshot.val();
                    if (usersData) {
                        const usersList = Object.keys(usersData).map((key) => ({
                            id: key,
                            ...usersData[key],
                        }));
                        setUsers(usersList);
                        // Khởi tạo state cho việc ẩn/hiện mật khẩu
                        const initialShowPasswords = {};
                        usersList.forEach(user => {
                            initialShowPasswords[user.id] = false;
                        });
                        setShowPasswords(initialShowPasswords);
                    } else {
                        setUsers([]);
                    }
                });
            } else {
                setCurrentUser(null);
                setUsers([]);
            }
        });

        return unsubscribe;
    }, []);

    const togglePassword = (userId) => {
        setShowPasswords(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const filteredUsers = users.filter((user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleAdd = () => {
        setModalAction('add');
        setSelectedUser(null);
    };

    const handleEdit = (user) => {
        setModalAction('edit');
        setSelectedUser(user);
    };

    const handleDelete = (user) => {
        setModalAction('delete');
        setSelectedUser(user);
    };

    const closeModal = () => {
        setModalAction(null);
        setSelectedUser(null);
    };

    const handleSubmit = async (userData) => {
        try {
            if (modalAction === 'add') {
                // Tạo user mới trong Authentication
                const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
                const user = userCredential.user;
    
                // Thêm thông tin user vào Realtime Database
                await set(ref(database, 'users/' + user.uid), {
                    email: userData.email,
                    password: userData.password,
                    role: userData.role,
                    fullName: "",
                    birthDate: "",
                    gender: "",
                    favoriteGenres: { default: "Chưa có" },
                    booksRead: { default: "Chưa đọc sách nào" },
                    readingGoal: "",
                    createdAt: serverTimestamp(),
                    lastUpdated: serverTimestamp(),
                    avatar: null,
                    borrowedBooks: ["book1"],
                    favoriteBooks: ["book1"],

                });
    
                setUsers([...users, { id: user.uid, ...userData }]);
            } else if (modalAction === 'edit') {
                // Cập nhật thông tin user
                await update(ref(database, `users/${selectedUser.id}`), {
                    email: userData.email,
                    password: userData.password,
                    role: userData.role,
                    lastUpdated: serverTimestamp()
                });
                setUsers(users.map(user => user.id === selectedUser.id ? { ...user, ...userData } : user));
            } else if (modalAction === 'delete') {
                // Xóa user
                await remove(ref(database, `users/${selectedUser.id}`));
                setUsers(users.filter(user => user.id !== selectedUser.id));
            }
            closeModal();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="user-list-container">
            {isAsideVisible && <Aside currentUser={currentUser} />}
            <div className={`user-list-main ${isAsideVisible ? '' : 'full-width'}`}>
                <div className="user-list-header">
                    <div className='user-list-toggle'>
                        <button className="toggle-aside-btn" onClick={toggleAside}>
                            {isAsideVisible ? <FaTimes /> : <FaBars />}
                        </button>
                        <h2>Danh sách tài khoản người dùng</h2>
                    </div>
                    <div className="user-list-actions">
                        <button className="btn-add" onClick={handleAdd}>
                            Thêm tài khoản
                        </button>
                    </div>
                </div>

                <div className="user-list-search">
                    <input
                        type="text"
                        placeholder="Tìm kiếm tài khoản..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Mật khẩu</th>
                            <th>Họ và tên</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers && currentUsers.length > 0 ? (
                            currentUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.email}</td>
                                    <td>
                                        <input
                                            type={showPasswords[user.id] ? "text" : "password"}
                                            value={user.password || ''}
                                            readOnly
                                        />
                                        <button onClick={() => togglePassword(user.id)}>
                                            {showPasswords[user.id] ? "Ẩn" : "Hiện"}
                                        </button>
                                    </td>
                                    <td>{user.fullName}</td>
                                    <td>
                                        <button className="btn-edit" onClick={() => handleEdit(user)}>
                                            Sửa
                                        </button>
                                        <button className="btn-delete" onClick={() => handleDelete(user)}>
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">Không có dữ liệu người dùng.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="pagination">
                    {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => paginate(index + 1)}
                            className={currentPage === index + 1 ? 'active' : ''}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>

            </div>
            <UserModal
                isOpen={modalAction !== null}
                onClose={closeModal}
                action={modalAction}
                user={selectedUser}
                onSubmit={handleSubmit}
            />
        </div>
    );
}

export default UserList;