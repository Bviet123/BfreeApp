import React, { useState } from 'react';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../pageCSS/login/Login.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [isResetSent, setIsResetSent] = useState(false);

    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            await sendPasswordResetEmail(auth, email);
            setIsResetSent(true);
            toast.success("Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.");
        } catch (error) {
            handleResetError(error);
        }
    };

    const handleResetError = (error) => {
        let errorMessage;
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Không tìm thấy tài khoản với email này.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Email không hợp lệ. Vui lòng kiểm tra lại.';
                break;
            default:
                errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
                console.error(error);
        }
        toast.error(errorMessage);
        setError(errorMessage);
    };

    if (isResetSent) {
        return (
            <div className="login-container">
                <div className="login-form">
                    <h2>Đặt lại mật khẩu</h2>
                    <p>Email hướng dẫn đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu.</p>
                    <button onClick={() => navigate('/login')} className="auth-button">
                        Quay lại đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <form onSubmit={handleResetPassword} className="login-form">
                <h2>Quên mật khẩu</h2>
                {error && <p className="error-message">{error}</p>}
                <div className="login-form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="auth-button">Gửi yêu cầu đặt lại mật khẩu</button>
                <p className="switch-mode" onClick={() => navigate('/login')}>
                    Đăng nhập
                </p>
            </form>
        </div>
    );
}

export default ForgotPassword;