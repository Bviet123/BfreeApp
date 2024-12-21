import React, { useState, useEffect } from 'react';
import '../../../pageCSS/Admin/AuthorListCss/AuthorListCss.css';
import { FaBars, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Aside from '../Aside/Aside';
import { AuthorDetailModal, AuthorFormModal, AuthorDeleteModal } from './AuthorModal/AuthorModal.js';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../firebaseConfig';
import DateFormatter from '../../../Format/DateFormatter';

function AuthorList() {
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

    const totalPages = Math.ceil(filteredAuthors.length / authorsPerPage);
    const indexOfLastAuthor = currentPage * authorsPerPage;
    const indexOfFirstAuthor = indexOfLastAuthor - authorsPerPage;
    const currentAuthors = filteredAuthors.slice(indexOfFirstAuthor, indexOfLastAuthor);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleAdd = () => {
        setSelectedAuthor(null);
        setFormModalOpen(true);
    };

    const handleDetails = (author) => {
        setSelectedAuthor(author);
        setDetailModalOpen(true);
    };

    const handleEdit = (author) => {
        setSelectedAuthor(author);
        setDetailModalOpen(false);
        setFormModalOpen(true);
    };

    const handleDeleteClick = (author) => {
        setSelectedAuthor(author);
        setDeleteModalOpen(true);
    };

    const handleSubmit = () => {
        setFormModalOpen(false);
    };

    const handleDelete = () => {
        setDeleteModalOpen(false);
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
                                <td>
                                    <DateFormatter
                                        dateString={author.birthDate}
                                        format="DD/MM/YYYY"
                                        showError={true}
                                    />
                                </td>
                                <td>{author.nationality}</td>
                                <td>
                                    <button className="btn-details" onClick={() => handleDetails(author)}>
                                        Chi tiết
                                    </button>
                                    <button className="btn-edit" onClick={() => handleEdit(author)}>
                                        Sửa
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
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <FaChevronLeft />
                    </button>
                    <span>{currentPage} / {totalPages}</span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>

            <AuthorDetailModal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                author={selectedAuthor}
                onEdit={() => handleEdit(selectedAuthor)}
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