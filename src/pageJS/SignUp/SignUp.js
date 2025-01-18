import React, { useState, useEffect } from 'react';
import { 
    createUserWithEmailAndPassword, 
    sendEmailVerification,
    fetchSignInMethodsForEmail,
    onAuthStateChanged
} from "firebase/auth";
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
    const [resendCooldown, setResendCooldown] = useState(0);
    const [verificationTimer, setVerificationTimer] = useState(300); 
    
    const navigate = useNavigate();

    // Theo dõi trạng thái xác thực email
    useEffect(() => {
        if (isVerifying) {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user?.emailVerified) {
                    handleVerifiedSignUp();
                }
            });

            return () => unsubscribe();
        }
    }, [isVerifying]);

    // Timer đếm ngược cho thời gian xác thực
    useEffect(() => {
        let timer;
        if (isVerifying && verificationTimer > 0) {
            timer = setInterval(() => {
                setVerificationTimer((prev) => prev - 1);
            }, 1000);
        } else if (verificationTimer === 0) {
            setIsVerifying(false);
            toast.error("Hết thời gian xác thực. Vui lòng thử lại.");
        }

        return () => clearInterval(timer);
    }, [isVerifying, verificationTimer]);

    // Timer cho chức năng gửi lại email
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [resendCooldown]);

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
                lastUpdated: serverTimestamp(),
                emailVerified: false 
            };
            await set(ref(database, 'users/' + user.uid), userData);
            return userData;
        } catch (error) {
            console.error("Lỗi khi thêm thông tin người dùng:", error);
            throw error;
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError(null);
    
        // Kiểm tra độ mạnh của mật khẩu
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            setError("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu không khớp");
            return;
        }
    
        try {
            const methods = await fetchSignInMethodsForEmail(auth, email);
            if (methods.length > 0) {
                setError("Email này đã được sử dụng");
                return;
            }
    
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Thêm user vào database
            await addUserToDatabase(user);
            
            // Gửi email xác thực
            await sendEmailVerification(user, {
                url: window.location.origin + '/login', 
                handleCodeInApp: true
            });
            
            toast.success("Email xác nhận đã được gửi. Vui lòng kiểm tra hộp thư của bạn.");
            setIsVerifying(true);
            setResendCooldown(60); 
            
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
            case 'auth/network-request-failed':
                errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối của bạn.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
                break;
            default:
                errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
                console.error(error);
        }
        toast.error(errorMessage);
        setError(errorMessage);
    };

    const resendVerificationEmail = async () => {
        if (resendCooldown > 0) return;
        
        try {
            const user = auth.currentUser;
            if (user) {
                await sendEmailVerification(user, {
                    url: window.location.origin + '/login',
                    handleCodeInApp: true
                });
                toast.success("Đã gửi lại email xác thực!");
                setResendCooldown(60);
                setVerificationTimer(300); 
            }
        } catch (error) {
            handleAuthError(error);
        }
    };

    const handleVerifiedSignUp = async () => {
        try {
            const user = auth.currentUser;
            await user.reload();

            if (user.emailVerified) {
                // Cập nhật trạng thái xác thực trong database
                await set(ref(database, `users/${user.uid}/emailVerified`), true);
                toast.success("Tài khoản đã được xác thực thành công!");
                navigate('/login');
            } else {
                toast.error("Email chưa được xác thực");
            }
        } catch (error) {
            handleAuthError(error);
        }
    };

    if (isVerifying) {
        return (
            <div className="login-container">
                <div className="login-form">
                    <h2>Xác nhận Email</h2>
                    <p>Vui lòng kiểm tra hộp thư của bạn và nhấp vào liên kết xác nhận để hoàn tất quá trình đăng ký.</p>
                    <p>Thời gian còn lại: {Math.floor(verificationTimer / 60)}:{(verificationTimer % 60).toString().padStart(2, '0')}</p>
                    
                    <button 
                        onClick={handleVerifiedSignUp} 
                        className="auth-button"
                    >
                        Đã xác thực email? Hoàn tất đăng ký
                    </button>

                    <button 
                        onClick={resendVerificationEmail}
                        className="auth-button secondary"
                        disabled={resendCooldown > 0}
                    >
                        {resendCooldown > 0 
                            ? `Gửi lại sau ${resendCooldown}s` 
                            : 'Gửi lại email xác thực'}
                    </button>

                    <p className="switch-mode" onClick={() => {
                        setIsVerifying(false);
                        setVerificationTimer(300);
                    }}>
                        Quay lại đăng ký
                    </p>
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
                <button type="submit" className="auth-button">
                    Đăng ký
                </button>
                <p className="switch-mode" onClick={() => navigate('/login')}>
                    Đã có tài khoản? Đăng nhập
                </p>
            </form>
        </div>
    );
}

export default SignUp;