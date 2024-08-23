import React, { useState, useEffect } from 'react';
import { ref, get, onValue, remove, update, push } from 'firebase/database';
import { auth, database } from '../../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import '../../../pageCSS/Admin/UserListCss/UserListCss.css';
import Aside from '../Aside/Aside.js';
import DeleteModel from './Model/DeleteModel';

function UserList() {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [showDeleteModel, setShowDeleteModel] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showPasswords, setShowPasswords] = useState({});

    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(5);

    const handleDelete = async (userId) => {
        setUserToDelete(userId);
        setShowDeleteModel(true);
    };

    const confirmDelete = async () => {
        try {
            await remove(ref(database, 'users/' + userToDelete));
            setUsers(users.filter((user) => user.id !== userToDelete));
            setShowDeleteModel(false);
            setUserToDelete(null);
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModel(false);
        setUserToDelete(null);
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

    const handleEdit = (user) => {
        navigate(`/user/${user.id}/edit`, { state: { user } });
    };

    const handleAddUser = () => {
        navigate('/user/add');
    };

    const filteredUsers = users.filter((user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="user-list-container">

            <Aside currentUser={currentUser} />

            <div className="user-list-content">
                <div className="user-list-header">
                    <h2>Danh sách tài khoản người dùng</h2>
                    <div className="user-list-actions">
                        <button className="btn-add" onClick={handleAddUser}>
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
                                        <button className="btn-delete" onClick={() => handleDelete(user.id)}>
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
        </div>
    );
}

export default UserList;