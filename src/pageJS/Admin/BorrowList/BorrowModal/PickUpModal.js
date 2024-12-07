import React, { useState } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

const PickupModal = ({ isOpen, onClose, bookTitle, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container pickup-modal">
                <div className="modal-header">
                    <h2>Xác nhận lấy sách</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <div className="modal-content">
                    <p>Bạn có chắc chắn đã lấy sách <strong>"{bookTitle}"</strong> chưa?</p>
                    <div className="modal-description">
                        <p>Sau khi xác nhận, sách sẽ được chuyển vào danh sách sách đang mượn và người mượn sẽ nhận được thông báo.</p>
                    </div>
                </div>
                
                <div className="modal-actions">
                    <button 
                        className="modal-btn cancel-btn" 
                        onClick={onClose}
                    >
                        <FaTimes /> Hủy
                    </button>
                    <button 
                        className="modal-btn confirm-btn" 
                        onClick={onConfirm}
                    >
                        <FaCheck /> Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PickupModal;