import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { ref, set, serverTimestamp } from "firebase/database";
import { auth, database } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../pageCSS/login/Login.css';

function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const navigate = useNavigate();

    const addUserToDatabase = async (user) => {
        try {
            const userData = {
                avatar: "",
                email: user.email,
                role: "user",
                fullName: "",
                birthDate: "",
                gender: "",
                favoriteGenres: { default: "Chưa có" },
                readingGoal: "",
                favoriteBooks: { default: "Chưa có" },
                borrowedBooks: { default: "Chưa có" },
                createdAt: serverTimestamp(),
                lastUpdated: serverTimestamp()
            };
            await set(ref(database, 'users/' + user.uid), userData);
            console.log("Thông tin người dùng đã được thêm vào Database");
            return userData;
        } catch (error) {
            console.error("Lỗi khi thêm thông tin người dùng vào Database:", error);
            throw error;
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Mật khẩu không khớp");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await sendEmailVerification(user);
            setIsVerifying(true);

            const userInfo = {
                email: user.email,
                uid: user.uid,
            };
            await addUserToDatabase(userInfo);
            
            toast.success("Một email xác nhận đã được gửi đến địa chỉ email của bạn. Vui lòng xác nhận email trước khi đăng nhập.");
        } catch (error) {
            handleAuthError(error);
        }
    };

    const handleAuthError = (error) => {
        let errorMessage;
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Email này đã được sử dụng. Vui lòng chọn email khác.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Email không hợp lệ. Vui lòng kiểm tra lại.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.';
                break;
            default:
                errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
                console.error(error);
        }
        toast.error(errorMessage);
        setError(errorMessage);
    };

    if (isVerifying) {
        return (
            <div className="login-container">
                <div className="login-form">
                    <h2>Xác nhận Email</h2>
                    <p>Vui lòng kiểm tra hộp thư của bạn và nhấp vào liên kết xác nhận để hoàn tất quá trình đăng ký.</p>
                    <button onClick={() => navigate('/login')} className="auth-button">
                        Đã xác nhận? Đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <form onSubmit={handleSignUp} className="login-form">
                <h2>Đăng ký</h2>
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
                <div className="login-form-group">
                    <label htmlFor="password">Mật khẩu:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="login-form-group">
                    <label htmlFor="confirmPassword">Nhập lại mật khẩu:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="auth-button">Đăng ký</button>
                <p className="switch-mode" onClick={() => navigate('/login')}>
                    Đã có tài khoản? Đăng nhập
                </p>
            </form>
        </div>
    );
}

export default SignUp;