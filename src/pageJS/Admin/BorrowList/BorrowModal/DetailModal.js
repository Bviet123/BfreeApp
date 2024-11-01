import React from 'react';
import { FaTimes, FaBook, FaUser, FaCalendar, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import '../../../../pageCSS/Admin/BorowListCss/BorrowModalCss/DetailModalCss.css';

const DetailModal = ({ isOpen, onClose, data, type }) => {
    if (!isOpen || !data) return null;

    const getDueStatus = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return { 
                text: 'Quá hạn', 
                className: 'ad-status-overdue',
                icon: <FaExclamationCircle className="ad-status-icon" />
            };
        } else if (diffDays <= 3) {
            return { 
                text: `Còn ${diffDays} ngày`, 
                className: 'ad-status-warning',
                icon: <FaClock className="ad-status-icon" />
            };
        } else {
            return { 
                text: 'Trong hạn', 
                className: 'ad-status-ontime',
                icon: <FaCheckCircle className="ad-status-icon" />
            };
        }
    };

    const getReturnStatus = (returnDate, dueDate) => {
        const returnTime = new Date(returnDate);
        const dueTime = new Date(dueDate);
        
        if (returnTime <= dueTime) {
            return {
                text: 'Đã trả đúng hạn',
                className: 'ad-status-ontime',
                icon: <FaCheckCircle className="ad-status-icon" />
            };
        } else {
            const diffTime = returnTime - dueTime;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return {
                text: `Trả trễ ${diffDays} ngày`,
                className: 'ad-status-overdue',
                icon: <FaExclamationCircle className="ad-status-icon" />
            };
        }
    };

    const renderBorrowedContent = () => {
        const status = getDueStatus(data.dueDate);
        const borrowDuration = Math.ceil(
            (new Date(data.dueDate) - new Date(data.borrowDate)) / (1000 * 60 * 60 * 24)
        );
        
        return (
            <div className="ad-detail-content">
                <div className="ad-detail-section">
                    <h3 className="ad-section-title">
                        <FaBook className="ad-section-icon" /> 
                        Thông tin sách
                    </h3>
                    <div className="ad-info-grid">
                        <div className="ad-info-item">
                            <label>Tên sách:</label>
                            <span>{data.title}</span>
                        </div>
                        <div className="ad-info-item">
                            <label>Mã sách:</label>
                            <span>{data.bookId}</span>
                        </div>
                        {data.author && (
                            <div className="ad-info-item">
                                <label>Tác giả:</label>
                                <span>{data.author}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="ad-detail-section">
                    <h3 className="ad-section-title">
                        <FaUser className="ad-section-icon" /> 
                        Thông tin người mượn
                    </h3>
                    <div className="ad-info-grid">
                        <div className="ad-info-item">
                            <label>Người mượn:</label>
                            <span>{data.borrower}</span>
                        </div>
                        <div className="ad-info-item">
                            <label>Email:</label>
                            <span>{data.borrowerEmail}</span>
                        </div>
                        <div className="ad-info-item">
                            <label>Số điện thoại:</label>
                            <span>{data.borrowerPhone || 'Không có'}</span>
                        </div>
                    </div>
                </div>

                <div className="ad-detail-section">
                    <h3 className="ad-section-title">
                        <FaClock className="ad-section-icon" /> 
                        Thông tin mượn sách
                    </h3>
                    <div className="ad-info-grid">
                        <div className="ad-info-item">
                            <label>Ngày mượn:</label>
                            <span>{new Date(data.borrowDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="ad-info-item">
                            <label>Hạn trả:</label>
                            <span>{new Date(data.dueDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="ad-info-item">
                            <label>Thời hạn mượn:</label>
                            <span>{borrowDuration} ngày</span>
                        </div>
                        <div className="ad-info-item">
                            <label>Trạng thái:</label>
                            <div className={`ad-status-display ${status.className}`}>
                                {status.icon}
                                <span>{status.text}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderReturnedContent = () => {
        const status = getReturnStatus(data.returnDate, data.dueDate);
        const actualDuration = Math.ceil(
            (new Date(data.returnDate) - new Date(data.borrowDate)) / (1000 * 60 * 60 * 24)
        );

        return (
            <div className="ad-detail-content">
                <div className="ad-detail-section">
                    <h3 className="ad-section-title">
                        <FaBook className="ad-section-icon" /> 
                        Thông tin sách
                    </h3>
                    <div className="ad-info-grid">
                        <div className="ad-info-item">
                            <label>Tên sách:</label>
                            <span>{data.title}</span>
                        </div>
                        <div className="ad-info-item">
                            <label>Mã sách:</label>
                            <span>{data.bookId}</span>
                        </div>
                        {data.author && (
                            <div className="ad-info-item">
                                <label>Tác giả:</label>
                                <span>{data.author}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="ad-detail-section">
                    <h3 className="ad-section-title">
                        <FaUser className="ad-section-icon" /> 
                        Thông tin người mượn
                    </h3>
                    <div className="ad-info-grid">
                        <div className="ad-info-item">
                            <label>Người mượn:</label>
                            <span>{data.borrower}</span>
                        </div>
                        <div className="ad-info-item">
                            <label>Email:</label>
                            <span>{data.borrowerEmail}</span>
                        </div>
                        <div className="ad-info-item">
                            <label>Số điện thoại:</label>
                            <span>{data.borrowerPhone || 'Không có'}</span>
                        </div>
                    </div>
                </div>

                <div className="ad-detail-section">
                    <h3 className="ad-section-title">
                        <FaCalendar className="ad-section-icon" /> 
                        Lịch sử mượn trả
                    </h3>
                    <div className="ad-info-grid">
                        <div className="ad-info-item">
                            <label>Ngày mượn:</label>
                            <span>{new Date(data.borrowDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="ad-info-item">
                            <label>Ngày trả:</label>
                            <span>{new Date(data.returnDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="ad-info-item">
                            <label>Thời gian đã mượn:</label>
                            <span>{actualDuration} ngày</span>
                        </div>
                        <div className="ad-info-item">
                            <label>Tình trạng trả:</label>
                            <div className={`ad-status-display ${status.className}`}>
                                {status.icon}
                                <span>{status.text}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="ad-detail-modal-overlay">
            <div className="ad-detail-modal">
                <div className="ad-detail-modal-header">
                    <h2>Chi tiết {
                        type === 'requests' ? 'yêu cầu mượn sách' :
                        type === 'borrowed' ? 'sách đang mượn' : 'sách đã trả'
                    }</h2>
                    <button onClick={onClose} className="ad-close-btn">
                        <FaTimes />
                    </button>
                </div>
                {type === 'borrowed' ? renderBorrowedContent() : renderReturnedContent()}
                <div className="ad-detail-modal-footer">
                    <button onClick={onClose} className="ad-close-button">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailModal;