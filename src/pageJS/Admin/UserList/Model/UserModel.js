import React, { useState, useEffect } from 'react';
import '../../../../pageCSS/Admin/UserListCss/Model/UserModalCss.css'; 

function UserModal({ isOpen, onClose, action, user, onSubmit }) {
    const [userData, setUserData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Người dùng'
    });
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        if (user && action !== 'add') {
            setUserData({
                email: user.email,
                password: user.password,
                confirmPassword: user.password,
                role: user.role || 'Người dùng'
            });
        } else {
            setUserData({ email: '', password: '', confirmPassword: '', role: 'Người dùng' });
        }
    }, [user, action]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (userData.password !== userData.confirmPassword) {
            setPasswordError('Mật khẩu không khớp');
            return;
        }
        setPasswordError('');
        const { confirmPassword, ...dataToSubmit } = userData;
        onSubmit(dataToSubmit);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{action === 'add' ? 'Thêm người dùng' : action === 'edit' ? 'Sửa người dùng' : 'Xóa người dùng'}</h2>
                <form onSubmit={handleSubmit}>
                    {action !== 'delete' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="email">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={userData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Mật khẩu:</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={userData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Nhập lại mật khẩu:</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={userData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {passwordError && <p className="error">{passwordError}</p>}
                            <div className="form-group">
                                <label htmlFor="role">Vai trò:</label>
                                <select
                                    id="role"
                                    name="role"
                                    value={userData.role}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Người dùng">Người dùng</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                        </>
                    )}
                    {action === 'delete' && (
                        <p>Bạn có chắc chắn muốn xóa người dùng này?</p>
                    )}
                    <div className="modal-actions">
                        <button type="submit" className="btn-submit">
                            {action === 'add' ? 'Thêm' : action === 'edit' ? 'Cập nhật' : 'Xóa'}
                        </button>
                        <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserModal;