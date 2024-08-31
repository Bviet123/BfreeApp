import React, { useState } from 'react';
import '../../../pageCSS/Admin/AuthorListCss/AuthorListCss.css';
import { FaBars, FaTimes } from 'react-icons/fa';
import Aside from '../Aside/Aside';
import { AuthorDetailModal, AuthorFormModal, AuthorDeleteModal } from './AuthorModal/AuthorModal.js';

// Sample data
const sampleAuthors = [
    { id: 1, name: "Nguyễn Nhật Ánh", birthDate: "1955-05-07", nationality: "Việt Nam", introduction: "Nhà văn nổi tiếng với nhiều tác phẩm văn học thiếu nhi." },
    { id: 2, name: "Tô Hoài", birthDate: "1920-09-27", nationality: "Việt Nam", introduction: "Nhà văn, nhà báo nổi tiếng với tác phẩm Dế Mèn Phiêu Lưu Ký." },
    // ... (other authors)
];

function AuthorList() {
    const [authors, setAuthors] = useState(sampleAuthors);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [authorsPerPage] = useState(5);
    const [isAsideVisible, setIsAsideVisible] = useState(true);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedAuthor, setSelectedAuthor] = useState(null);

    const toggleAside = () => {
        setIsAsideVisible(!isAsideVisible);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const filteredAuthors = authors.filter((author) =>
        author.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastAuthor = currentPage * authorsPerPage;
    const indexOfFirstAuthor = indexOfLastAuthor - authorsPerPage;
    const currentAuthors = filteredAuthors.slice(indexOfFirstAuthor, indexOfLastAuthor);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleAdd = () => {
        setSelectedAuthor(null);
        setFormModalOpen(true);
    };

    const handleDetails = (author) => {
        setSelectedAuthor(author);
        setDetailModalOpen(true);
    };

    const handleEdit = () => {
        setDetailModalOpen(false);
        setFormModalOpen(true);
    };

    const handleDeleteClick = (author) => {
        setSelectedAuthor(author);
        setDeleteModalOpen(true);
    };

    const handleDelete = (authorId) => {
        setAuthors(authors.filter(author => author.id !== authorId));
        setDeleteModalOpen(false);
    };

    const handleSubmit = (authorData) => {
        if (selectedAuthor) {
            setAuthors(authors.map(author =>
                author.id === selectedAuthor.id ? { ...author, ...authorData } : author
            ));
        } else {
            setAuthors([...authors, { id: authors.length + 1, ...authorData }]);
        }
        setFormModalOpen(false);
    };

    return (
        <div className="author-list-container">
            {isAsideVisible && <Aside />}
            <div className={`author-list-main ${isAsideVisible ? '' : 'full-width'}`}>
                <div className="author-list-header">
                    <div className='author-list-toggle'>
                        <button className="toggle-aside-btn" onClick={toggleAside}>
                            {isAsideVisible ? <FaTimes /> : <FaBars />}
                        </button>
                        <h2>Danh sách tác giả</h2>
                    </div>
                    <div className="author-list-actions">
                        <button className="btn-add" onClick={handleAdd}>
                            Thêm tác giả
                        </button>
                    </div>
                </div>

                <div className="author-list-search">
                    <input
                        type="text"
                        placeholder="Tìm kiếm tác giả..."
                        value={searchTerm}
                        onChange={handleSearch}
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
                                <td>{author.birthDate}</td>
                                <td>{author.nationality}</td>
                                <td>
                                    <button className="btn-details" onClick={() => handleDetails(author)}>
                                        Chi tiết
                                    </button>
                                    <button className="btn-delete" onClick={() => handleDeleteClick(author)}>
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="pagination">
                    {Array.from({ length: Math.ceil(filteredAuthors.length / authorsPerPage) }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => paginate(index + 1)}
                            className={currentPage === index + 1 ? 'active' : ''}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>

            <AuthorDetailModal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                author={selectedAuthor}
                onEdit={handleEdit}
            />

            <AuthorFormModal
                isOpen={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                author={selectedAuthor}
                onSubmit={handleSubmit}
            />

            <AuthorDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                author={selectedAuthor}
                onConfirm={handleDelete}
            />
        </div>
    );
}

export default AuthorList;