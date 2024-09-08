import React from 'react';
import { FaUndo } from 'react-icons/fa';
import '../../../../pageCSS/Admin/BorowListCss/BorrowModalCss/ReturnModalCss.css';

const ReturnModal = ({ isOpen, onClose, book, onConfirm }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(book.id);
    onClose();
  };

  return (
    <div className="return-book-modal-overlay">
      <div className="return-book-modal-content">
        <h2 className="return-book-modal-title">
          <FaUndo /> Trả sách
        </h2>
        <p className="return-book-modal-text">
          Bạn có chắc chắn muốn xác nhận trả cuốn sách "{book.title}"?
        </p>
        <div className="return-book-modal-info">
          <p><strong>Người mượn:</strong> {book.borrower}</p>
          <p><strong>Ngày mượn:</strong> {book.borrowDate}</p>
          <p><strong>Hạn trả:</strong> {book.dueDate}</p>
        </div>
        <div className="return-book-modal-actions">
          <button onClick={onClose} className="return-book-modal-btn return-book-modal-cancel-btn">Hủy</button>
          <button 
            onClick={handleConfirm} 
            className="return-book-modal-btn return-book-modal-confirm-btn"
          >
            Xác nhận trả sách
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnModal;