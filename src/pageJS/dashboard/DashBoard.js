import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';

function Dashboard() {
  const location = useLocation();
  const user = location.state?.user;

  // Nếu không có thông tin người dùng, chuyển hướng về trang đăng nhập
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <h1>Chào mừng đến với Dashboard</h1>
      <p>Tài khoản đăng nhập: {user.email}</p>
      {user.displayName && <p>Tên hiển thị: {user.displayName}</p>}
      <p>UID: {user.uid}</p>
    </div>
  );
}

export default Dashboard;