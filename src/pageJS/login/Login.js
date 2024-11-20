import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { ref, get, serverTimestamp, set } from "firebase/database";
import '../../pageCSS/login/Login.css';
import { auth, database } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const fetchUserData = async (uid) => {
        try {
            const userRef = ref(database, 'users/' + uid);
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                const userData = snapshot.val();
                return {
                    uid,
                    avatar: userData.avatar || "",
                    email: userData.email,
                    password: userData.password,
                    role: userData.role || "user",
                    fullName: userData.fullName || "",
                    birthDate: userData.birthDate || "",
                    gender: userData.gender || "",
                    favoriteGenres: userData.favoriteGenres || { default: "Chưa có" },
                    readingGoal: userData.readingGoal || "",
                    favoriteBooks: userData.favoriteBooks || { default: "Chưa có" },
                    borrowedBooks: userData.borrowedBooks || { default: "Chưa có" },
                    createdAt: userData.createdAt,
                    lastUpdated: userData.lastUpdated,
                };
            } else {
                console.log("Không tìm thấy dữ liệu người dùng");
                return null;
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng từ Database:", error);
            throw error;
        }
    };

    const handleUserNavigation = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        
        if (userData.role === 'Admin') {
            toast.success("Đăng nhập thành công! Chuyển hướng đến trang quản trị.");
            navigate('/admin/users', { state: { user: userData } });
        } else {
            toast.success("Đăng nhập thành công!");
            navigate('/Home', { state: { user: userData } });
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userData = await fetchUserData(userCredential.user.uid);
            
            if (userData) {
                handleUserNavigation(userData);
            } else {
                throw new Error('Không tìm thấy thông tin người dùng');
            }
        } catch (error) {
            handleAuthError(error);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const userExists = await checkUserExists(result.user.uid);
            let userData;
            
            if (!userExists) {
                const userInfo = {
                    email: result.user.email,
                    password: "",
                    uid: result.user.uid,
                };
                userData = await addUserToDatabase(userInfo);
            } else {
                userData = await fetchUserData(result.user.uid);
            }

            if (userData) {
                handleUserNavigation(userData);
            } else {
                throw new Error('Không tìm thấy thông tin người dùng');
            }
        } catch (error) {
            handleAuthError(error);
        }
    };

    const checkUserExists = async (uid) => {
        const userRef = ref(database, 'users/' + uid);
        const snapshot = await get(userRef);
        return snapshot.exists();
    };

    const addUserToDatabase = async (user) => {
        try {
            const userData = {
                avatar: "",
                email: user.email,
                password: user.password,
                role: "user", 
                fullName: "",
                birthDate: "",
                gender: "",
                favoriteGenres: { default: "Chưa có" },
                readingGoal: "",
                favoriteBooks: { default: "Chưa có" },
                borrowedBooks: { default: "Chưa có" },
                createdAt: serverTimestamp(),
                lastUpdated: serverTimestamp(),
            };
            await set(ref(database, 'users/' + user.uid), userData);
            console.log("Thông tin người dùng đã được thêm vào Database");
            return { ...userData, uid: user.uid };
        } catch (error) {
            console.error("Lỗi khi thêm thông tin người dùng vào Database:", error);
            throw error;
        }
    };

    const handleAuthError = (error) => {
        let errorMessage;
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Tài khoản không tồn tại. Vui lòng kiểm tra lại email hoặc đăng ký mới.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Mật khẩu không đúng. Vui lòng thử lại.';
                break;
            case 'auth/popup-closed-by-user':
                errorMessage = 'Đăng nhập bằng Google bị hủy. Vui lòng thử lại.';
                break;
            default:
                errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
                console.error(error);
        }
        toast.error(errorMessage);
        setError(errorMessage);
    };

    return (
        <div className="login-container">
            <ToastContainer />
            <form onSubmit={handleLogin} className="login-form">
                <h2>Đăng nhập</h2>
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
                <button type="submit" className="auth-button">Đăng nhập</button>
                <button type="button" onClick={handleGoogleSignIn} className="google-button">
                    <i className="fab fa-google"></i> Đăng nhập bằng Google
                </button>
                <p className="switch-mode" onClick={() => navigate('/signup')}>
                    Chưa có tài khoản? Đăng ký
                </p>
                <p className="switch-mode" onClick={() => navigate('/ForgotPassword')}>
                    Quên tài khoản?
                </p>
            </form>
        </div>
    );
}

export default Login;