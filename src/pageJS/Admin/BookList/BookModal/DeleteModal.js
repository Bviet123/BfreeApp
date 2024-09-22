import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import '../../../../pageCSS/Admin/BookListCss/BookModalCss/DeleteModalCss.css';

const DeleteBookModal = ({ isOpen, onClose, onConfirm, bookTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <FaExclamationTriangle className="warning-icon" />
          <h3>Xác nhận xóa sách</h3>
        </div>
        <div className="modal-body">
          <p>Bạn có chắc chắn muốn xóa cuốn sách "{bookTitle}" không?</p>
          <p>Hành động này không thể hoàn tác.</p>
        </div>
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>Hủy</button>
          <button className="delete-button" onClick={onConfirm}>Xóa</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBookModal;