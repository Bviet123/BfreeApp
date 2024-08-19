import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import '../../pageCSS/login/Login.css';
import { auth } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (isSignUp && password !== confirmPassword) {
          setError("Mật khẩu không khớp");
          return;
        }
        
        try {
          let userCredential;
          if (isSignUp) {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("Tài khoản đã được tạo thành công");
          } else {
            userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Đăng nhập thành công");
          }
          // Chỉ truyền những thông tin cần thiết
          const userInfo = {
            email: userCredential.user.email,
            uid: userCredential.user.uid,
            displayName: userCredential.user.displayName
          };
          navigate('/Home', { state: { user: userInfo } });
        } catch (error) {
          handleAuthError(error);
        }
      };
      
      const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
          const result = await signInWithPopup(auth, provider);
          console.log("Đăng nhập bằng Google thành công");
          // Chỉ truyền những thông tin cần thiết
          const userInfo = {
            email: result.user.email,
            uid: result.user.uid,
            displayName: result.user.displayName
          };
          navigate('/Home', { state: { user: userInfo } });
        } catch (error) {
          handleAuthError(error);
        }
      };


    const handleAuthError = (error) => {
        switch (error.code) {
            case 'auth/email-already-in-use':
                setError('Email này đã được sử dụng. Vui lòng chọn email khác.');
                break;
            case 'auth/invalid-email':
                setError('Email không hợp lệ. Vui lòng kiểm tra lại.');
                break;
            case 'auth/weak-password':
                setError('Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.');
                break;
            case 'auth/user-not-found':
                setError('Tài khoản không tồn tại. Vui lòng kiểm tra lại email hoặc đăng ký mới.');
                break;
            case 'auth/wrong-password':
                setError('Mật khẩu không đúng. Vui lòng thử lại.');
                break;
            case 'auth/popup-closed-by-user':
                setError('Đăng nhập bằng Google bị hủy. Vui lòng thử lại.');
                break;
            default:
                setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
                console.error(error);
        }
    };

    return (
        <div className="login-container">
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