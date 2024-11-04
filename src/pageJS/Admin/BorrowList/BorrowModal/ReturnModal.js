import React, { useState } from 'react';
import { FaUndo, FaUser, FaCalendar, FaHistory, FaBookOpen, FaComment } from 'react-icons/fa';
import '../../../../pageCSS/Admin/BorowListCss/BorrowModalCss/ReturnModalCss.css';

const ReturnModal = ({ isOpen, onClose, book, onConfirm }) => {
    const [bookStatus, setBookStatus] = useState('good');
    const [notes, setNotes] = useState('');

    if (!isOpen || !book) return null;

    const {
        title,
        borrowDate,
        dueDate,
        borrowCount = 0,
        requesterId,
    } = book;

    const isOverdue = new Date(dueDate) < new Date();

    const handleConfirm = () => {
        onConfirm({
            title,
            borrowDate,
            dueDate,
            borrowCount,
            requesterId,
            bookId: book.bookId,
            bookStatus,
            notes
        });
        onClose();
    };

    return (
        <div className="rm-overlay">
            <div className="rm-content">
                <h2 className="rm-title">
                    <FaUndo className="rm-icon" /> Trả sách
                </h2>
                
                <p className="rm-text">
                    Bạn có chắc chắn muốn xác nhận trả cuốn sách "{title}"?
                </p>

                <div className="rm-info">
                    <div className="rm-info-row">
                        <div className="rm-info-label">
                            <FaCalendar className="rm-info-icon" />
                            <strong>Ngày mượn:</strong>
                        </div>
                        <p>{new Date(borrowDate).toLocaleDateString('vi-VN')}</p>
                    </div>

                    <div className="rm-info-row">
                        <div className="rm-info-label">
                            <FaCalendar className="rm-info-icon" />
                            <strong>Hạn trả:</strong>
                        </div>
                        <p className={isOverdue ? 'rm-overdue' : ''}>
                            {new Date(dueDate).toLocaleDateString('vi-VN')}
                            {isOverdue && ' (Quá hạn)'}
                        </p>
                    </div>

                    <div className="rm-info-row">
                        <div className="rm-info-label">
                            <FaHistory className="rm-info-icon" />
                            <strong>Số lần gia hạn:</strong>
                        </div>
                        <p>{borrowCount}</p>
                    </div>

                    <div className="rm-info-row">
                        <div className="rm-info-label">
                            <FaBookOpen className="rm-info-icon" />
                            <strong>Trạng thái sách:</strong>
                        </div>
                        <select 
                            value={bookStatus}
                            onChange={(e) => setBookStatus(e.target.value)}
                            className="rm-status-select"
                        >
                            <option value="good">Tốt</option>
                            <option value="damaged">Hư hỏng nhẹ</option>
                            <option value="heavily_damaged">Hư hỏng nặng</option>
                            <option value="lost">Mất sách</option>
                        </select>
                    </div>

                    <div className="rm-info-row">
                        <div className="rm-info-label">
                            <FaComment className="rm-info-icon" />
                            <strong>Ghi chú:</strong>
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="rm-notes-textarea"
                            placeholder="Nhập ghi chú về tình trạng sách (nếu có)..."
                            rows="3"
                        />
                    </div>
                </div>

                <div className="rm-actions">
                    <button 
                        onClick={onClose} 
                        className="rm-btn rm-btn-cancel"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className="rm-btn rm-btn-confirm"
                    >
                        Xác nhận trả sách
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReturnModal;