import React from 'react';
import '../../../../pageCSS/Admin/UserListCss/Model/DeleteModelCss.css';

const DeleteModel = ({ onDelete, onCancel }) => {
  return (
    <div className="model-overlay">
      <div className="model-container">
        <h3>Xác nhận xóa</h3>
        <p>Bạn có chắc chắn muốn xóa tài khoản này không?</p>
        <div className="model-buttons">
          <button className="btn-delete" onClick={onDelete}>
            Xóa
          </button>
          <button className="btn-cancel" onClick={onCancel}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModel;