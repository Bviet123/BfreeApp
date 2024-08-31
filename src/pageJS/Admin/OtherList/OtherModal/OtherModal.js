import React from 'react';
import { FaTimes, FaSave, FaTrash } from 'react-icons/fa';
import '../../../../pageCSS/Admin/OtherListCss/OtherModalCss/OtherModalCss.css'; 

// Base Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="close-button">
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

// Add/Edit Category Modal
export const CategoryModal = ({ isOpen, onClose, onSave, editingItem }) => {
  const [name, setName] = React.useState(editingItem?.name || '');
  const [description, setDescription] = React.useState(editingItem?.description || '');

  const handleSave = () => {
    onSave({ id: editingItem?.id, name, description });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? 'Chỉnh sửa Thể loại' : 'Thêm Thể loại mới'}
    >
      <div className="form-group">
        <label htmlFor="name">Tên thể loại</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên thể loại"
        />
      </div>
      <div className="form-group">
        <label htmlFor="description">Mô tả</label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Nhập mô tả"
        />
      </div>
      <div className="modal-actions">
        <button onClick={onClose} className="button secondary">
          Hủy
        </button>
        <button onClick={handleSave} className="button primary">
          <FaSave /> Lưu
        </button>
      </div>
    </Modal>
  );
};

// Add/Edit Producer Modal
export const ProducerModal = ({ isOpen, onClose, onSave, editingItem }) => {
  const [name, setName] = React.useState(editingItem?.name || '');
  const [founded, setFounded] = React.useState(editingItem?.founded || '');
  const [country, setCountry] = React.useState(editingItem?.country || '');

  const handleSave = () => {
    onSave({ id: editingItem?.id, name, founded, country });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? 'Chỉnh sửa Nhà sản xuất' : 'Thêm Nhà sản xuất mới'}
    >
      <div className="form-group">
        <label htmlFor="name">Tên nhà sản xuất</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên nhà sản xuất"
        />
      </div>
      <div className="form-group">
        <label htmlFor="founded">Năm thành lập</label>
        <input
          id="founded"
          type="text"
          value={founded}
          onChange={(e) => setFounded(e.target.value)}
          placeholder="Nhập năm thành lập"
        />
      </div>
      <div className="form-group">
        <label htmlFor="country">Quốc gia</label>
        <input
          id="country"
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Nhập quốc gia"
        />
      </div>
      <div className="modal-actions">
        <button onClick={onClose} className="button secondary">
          Hủy
        </button>
        <button onClick={handleSave} className="button primary">
          <FaSave /> Lưu
        </button>
      </div>
    </Modal>
  );
};

// Delete Confirmation Modal
export const DeleteModal = ({ isOpen, onClose, onConfirm, itemType }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Xóa ${itemType === 'category' ? 'Thể loại' : 'Nhà sản xuất'}`}
    >
      <p className="confirmation-message">Bạn có chắc chắn muốn xóa mục này?</p>
      <div className="modal-actions">
        <button onClick={onClose} className="button secondary">
          Hủy
        </button>
        <button onClick={onConfirm} className="button danger">
          <FaTrash /> Xóa
        </button>
      </div>
    </Modal>
  );
};

export default Modal;