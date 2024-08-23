import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { ref, set, get, serverTimestamp } from "firebase/database";
import '../../pageCSS/login/Login.css';
import { auth, database } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState(''); // new field
    const [error, setError] = useState(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [avatar, setAvatar] = useState(null); // new field

    const navigate = useNavigate();

    // Add user to Realtime Database
    const addUserToDatabase = async (user) => {
        try {
            await set(ref(database, 'users/' + user.uid), {
                email: user.email,
                password: user.password, 
                role: "Người dùng", 
                fullName: "",
                birthDate: "",
                gender: "",
                favoriteGenres: { default: "Chưa có" },
                booksRead: { default: "Chưa đọc sách nào" },
                readingGoal: "",
                createdAt: serverTimestamp(),
                lastUpdated: serverTimestamp(),
                avatar: null
            });
            console.log("Thông tin người dùng đã được thêm vào Database");
        } catch (error) {
            console.error("Lỗi khi thêm thông tin người dùng vào Database:", error);
        }
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setError(null);
    
        if (isSignUp && password !== confirmPassword) {
            setError("Mật khẩu không khớp");
            return;
        }
    
        try {
            let userCredential;
            let userInfo;
            if (isSignUp) {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                userInfo = {
                    email: userCredential.user.email,
                    password: password,
                    role: role,
                    uid: userCredential.user.uid,
                    avatar: null
                };
                await addUserToDatabase(userInfo);
                toast.success("Tài khoản đã được tạo thành công!");
                setIsSignUp(false); 
                setEmail(''); 
                setPassword(''); 
                setConfirmPassword(''); 
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
                userInfo = {
                    email: userCredential.user.email,
                    uid: userCredential.user.uid,
                };
                toast.success("Đăng nhập thành công!");
                navigate('/Home', { state: { user: userInfo } });
            }
        } catch (error) {
            handleAuthError(error);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const userInfo = {
                email: result.user.email,
                password: "", 
                role: "", 
                uid: result.user.uid,
                avatar: null
            };
            const userExists = await checkUserExists(userInfo.uid);
            if (!userExists) {
                await addUserToDatabase(userInfo);
            }
            toast.success("Đăng nhập bằng Google thành công!");
            navigate('/Home', { state: { user: userInfo } });
        } catch (error) {
            handleAuthError(error);
        }
    };

    const checkUserExists = async (uid) => {
        const userRef = ref(database, 'users/' + uid);
        const snapshot = await get(userRef);
        return snapshot.exists();
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
            <form onSubmit={handleAuth} className="login-form">
                <h2>{isSignUp ? 'Đăng ký' : 'Đăng nhập'}</h2>
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
                {isSignUp && (
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
                )}
                
                <button type="submit" className="auth-button">
                    {isSignUp ? 'Đăng ký' : 'Đăng nhập'}
                </button>
                <button type="button" onClick={handleGoogleSignIn} className="google-button">
                    <i className="fab fa-google"></i> Đăng nhập bằng Google
                </button>
                <p className="switch-mode" onClick={() => setIsSignUp(!isSignUp)}>
                    {isSignUp ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
                </p>
            </form>
        </div>
    );
}

export default Login;