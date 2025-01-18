import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { ref, get, onValue, push, set, update, serverTimestamp } from 'firebase/database';
import { auth, database } from '../../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import '../../../pageCSS/Admin/UserListCss/UserListCss.css';
import Aside from '../Aside/Aside.js';
import { FaBars, FaTimes, FaUserEdit, FaKey, FaFilter, FaDownload } from 'react-icons/fa';
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
        <div className="aul-modal-overlay">
            <div className="aul-modal">
                <h2>Đặt lại mật khẩu</h2>
                <div className="aul-modal-content">
                    <p>Bạn muốn đặt lại mật khẩu cho tài khoản: <strong>{userEmail}</strong></p>

                    <div className="aul-reset-opts">
                        <div className="aul-form-group">
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

                    <div className="aul-modal-actions">
                        <button
                            className="aul-btn aul-btn-submit"
                            onClick={handleResetPassword}
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Gửi yêu cầu đặt lại mật khẩu'}
                        </button>
                        <button
                            className="aul-btn aul-btn-cancel"
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

function EditUserModal({ isOpen, onClose, user, onSubmit }) {
    const [userData, setUserData] = useState({
        fullName: user?.fullName || '',
        role: user?.role || 'user',
        status: user?.status || 'active'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit(userData);
    };

    if (!isOpen) return null;

    return (
        <div className="aul-modal-overlay">
            <div className="aul-modal">
                <h2>Chỉnh sửa thông tin người dùng</h2>
                <form onSubmit={handleSubmit}>
                    <div className="aul-form-group">
                        <label>Họ và tên:</label>
                        <input
                            type="text"
                            value={userData.fullName}
                            onChange={(e) => setUserData({...userData, fullName: e.target.value})}
                        />
                    </div>
                    <div className="aul-form-group">
                        <label>Vai trò:</label>
                        <select
                            value={userData.role}
                            onChange={(e) => setUserData({...userData, role: e.target.value})}
                        >
                            <option value="user">Người dùng</option>
                            <option value="Admin">Quản trị viên</option>
                        </select>
                    </div>
                    <div className="aul-form-group">
                        <label>Trạng thái:</label>
                        <select
                            value={userData.status}
                            onChange={(e) => setUserData({...userData, status: e.target.value})}
                        >
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Tạm khóa</option>
                        </select>
                    </div>
                    <div className="aul-modal-actions">
                        <button type="submit" className="aul-btn aul-btn-submit">
                            Lưu thay đổi
                        </button>
                        <button type="button" className="aul-btn aul-btn-cancel" onClick={onClose}>
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function UserList() {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const navigate = useNavigate();
    const [modalAction, setModalAction] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10); 
    const [isAsideVisible, setIsAsideVisible] = useState(true);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [selectedUserEmail, setSelectedUserEmail] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

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
                            status: usersData[key].status || 'active'
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

    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleResetPassword = (user) => {
        setSelectedUserEmail(user.email);
        setShowResetPasswordModal(true);
    };

    const handleEditSubmit = async (userData) => {
        try {
            await update(ref(database, `users/${selectedUser.id}`), {
                ...userData,
                lastUpdated: serverTimestamp()
            });
            toast.success('Cập nhật thông tin thành công!');
            setShowEditModal(false);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Không thể cập nhật thông tin. Vui lòng thử lại.');
        }
    };

    const handleSubmit = async (userData) => {
        try {
            if (modalAction === 'add') {
                const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
                const user = userCredential.user;

                await set(ref(database, 'users/' + user.uid), {
                    email: userData.email,
                    role: userData.role,
                    status: 'active',
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
                toast.success('Tạo tài khoản mới thành công!');
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

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (!sortConfig.key) return 0;
        
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
    });

    const currentUsers = sortedUsers.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage
    );

    return (
        <div className="aul-container">
            {isAsideVisible && <Aside currentUser={currentUser} />}
            <div className={`aul-main ${isAsideVisible ? '' : 'aul-full'}`}>
                <div className="aul-header">
                    <div className="aul-toggle">
                        <button className="aul-btn aul-btn-toggle" onClick={toggleAside}>
                            {isAsideVisible ? <FaTimes /> : <FaBars />}
                        </button>
                        <h2>Danh sách tài khoản người dùng</h2>
                    </div>
                    <div className="aul-actions">
                        <button className="aul-btn aul-btn-add" onClick={handleAdd}>
                            Thêm tài khoản
                        </button>
                    </div>
                </div>

                <div className="aul-filters">
                    <div className="aul-search">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo email hoặc tên..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="aul-filter-group">
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="aul-filter-select"
                        >
                            <option value="all">Tất cả vai trò</option>
                            <option value="Admin">Quản trị viên</option>
                            <option value="user">Người dùng</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="aul-filter-select"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Tạm khóa</option>
                        </select>
                    </div>
                </div>

                <div className="aul-table">
                    <table>
                        <thead>
                            <tr>
                            <th onClick={() => handleSort('email')}>
                                    Email {sortConfig.key === 'email' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('fullName')}>
                                    Họ và tên {sortConfig.key === 'fullName' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('role')}>
                                    Vai trò {sortConfig.key === 'role' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('status')}>
                                    Trạng thái {sortConfig.key === 'status' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('createdAt')}>
                                    Ngày tạo {sortConfig.key === 'createdAt' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                </th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.email}</td>
                                    <td>{user.fullName || 'Chưa cập nhật'}</td>
                                    <td>
                                        <span className={`aul-role ${user.role}`}>
                                            {user.role === 'Admin' ? 'Quản trị viên' : 'Người dùng'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`aul-status ${user.status}`}>
                                            {user.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                                        </span>
                                    </td>
                                    <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                    <td className="aul-actions">
                                        <button 
                                            className="aul-btn aul-btn-edit" 
                                            onClick={() => handleEdit(user)}
                                            title="Chỉnh sửa thông tin"
                                        >
                                            <FaUserEdit />
                                        </button>
                                        <button 
                                            className="aul-btn aul-btn-reset" 
                                            onClick={() => handleResetPassword(user)}
                                            title="Đặt lại mật khẩu"
                                        >
                                            <FaKey />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="aul-pagination">
                    {currentPage > 1 && (
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            className="aul-btn aul-btn-page"
                        >
                            ←
                        </button>
                    )}
                    
                    {Array.from({ length: Math.min(5, Math.ceil(filteredUsers.length / usersPerPage)) }).map((_, index) => {
                        let pageNum;
                        const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
                        
                        if (totalPages <= 5) {
                            pageNum = index + 1;
                        } else {
                            if (currentPage <= 3) {
                                pageNum = index + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - (4 - index);
                            } else {
                                pageNum = currentPage - 2 + index;
                            }
                        }
                        
                        return (
                            <button
                                key={pageNum}
                                onClick={() => paginate(pageNum)}
                                className={`aul-btn aul-btn-page ${currentPage === pageNum ? 'aul-active' : ''}`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    
                    {currentPage < Math.ceil(filteredUsers.length / usersPerPage) && (
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            className="aul-btn aul-btn-page"
                        >
                            →
                        </button>
                    )}
                </div>
            </div>

            <ResetPasswordModal
                isOpen={showResetPasswordModal}
                onClose={() => setShowResetPasswordModal(false)}
                userEmail={selectedUserEmail}
            />

            <EditUserModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                user={selectedUser}
                onSubmit={handleEditSubmit}
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