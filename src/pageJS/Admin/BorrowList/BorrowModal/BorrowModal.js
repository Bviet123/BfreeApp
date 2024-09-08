import React, { useState } from 'react';
import { FaCheck, FaTimes, FaUndo } from 'react-icons/fa';
import '../../../../pageCSS/Admin/BorowListCss/BorrowModalCss/BorrowModalCss.css';

const BorrowModal = ({ isOpen, onClose, action, bookTitle, onConfirm }) => {
  const [rejectReason, setRejectReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (action === 'reject') {
      onConfirm(rejectReason);
    } else {
      onConfirm();
    }
    onClose();
  };

  const getActionColor = () => {
    switch (action) {
      case 'approve': return 'var(--approve-color, #27ae60)';
      case 'reject': return 'var(--reject-color, #e74c3c)';
      case 'return': return 'var(--return-color, #3498db)';
      default: return 'var(--primary-color, #2c3e50)';
    }
  };

  const getActionIcon = () => {
    switch (action) {
      case 'approve': return <FaCheck />;
      case 'reject': return <FaTimes />;
      case 'return': return <FaUndo />;
      default: return null;
    }
  };

  const getActionText = () => {
    switch (action) {
      case 'approve': return 'Chấp nhận';
      case 'reject': return 'Từ chối';
      case 'return': return 'Trả sách';
      default: return '';
    }
  };

  return (
    <div className="borrow-modal-overlay">
      <div className="borrow-modal-content">
        <h2 className="borrow-modal-title" style={{ color: getActionColor() }}>
          {getActionIcon()} {getActionText()} sách
        </h2>
        <p className="borrow-modal-text">Bạn có chắc chắn muốn {getActionText().toLowerCase()} cuốn sách "{bookTitle}"?</p>
        
        {action === 'reject' && (
          <div className="borrow-modal-reject-reason">
            <label htmlFor="rejectReason">Lý do từ chối:</label>
            <textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
            />
          </div>
        )}

        <div className="borrow-modal-actions">
          <button onClick={onClose} className="borrow-modal-btn borrow-modal-cancel-btn">Hủy</button>
          <button 
            onClick={handleConfirm} 
            className="borrow-modal-btn borrow-modal-confirm-btn"
            style={{ backgroundColor: getActionColor() }}
          >
            {getActionText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BorrowModal;