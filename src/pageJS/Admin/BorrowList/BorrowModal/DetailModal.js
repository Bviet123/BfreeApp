// DetailModal.js
import React from 'react';
import { FaTimes, FaBook, FaUser, FaCalendar } from 'react-icons/fa';
import '../../../../pageCSS/Admin/BorowListCss/BorrowModalCss/DetailModalCss.css';
const DetailModal = ({ isOpen, onClose, data, type }) => {
    if (!isOpen || !data) return null;

    const renderContent = () => {
        switch (type) {
            case 'requests':
                return (
                    <div className="detail-content">
                        <div className="detail-section">
                            <h3><FaBook className="detail-icon" /> Thông tin sách</h3>
                            <p><strong>Tên sách:</strong> {data.title}</p>
                            <p><strong>Mã sách:</strong> {data.bookId}</p>
                        </div>

                        <div className="detail-section">
                            <h3><FaUser className="detail-icon" /> Thông tin người mượn</h3>
                            <p><strong>Người yêu cầu:</strong> {data.requester}</p>
                            <p><strong>Email:</strong> {data.requesterEmail}</p>
                            <p><strong>Số điện thoại:</strong> {data.requesterPhone}</p>
                        </div>

                        <div className="detail-section">
                            <h3><FaCalendar className="detail-icon" /> Thông tin yêu cầu</h3>
                            <p><strong>Ngày yêu cầu:</strong> {new Date(data.requestDate).toLocaleDateString('vi-VN')}</p>
                            <p><strong>Lý do mượn:</strong> {data.reason}</p>
                            <p><strong>Thời gian dự kiến mượn:</strong> {data.expectedDuration} ngày</p>
                        </div>
                    </div>
                );

            case 'borrowed':
                return (
                    <div className="detail-content">
                        <div className="detail-section">
                            <h3><FaBook className="detail-icon" /> Thông tin sách</h3>
                            <p><strong>Tên sách:</strong> {data.title}</p>
                            <p><strong>Mã sách:</strong> {data.bookId}</p>
                        </div>

                        <div className="detail-section">
                            <h3><FaUser className="detail-icon" /> Thông tin người mượn</h3>
                            <p><strong>Người mượn:</strong> {data.borrower}</p>
                            <p><strong>Email:</strong> {data.borrowerEmail}</p>
                            <p><strong>Số điện thoại:</strong> {data.borrowerPhone}</p>
                        </div>

                        <div className="detail-section">
                            <h3><FaCalendar className="detail-icon" /> Thời gian mượn</h3>
                            <p><strong>Ngày mượn:</strong> {new Date(data.borrowDate).toLocaleDateString('vi-VN')}</p>
                            <p><strong>Hạn trả:</strong> {new Date(data.dueDate).toLocaleDateString('vi-VN')}</p>
                            <p><strong>Trạng thái:</strong> {new Date(data.dueDate) < new Date() ? 
                                <span className="text-red-500">Quá hạn</span> : 
                                <span className="text-green-500">Trong hạn</span>}
                            </p>
                        </div>
                    </div>
                );

            case 'returned':
                return (
                    <div className="detail-content">
                        <div className="detail-section">
                            <h3><FaBook className="detail-icon" /> Thông tin sách</h3>
                            <p><strong>Tên sách:</strong> {data.title}</p>
                            <p><strong>Mã sách:</strong> {data.bookId}</p>
                        </div>

                        <div className="detail-section">
                            <h3><FaUser className="detail-icon" /> Thông tin người mượn</h3>
                            <p><strong>Người mượn:</strong> {data.borrower}</p>
                            <p><strong>Email:</strong> {data.borrowerEmail}</p>
                            <p><strong>Số điện thoại:</strong> {data.borrowerPhone}</p>
                        </div>

                        <div className="detail-section">
                            <h3><FaCalendar className="detail-icon" /> Lịch sử mượn trả</h3>
                            <p><strong>Ngày mượn:</strong> {new Date(data.borrowDate).toLocaleDateString('vi-VN')}</p>
                            <p><strong>Ngày trả:</strong> {new Date(data.returnDate).toLocaleDateString('vi-VN')}</p>
                            <p><strong>Tình trạng trả:</strong> {
                                new Date(data.returnDate) <= new Date(data.dueDate) 
                                    ? <span className="text-green-500">Đúng hạn</span>
                                    : <span className="text-red-500">Trễ hạn</span>
                            }</p>
                        </div>
                    </div>
                );

            default:
                return <div>Không có thông tin</div>;
        }
    };

    return (
        <div className="detail-modal-overlay">
            <div className="detail-modal">
                <div className="detail-modal-header">
                    <h2>Chi tiết {
                        type === 'requests' ? 'yêu cầu mượn sách' :
                        type === 'borrowed' ? 'sách đang mượn' : 'sách đã trả'
                    }</h2>
                    <button onClick={onClose} className="close-btn">
                        <FaTimes />
                    </button>
                </div>
                {renderContent()}
                <div className="detail-modal-footer">
                    <button onClick={onClose} className="close-button">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailModal;