import React, { useState, useEffect } from 'react';
import { ref, push, update, remove } from 'firebase/database';
import { database } from '../../../../firebaseConfig';
import { countries } from '../../OtherList/Contries';
import '../../../../pageCSS/Admin/AuthorListCss/AuthorModalCss/AuthorModalCss.css';

export function AuthorDetailModal({ isOpen, onClose, author, onEdit }) {
    const [modalClass, setModalClass] = useState('am-modal');

    useEffect(() => {
        setModalClass(isOpen ? 'am-modal am-open' : 'am-modal');
    }, [isOpen]);

    if (!author) return null;

    return (
        <div className={modalClass}>
            <div className="am-content">
                <h2>Chi tiết tác giả</h2>
                <p><strong>Tên:</strong> {author.name}</p>
                <p><strong>Ngày sinh:</strong> {author.birthDate}</p>
                <p><strong>Quốc tịch:</strong> {author.nationality}</p>
                <p><strong>Giới thiệu:</strong> {author.introduction}</p>
                <button onClick={onEdit}>Sửa</button>
                <button type="button" onClick={onClose}>Đóng</button>
            </div>
        </div>
    );
}

export function AuthorFormModal({ isOpen, onClose, author, onSubmit }) {
    const [formData, setFormData] = useState(author || { 
        name: '', 
        birthDate: '', 
        nationality: '', 
        introduction: '' 
    });
    const [modalClass, setModalClass] = useState('am-modal');

    useEffect(() => {
        setModalClass(isOpen ? 'am-modal am-open' : 'am-modal');
        setFormData(author || { 
            name: '', 
            birthDate: '', 
            nationality: '', 
            introduction: '' 
        });
    }, [isOpen, author]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const authorsRef = ref(database, 'authors');
            if (author) {
                await update(ref(database, `authors/${author.id}`), formData);
            } else {
                await push(authorsRef, formData);
            }
            onSubmit(formData);
            onClose();
        } catch (error) {
            console.error("Error adding/updating author: ", error);
        }
    };

    return (
        <div className={modalClass}>
            <div className="am-content">
                <h2>{author ? 'Sửa tác giả' : 'Thêm tác giả'}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Tên tác giả"
                        required
                    />
                    <input
                        name="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={handleChange}
                        required
                    />
                    <select
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Chọn quốc tịch</option>
                        {countries.map((country, index) => (
                            <option key={index} value={country}>
                                {country}
                            </option>
                        ))}
                    </select>
                    <textarea
                        name="introduction"
                        value={formData.introduction}
                        onChange={handleChange}
                        placeholder="Giới thiệu tác giả"
                        required
                    />
                    <div>
                        <button type="submit">Lưu</button>
                        <button type="button" onClick={onClose}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function AuthorDeleteModal({ isOpen, onClose, author, onConfirm }) {
    const [modalClass, setModalClass] = useState('am-modal');

    useEffect(() => {
        setModalClass(isOpen ? 'am-modal am-open' : 'am-modal');
    }, [isOpen]);

    if (!author) return null;

    const handleDelete = async () => {
        try {
            await remove(ref(database, `authors/${author.id}`));
            onConfirm();
            onClose();
        } catch (error) {
            console.error("Error deleting author: ", error);
        }
    };

    return (
        <div className={modalClass}>
            <div className="am-content">
                <div className="am-delete-confirm">
                    <h2>Xác nhận xóa</h2>
                    <p>Bạn có chắc chắn muốn xóa tác giả "{author.name}" không?</p>
                    <button onClick={handleDelete}>Xác nhận</button>
                    <button type="button" onClick={onClose}>Hủy</button>
                </div>
            </div>
        </div>
    );
}