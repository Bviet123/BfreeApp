import React from 'react';
import { useNavigate } from 'react-router-dom';
import './pageCSS/ErrorPageCss.css';

const NotFound = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate('/home');
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Trang không tồn tại</h2>
        <p className="not-found-text">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <button className="home-button" onClick={handleBackHome}>
          Về trang chủ
        </button>
      </div>
    </div>
  );
};

export default NotFound;