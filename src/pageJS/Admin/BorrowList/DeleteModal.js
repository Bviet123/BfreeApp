import React from 'react';
import { FaTimes } from 'react-icons/fa';

function DeleteModal({ isOpen, onClose, book, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-modal" onClick={onClose}>
                    <FaTimes />
                </button>
                <h2>Xác nhận xóa sách</h2>
                <p>Bạn có chắc chắn muốn xóa sách "{book.title}" khỏi danh sách sách đã trả không?</p>
                <div className="modal-actions">
                    <button onClick={onClose} className="cancel-btn">Hủy</button>
                    <button onClick={onConfirm} className="confirm-btn">Xác nhận xóa</button>
                </div>
            </div>
        </div>
    );
}

export default DeleteModal;