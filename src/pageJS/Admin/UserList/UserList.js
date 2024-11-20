import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { ref, get, onValue, remove, push, set, serverTimestamp } from 'firebase/database';
import { auth, database } from '../../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import '../../../pageCSS/Admin/UserListCss/UserListCss.css';
import Aside from '../Aside/Aside.js';
import { FaBars, FaTimes } from 'react-icons/fa';
import UserModal from './Model/UserModel';
import { toast } from 'react-toastify';

function ResetPasswordModal({ isOpen, onClose, userEmail }) {
    const [loading, setLoading] = useState(false);
    const [resetOption, setResetOption] = useState('sendEmail');

    const handleResetPassword = async () => {
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, userEmail);
            toast.success('Đã gửi email đặt lại mật khẩu thành công!');
            onClose();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="ul-modal-overlay">
            <div className="ul-modal">
                <h2>Đặt lại mật khẩu</h2>
                <div className="ul-modal-content">
                    <p>Bạn muốn đặt lại mật khẩu cho tài khoản: <strong>{userEmail}</strong></p>

                    <div className="ul-reset-opts">
                        <div className="ul-form-group">
                            <label>
                                <input
                                    type="radio"
                                    value="sendEmail"
                                    checked={resetOption === 'sendEmail'}
                                    onChange={(e) => setResetOption(e.target.value)}
                                />
                                Gửi email đặt lại mật khẩu cho người dùng
                            </label>
                        </div>
                    </div>

                    <div className="ul-modal-actions">
                        <button
                            className="ul-btn ul-btn-submit"
                            onClick={handleResetPassword}
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Gửi yêu cầu đặt lại mật khẩu'}
                        </button>
                        <button
                            className="ul-btn ul-btn-cancel"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function UserList() {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [modalAction, setModalAction] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(5);
    const [isAsideVisible, setIsAsideVisible] = useState(true);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [selectedUserEmail, setSelectedUserEmail] = useState(null);

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

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleAdd = () => {
        setModalAction('add');
        setSelectedUser(null);
    };

    const handleDelete = (user) => {
        setModalAction('delete');
        setSelectedUser(user);
    };

    const handleResetPassword = (user) => {
        setSelectedUserEmail(user.email);
        setShowResetPasswordModal(true);
    };

    const handleSubmit = async (userData) => {
        try {
            if (modalAction === 'add') {
                const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
                const user = userCredential.user;

                await set(ref(database, 'users/' + user.uid), {
                    email: userData.email,
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
            } else if (modalAction === 'delete') {
                await remove(ref(database, `users/${selectedUser.id}`));
                setUsers(users.filter(user => user.id !== selectedUser.id));
            }
            closeModal();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Đã xảy ra lỗi. Vui lòng thử lại.');
        }
    };

    const closeModal = () => {
        setModalAction(null);
        setSelectedUser(null);
    };

    const toggleAside = () => setIsAsideVisible(!isAsideVisible);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const filteredUsers = users.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const currentUsers = filteredUsers.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage
    );

    return (
        <div className="ul-container">
            {isAsideVisible && <Aside currentUser={currentUser} />}
            <div className={`ul-main ${isAsideVisible ? '' : 'ul-full'}`}>
                <div className="ul-header">
                    <div className="ul-toggle">
                        <button className="ul-btn ul-btn-toggle" onClick={toggleAside}>
                            {isAsideVisible ? <FaTimes /> : <FaBars />}
                        </button>
                        <h2>Danh sách tài khoản người dùng</h2>
                    </div>
                    <div className="ul-actions">
                        <button className="ul-btn ul-btn-add" onClick={handleAdd}>
                            Thêm tài khoản
                        </button>
                    </div>
                </div>

                <div className="ul-search">
                    <input
                        type="text"
                        placeholder="Tìm kiếm tài khoản..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                <div className="ul-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Họ và tên</th>
                                <th>Vai trò</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.email}</td>
                                    <td>{user.fullName}</td>
                                    <td>
                                        <span className={`ul-role ${user.role}`}>
                                            {user.role === 'Admin' ? 'Quản trị viên' : 'Người dùng'}
                                        </span>
                                    </td>
                                    <td className="ul-actions">
                                        <button className="ul-btn ul-btn-delete" onClick={() => handleDelete(user)}>
                                            Xóa
                                        </button>
                                        <button className="ul-btn ul-btn-reset" onClick={() => handleResetPassword(user)}>
                                            Đặt lại mật khẩu
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="ul-pagination">
                    {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => paginate(index + 1)}
                            className={`ul-btn ul-btn-page ${currentPage === index + 1 ? 'ul-active' : ''}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>

            <ResetPasswordModal
                isOpen={showResetPasswordModal}
                onClose={() => setShowResetPasswordModal(false)}
                userEmail={selectedUserEmail}
            />

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