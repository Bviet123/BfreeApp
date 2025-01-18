import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronLeft, ChevronRight, Search, Plus, Info, Edit, Trash2 } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../firebaseConfig';
import DateFormatter from '../../../Format/DateFormatter';
import Aside from '../Aside/Aside';
import { AuthorDetailModal, AuthorFormModal, AuthorDeleteModal } from './AuthorModal/AuthorModal.js';
import '../../../pageCSS/Admin/AuthorListCss/AuthorListCss.css';

const AuthorList = () => {
    const [authors, setAuthors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [authorsPerPage] = useState(4);
    const [isAsideVisible, setIsAsideVisible] = useState(true);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedAuthor, setSelectedAuthor] = useState(null);

    useEffect(() => {
        const authorsRef = ref(database, 'authors');
        onValue(authorsRef, (snapshot) => {
            const data = snapshot.val();
            const authorList = data ? Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })) : [];
            setAuthors(authorList);
        });
    }, []);

    const filteredAuthors = authors.filter((author) =>
        author.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredAuthors.length / authorsPerPage);
    const currentAuthors = filteredAuthors.slice(
        (currentPage - 1) * authorsPerPage,
        currentPage * authorsPerPage
    );

    return (
        <div className="author-list-container">
            {isAsideVisible && <Aside />}

            <div className={`author-list-main ${isAsideVisible ? '' : 'full-width'}`}>
                <div className="author-list-header">
                    <div className="author-list-toggle">
                        <button
                            className="toggle-aside-btn"
                            onClick={() => setIsAsideVisible(!isAsideVisible)}
                        >
                            {isAsideVisible ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <h2>Danh sách tác giả</h2>
                    </div>

                    <div className="author-list-actions">
                        <button
                            className="btn-add"
                            onClick={() => {
                                setSelectedAuthor(null);
                                setFormModalOpen(true);
                            }}
                        >
                            <Plus size={18} className="icon-margin" />
                            Thêm tác giả
                        </button>
                    </div>
                </div>

                <div className="author-list-search">
                    <input
                        type="text"
                        placeholder="Tìm kiếm tác giả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Ngày sinh</th>
                            <th>Quốc tịch</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentAuthors.map((author) => (
                            <tr key={author.id}>
                                <td>{author.name}</td>
                                <td>
                                    <DateFormatter
                                        dateString={author.birthDate}
                                        format="DD/MM/YYYY"
                                        showError={true}
                                    />
                                </td>
                                <td>{author.nationality}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-details">
                                            <Info size={18} />
                                            Chi tiết
                                        </button>
                                        <button className="btn-edit">
                                            <Edit size={18} />
                                            Sửa
                                        </button>
                                        <button className="btn-delete">
                                            <Trash2 size={18} />
                                            Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={currentPage === 1 ? 'disabled' : ''}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span>{currentPage} / {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={currentPage === totalPages ? 'disabled' : ''}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <AuthorDetailModal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                author={selectedAuthor}
                onEdit={() => {
                    setDetailModalOpen(false);
                    setFormModalOpen(true);
                }}
            />

            <AuthorFormModal
                isOpen={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                author={selectedAuthor}
                onSubmit={() => setFormModalOpen(false)}
            />

            <AuthorDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                author={selectedAuthor}
                onConfirm={() => setDeleteModalOpen(false)}
            />
        </div>
    );
};

export default AuthorList;