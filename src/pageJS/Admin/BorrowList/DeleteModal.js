import React from 'react';
import { FaTimes } from 'react-icons/fa';
import '../../../pageCSS/Admin/BorowListCss/BorrowModalCss/DeleteModalCss.css'

function DeleteModal({ isOpen, onClose, book, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div className="del-overlay">
            <div className="del-box">
                <button className="del-close" onClick={onClose}>
                    <FaTimes />
                </button>
                <h2>Xác nhận xóa sách</h2>
                <p>Bạn có chắc chắn muốn xóa sách "{book.title}" khỏi danh sách sách đã trả không?</p>
                <div className="del-actions">
                    <button onClick={onClose} className="del-cancel">Hủy</button>
                    <button onClick={onConfirm} className="del-confirm">Xác nhận xóa</button>
                </div>
            </div>
        </div>
    );
}

export default DeleteModal;