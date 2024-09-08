import React, { useState, useEffect } from 'react';
import { FaSave, FaTrash } from 'react-icons/fa';
import '../../../../pageCSS/Admin/OtherListCss/OtherModalCss/OtherModalCss.css'; 
import { countries } from '../Contries';

// Base Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

// Add/Edit Category Modal
export const CategoryModal = ({ isOpen, onClose, onSave, editingItem }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        // Nếu đang chỉnh sửa, điền thông tin của mục vào các trường
        setName(editingItem.name || '');
        setDescription(editingItem.description || '');
      } else {
        // Nếu đang thêm mới, làm mới các trường
        setName('');
        setDescription('');
      }
    }
  }, [isOpen, editingItem]);

  const handleSave = () => {
    const categoryData = {
      name: name.trim(),
      description: description.trim()
    };
    if (editingItem) {
      categoryData.id = editingItem.id;
    }
    onSave(categoryData);
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
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Nhập mô tả"
          rows="3"
        />
      </div>
      <div className="modal-actions">
        <button onClick={onClose} className="button secondary">
          Hủy
        </button>
        <button onClick={handleSave} className="button primary" disabled={!name.trim()}>
          <FaSave /> Lưu
        </button>
      </div>
    </Modal>
  );
};


// Add/Edit Producer Modal
export const ProducerModal = ({ isOpen, onClose, onSave, editingItem }) => {
  const [name, setName] = useState('');
  const [founded, setFounded] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        // Nếu đang chỉnh sửa, điền thông tin của mục vào các trường
        setName(editingItem.name || '');
        setFounded(editingItem.founded || '');
        setCountry(editingItem.country || '');
        setDescription(editingItem.description || '');
      } else {
        // Nếu đang thêm mới, làm mới tất cả các trường
        setName('');
        setFounded('');
        setCountry('');
        setDescription('');
      }
    }
  }, [isOpen, editingItem]);

  const handleSave = () => {
    const producerData = {
      name: name.trim(),
      founded: founded.trim(),
      country: country,
      description: description.trim()
    };
    if (editingItem) {
      producerData.id = editingItem.id;
    }
    onSave(producerData);
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
        <select
          id="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="">Chọn quốc gia</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="description">Mô tả</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Nhập mô tả về nhà sản xuất"
          rows="3"
        />
      </div>
      <div className="modal-actions">
        <button onClick={onClose} className="button secondary">
          Hủy
        </button>
        <button onClick={handleSave} className="button primary" disabled={!name.trim()}>
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
      <p className="warning-message">Lưu ý: Hành động này không thể hoàn tác.</p>
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