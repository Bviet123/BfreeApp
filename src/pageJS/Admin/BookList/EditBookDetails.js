import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, onValue, update, get } from 'firebase/database';
import { database } from '../../../firebaseConfig';
import { FaSave, FaArrowLeft, FaUpload } from 'react-icons/fa';
import '../../../pageCSS/Admin/BookListCss/EditBookDetailsCss.css';
import { countries } from '../OtherList/Contries';

const MultiSelect = ({ options, value, onChange, name, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState(value || []);
    const dropdownRef = useRef(null);
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
  
    const handleToggle = () => setIsOpen(!isOpen);
  
    const handleOptionClick = (option) => {
      let newSelectedOptions;
      if (selectedOptions.includes(option.id)) {
        newSelectedOptions = selectedOptions.filter(id => id !== option.id);
      } else {
        newSelectedOptions = [...selectedOptions, option.id];
      }
      setSelectedOptions(newSelectedOptions);
      onChange({ target: { name, value: newSelectedOptions } });
    };
  
    const getSelectedNames = () => {
      return selectedOptions.map(id => options.find(option => option.id === id)?.name).filter(Boolean).join(', ');
    };
  
    return (
      <div className="custom-multi-select" ref={dropdownRef}>
        <div className="select-header" onClick={handleToggle}>
          {selectedOptions.length > 0 ? getSelectedNames() : placeholder}
        </div>
        {isOpen && (
          <ul className="options-list">
            {options.map(option => (
              <li
                key={option.id}
                onClick={() => handleOptionClick(option)}
                className={selectedOptions.includes(option.id) ? 'selected' : ''}
              >
                {option.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

function EditBookDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imagePreview, setImagePreview] = useState(null);
    const [authors, setAuthors] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const [genres, setGenres] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookSnapshot, authorsSnapshot, publishersSnapshot, genresSnapshot] = await Promise.all([
                    get(ref(database, `books/${id}`)),
                    get(ref(database, 'authors')),
                    get(ref(database, 'producers')),
                    get(ref(database, 'categories'))
                ]);

                if (bookSnapshot.exists()) {
                    const bookData = bookSnapshot.val();
                    setBook({ id, ...bookData });
                    setImagePreview(bookData.coverUrl);
                } else {
                    console.log("No such book!");
                }

                const formatData = (snapshot) => snapshot.exists() 
                    ? Object.entries(snapshot.val()).map(([id, data]) => ({ id, name: data.name }))
                    : [];

                setAuthors(formatData(authorsSnapshot));
                setPublishers(formatData(publishersSnapshot));
                setGenres(formatData(genresSnapshot));

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBook(prevBook => ({
            ...prevBook,
            [name]: value
        }));
    };

    const handleMultiSelectChange = (e) => {
        const { name, value } = e.target;
        setBook(prevBook => ({
            ...prevBook,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setBook(prevBook => ({
                    ...prevBook,
                    coverUrl: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const bookRef = ref(database, `books/${id}`);
            await update(bookRef, book);
            alert('Book updated successfully!');
            navigate(`/admin/books/${id}`);
        } catch (error) {
            console.error("Error updating book:", error);
            alert('Failed to update book. Please try again.');
        }
    };

    if (loading) {
        return (
          <div className="bs-loading-container">
            <div className="bs-loading-spinner"></div>
          </div>
        );
      }
    if (!book) return <div>Book not found</div>;

    return (
        <div className="edit-book-details">
            <div className="page-header">
                <h1 className="page-title">{book.title}</h1>
                <button onClick={() => navigate(-1)} className="back-button">
                    <FaArrowLeft /> Quay lại
                </button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="coverImage">Ảnh sách:</label>
                    <div className="image-upload-container">
                        {imagePreview && (
                            <img src={imagePreview} alt="Book cover preview" className="image-preview" />
                        )}
                        <input
                            type="file"
                            id="coverImage"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="file-input"
                        />
                        <label htmlFor="coverImage" className="file-input-label">
                            <FaUpload /> Chọn ảnh
                        </label>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="title">Tên sách:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={book.title}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="authors">Tác giả:</label>
                    <MultiSelect
                        options={authors}
                        value={book.authorIds}
                        onChange={handleMultiSelectChange}
                        name="authorIds"
                        placeholder="Select authors"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="genres">Thể loại:</label>
                    <MultiSelect
                        options={genres}
                        value={book.genreIds}
                        onChange={handleMultiSelectChange}
                        name="genreIds"
                        placeholder="Select genres"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="publisher">Nhà sản xuất:</label>
                    <select
                        id="publisher"
                        name="publisherId"
                        value={book.publisherId}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">chọn nhà sản xuất</option>
                        {publishers.map(publisher => (
                            <option key={publisher.id} value={publisher.id}>{publisher.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="description">Mô tả:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={book.description}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="pages">Số trang:</label>
                    <input
                        type="number"
                        id="pages"
                        name="pages"
                        value={book.pages}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="language">Quốc gia gốc:</label>
                    <select
                        id="language"
                        name="language"
                        value={book.language}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Chọn quốc gia</option>
                        {countries.map((country, index) => (
                            <option key={index} value={country}>{country}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="isbn">ISBN:</label>
                    <input
                        type="text"
                        id="isbn"
                        name="isbn"
                        value={book.isbn}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="publicationDate">Ngày xuất bản:</label>
                    <input
                        type="date"
                        id="publicationDate"
                        name="publicationDate"
                        value={book.publicationDate}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="button-group">
                    <button type="submit" className="save-button">
                        <FaSave /> Lưu thay đổi
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditBookDetails;