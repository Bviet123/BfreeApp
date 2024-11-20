import React, { useState, useEffect } from 'react';
import { EmailAuthProvider, updatePassword, reauthenticateWithCredential } from "firebase/auth";
import { auth } from '../../../../firebaseConfig';
import { toast } from 'react-toastify';
import '../../../../pageCSS/Admin/UserListCss/Model/UserModalCss.css';

function UserModal({ isOpen, onClose, action, user, onSubmit }) {
    const [userData, setUserData] = useState({
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        role: 'Người dùng'
    });
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && action !== 'add') {
            setUserData(prevState => ({
                ...prevState,
                email: user.email,
                role: user.role || 'Người dùng'
            }));
        } else {
            setUserData({
                email: '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
                role: 'Người dùng'
            });
        }
    }, [user, action]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevState => ({
            ...prevState,
            [name]: value
        }));
        if (name === 'newPassword' || name === 'confirmPassword') {
            setPasswordError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPasswordError('');

        try {
            // Xử lý xóa người dùng
            if (action === 'delete') {
                onSubmit(userData);
                return;
            }

            // Kiểm tra mật khẩu mới có khớp không khi đang thêm mới hoặc có nhập mật khẩu mới
            if ((action === 'add' || userData.newPassword) && 
                userData.newPassword !== userData.confirmPassword) {
                throw new Error('Mật khẩu mới không khớp');
            }

            // Xử lý cập nhật mật khẩu khi đang sửa
            if (action === 'edit' && userData.newPassword) {
                const currentUser = auth.currentUser;
                if (!currentUser) throw new Error('Không tìm thấy thông tin người dùng');

                // Xác thực lại người dùng với mật khẩu hiện tại
                const credential = EmailAuthProvider.credential(
                    currentUser.email,
                    userData.currentPassword
                );
                await reauthenticateWithCredential(currentUser, credential);

                // Cập nhật mật khẩu mới
                await updatePassword(currentUser, userData.newPassword);
                toast.success('Mật khẩu đã được cập nhật thành công!');
            }

            // Chuẩn bị dữ liệu để gửi đi
            const dataToSubmit = {
                email: userData.email,
                role: userData.role
            };

            // Thêm mật khẩu vào data khi thêm mới user
            if (action === 'add') {
                dataToSubmit.password = userData.newPassword;
            }

            onSubmit(dataToSubmit);
            onClose();

        } catch (error) {
            console.error('Error:', error);
            let errorMessage;
            switch (error.code) {
                case 'auth/wrong-password':
                    errorMessage = 'Mật khẩu hiện tại không đúng';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Mật khẩu mới quá yếu. Vui lòng chọn mật khẩu mạnh hơn';
                    break;
                case 'auth/requires-recent-login':
                    errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại';
                    break;
                default:
                    errorMessage = error.message || 'Đã xảy ra lỗi khi cập nhật thông tin';
            }
            setPasswordError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
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

                            {action === 'edit' && (
                                <div className="form-group">
                                    <label htmlFor="currentPassword">Mật khẩu hiện tại:</label>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        name="currentPassword"
                                        value={userData.currentPassword}
                                        onChange={handleChange}
                                        placeholder="Nhập để thay đổi mật khẩu"
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="newPassword">
                                    {action === 'add' ? 'Mật khẩu:' : 'Mật khẩu mới:'}
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={userData.newPassword}
                                    onChange={handleChange}
                                    required={action === 'add'}
                                    placeholder={action === 'edit' ? "Nhập mật khẩu mới" : ""}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Xác nhận mật khẩu:</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={userData.confirmPassword}
                                    onChange={handleChange}
                                    required={action === 'add' || userData.newPassword !== ''}
                                />
                            </div>

                            {passwordError && (
                                <div className="error-message">
                                    {passwordError}
                                </div>
                            )}

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
                        <button 
                            type="submit" 
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : action === 'add' ? 'Thêm' : action === 'edit' ? 'Cập nhật' : 'Xóa'}
                        </button>
                        <button 
                            type="button" 
                            className="btn-cancel" 
                            onClick={onClose}
                            disabled={loading}
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserModal;