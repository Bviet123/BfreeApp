import React, { useState, useEffect } from 'react';
import '../../../../pageCSS/Admin/AuthorListCss/AuthorModalCss/AuthorModalCss.css';
import { ref, push, update, remove } from 'firebase/database';
import { database } from '../../../../firebaseConfig';

export function AuthorDetailModal({ isOpen, onClose, author, onEdit }) {
    const [modalClass, setModalClass] = useState('modal');

    useEffect(() => {
        if (isOpen) {
            setModalClass('modal open');
        } else {
            setModalClass('modal');
        }
    }, [isOpen]);

    if (!author) return null;

    return (
        <div className={modalClass}>
            <div className="modal-content">
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
    const [formData, setFormData] = useState(author || { name: '', birthDate: '', nationality: '', introduction: '' });
    const [modalClass, setModalClass] = useState('modal');

    useEffect(() => {
        if (isOpen) {
            setModalClass('modal open');
            setFormData(author || { name: '', birthDate: '', nationality: '', introduction: '' });
        } else {
            setModalClass('modal');
        }
    }, [isOpen, author]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (author) {
                // Updating existing author
                const authorRef = ref(database, `authors/${author.id}`);
                await update(authorRef, formData);
            } else {
                // Adding new author
                const authorsRef = ref(database, 'authors');
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
            <div className="modal-content">
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
                    <input
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        placeholder="Quốc tịch"
                        required
                    />
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
    const [modalClass, setModalClass] = useState('modal');

    useEffect(() => {
        if (isOpen) {
            setModalClass('modal open');
        } else {
            setModalClass('modal');
        }
    }, [isOpen]);

    if (!author) return null;

    const handleDelete = async () => {
        try {
            const authorRef = ref(database, `authors/${author.id}`);
            await remove(authorRef);
            onConfirm();
            onClose();
        } catch (error) {
            console.error("Error deleting author: ", error);
        }
    };

    return (
        <div className={modalClass}>
            <div className="modal-content">
                <div className="delete-confirmation">
                    <h2>Xác nhận xóa</h2>
                    <p>Bạn có chắc chắn muốn xóa tác giả "{author.name}" không?</p>
                    <button onClick={handleDelete}>Xác nhận</button>
                    <button type="button" onClick={onClose}>Hủy</button>
                </div>
            </div>
        </div>
    );
}