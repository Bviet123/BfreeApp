import React, { useState } from 'react';
import { FaBars, FaTimes, FaPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Aside from '../Aside/Aside';
import { CategoryModal, ProducerModal, DeleteModal } from '../OtherList/OtherModal/OtherModal.js';
import '../../../pageCSS/Admin/OtherListCss/OtherListCss.css';

// Sample data (you may want to fetch this from an API in a real application)
const sampleCategories = [
    { id: 1, name: "Tiểu thuyết", description: "Tác phẩm văn học dài" },
    { id: 2, name: "Truyện ngắn", description: "Tác phẩm văn học ngắn" },
    { id: 3, name: "Thơ", description: "Tác phẩm văn vần" },
    { id: 4, name: "Sách giáo khoa", description: "Sách học tập" },
    { id: 5, name: "Sách tham khảo", description: "Sách bổ trợ kiến thức" },
    { id: 6, name: "Truyện tranh", description: "Tác phẩm kết hợp hình ảnh và chữ viết" },
];

const sampleProducers = [
    { id: 1, name: "NXB Kim Đồng", founded: "1957", country: "Việt Nam" },
    { id: 2, name: "NXB Trẻ", founded: "1981", country: "Việt Nam" },
    { id: 3, name: "NXB Giáo dục", founded: "1957", country: "Việt Nam" },
];

const ITEMS_PER_PAGE = 5;

function OtherList() {
    const [categories, setCategories] = useState(sampleCategories);
    const [producers, setProducers] = useState(sampleProducers);
    const [categorySearch, setCategorySearch] = useState('');
    const [producerSearch, setProducerSearch] = useState('');
    const [isAsideVisible, setIsAsideVisible] = useState(true);
    const [categoryPage, setCategoryPage] = useState(1);
    const [producerPage, setProducerPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [editingItem, setEditingItem] = useState(null);

    const toggleAside = () => {
        setIsAsideVisible(!isAsideVisible);
    };

    const handleSearch = (event, type) => {
        const searchValue = event.target.value;
        if (type === 'category') {
            setCategorySearch(searchValue);
            setCategoryPage(1);
        } else {
            setProducerSearch(searchValue);
            setProducerPage(1);
        }
    };

    const filteredItems = (items, searchTerm) => {
        return items.filter((item) => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const paginateItems = (items, page) => {
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    };

    const handlePageChange = (type, newPage) => {
        if (type === 'category') {
            setCategoryPage(newPage);
        } else {
            setProducerPage(newPage);
        }
    };

    const openModal = (type, item = null) => {
        setModalType(type);
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleAdd = (type) => {
        openModal(type === 'category' ? 'addCategory' : 'addProducer');
    };

    const handleEdit = (type, item) => {
        openModal(type === 'category' ? 'editCategory' : 'editProducer', item);
    };

    const handleDelete = (type, itemId) => {
        openModal('delete', { id: itemId, type });
    };

    const handleSave = (item) => {
        if (modalType.includes('Category')) {
            const updatedCategories = modalType === 'editCategory'
                ? categories.map(cat => cat.id === item.id ? item : cat)
                : [...categories, { ...item, id: Date.now() }];
            setCategories(updatedCategories);
        } else if (modalType.includes('Producer')) {
            const updatedProducers = modalType === 'editProducer'
                ? producers.map(prod => prod.id === item.id ? item : prod)
                : [...producers, { ...item, id: Date.now() }];
            setProducers(updatedProducers);
        }
        closeModal();
    };

    const handleConfirmDelete = () => {
        if (editingItem.type === 'category') {
            setCategories(categories.filter(category => category.id !== editingItem.id));
        } else {
            setProducers(producers.filter(producer => producer.id !== editingItem.id));
        }
        closeModal();
    };

    const renderPagination = (items, currentPage, type) => {
        const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
        
        return (
            <div className="pagination">
                <button 
                    onClick={() => handlePageChange(type, currentPage - 1)} 
                    disabled={currentPage === 1}
                >
                    <FaChevronLeft />
                </button>
                <span>{currentPage} / {totalPages}</span>
                <button 
                    onClick={() => handlePageChange(type, currentPage + 1)} 
                    disabled={currentPage === totalPages}
                >
                    <FaChevronRight />
                </button>
            </div>
        );
    };

    const renderList = (items, type, currentPage) => (
        <>
            <ul className="item-list">
                {paginateItems(items, currentPage).map((item) => (
                    <li key={item.id} className="list-item">
                        <div className="item-info">
                            <strong>{item.name}</strong>
                            {type === 'category' && <span>{item.description}</span>}
                            {type === 'producer' && (
                                <>
                                    <span>Năm thành lập: {item.founded}</span>
                                    <span>Quốc gia: {item.country}</span>
                                </>
                            )}
                        </div>
                        <div className="item-actions">
                            <button className="btnOther-edit" onClick={() => handleEdit(type, item)}>
                                <FaEdit />
                            </button>
                            <button className="btnOther-delete" onClick={() => handleDelete(type, item.id)}>
                                <FaTrash />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            {renderPagination(items, currentPage, type)}
        </>
    );

    const filteredCategories = filteredItems(categories, categorySearch);
    const filteredProducers = filteredItems(producers, producerSearch);

    return (
        <div className="other-list-container">
            {isAsideVisible && <Aside />}
            <div className={`other-list-main ${isAsideVisible ? '' : 'full-width'}`}>
                <div className="other-list-header">
                    <div className='management-toggle'>
                        <button className="toggle-aside-btn" onClick={toggleAside}>
                            {isAsideVisible ? <FaTimes /> : <FaBars />}
                        </button>
                        <h2>Quản lý Thể loại và Nhà sản xuất</h2>
                    </div>
                </div>

                <div className="other-list-content">
                    <div className="list-column">
                        <h3>Thể loại</h3>
                        <div className="list-actions">
                            <input
                                type="text"
                                placeholder="Tìm kiếm thể loại..."
                                value={categorySearch}
                                onChange={(e) => handleSearch(e, 'category')}
                            />
                            <button className="btnOther-add" onClick={() => handleAdd('category')}>
                                <FaPlus /> Thêm thể loại
                            </button>
                        </div>
                        {renderList(filteredCategories, 'category', categoryPage)}
                    </div>

                    <div className="list-column">
                        <h3>Nhà sản xuất</h3>
                        <div className="list-actions">
                            <input
                                type="text"
                                placeholder="Tìm kiếm nhà sản xuất..."
                                value={producerSearch}
                                onChange={(e) => handleSearch(e, 'producer')}
                            />
                            <button className="btnOther-add" onClick={() => handleAdd('producer')}>
                                <FaPlus /> Thêm NSX
                            </button>
                        </div>
                        {renderList(filteredProducers, 'producer', producerPage)}
                    </div>
                </div>

                <CategoryModal
                    isOpen={isModalOpen && (modalType === 'addCategory' || modalType === 'editCategory')}
                    onClose={closeModal}
                    onSave={handleSave}
                    editingItem={editingItem}
                />
                <ProducerModal
                    isOpen={isModalOpen && (modalType === 'addProducer' || modalType === 'editProducer')}
                    onClose={closeModal}
                    onSave={handleSave}
                    editingItem={editingItem}
                />
                <DeleteModal
                    isOpen={isModalOpen && modalType === 'delete'}
                    onClose={closeModal}
                    onConfirm={handleConfirmDelete}
                    itemType={editingItem?.type}
                />
            </div>
        </div>
    );
}

export default OtherList;