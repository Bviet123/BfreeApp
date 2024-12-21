import React, { useState } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import '../../../../pageCSS/Admin/BorowListCss/BorrowModalCss/PickUpModalCss.css';

const PickupModal = ({ isOpen, onClose, bookTitle, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="pm-overlay">
            <div className="pm-wrap">
                <div className="pm-head">
                    <h2 className="pm-title">Xác nhận lấy sách</h2>
                    <button className="pm-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <div className="pm-body">
                    <p className="pm-text">Bạn có chắc chắn đã lấy sách <strong>"{bookTitle}"</strong> chưa?</p>
                    <div className="pm-info">
                        <p className="pm-info-text">Sau khi xác nhận, sách sẽ được chuyển vào danh sách sách đang mượn và người mượn sẽ nhận được thông báo.</p>
                    </div>
                </div>
                
                <div className="pm-btns">
                    <button 
                        className="pm-btn pm-cancel" 
                        onClick={onClose}
                    >
                        <FaTimes /> Hủy
                    </button>
                    <button 
                        className="pm-btn pm-confirm" 
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