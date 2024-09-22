import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaBook, FaUser, FaInfoCircle, FaSave, FaBookOpen, FaUpload, FaArrowLeft } from 'react-icons/fa';
import '../../../pageCSS/Admin/BookListCss/AddBookCss.css';
import Aside from '../Aside/Aside';
import { database } from '../../../firebaseConfig';
import { ref, get, push, set } from 'firebase/database';
import { countries } from '../OtherList/Contries';

// MultiSelect component
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

// BasicInfoSection component
const BasicInfoSection = ({ book, authors, genres, publishers, handleChange, handleImageUpload }) => (
  <div className="add-book-section">
    <h2><FaBook /> Thông tin cơ bản</h2>
    <div className="form-group">
      <label htmlFor="title">Tiêu đề:</label>
      <input type="text" id="title" name="title" value={book.title} onChange={handleChange} required />
    </div>
    <div className="form-group">
      <label htmlFor="authors">Tác giả:</label>
      <MultiSelect
        options={authors}
        value={book.authorIds}
        onChange={handleChange}
        name="authorIds"
        placeholder="Chọn tác giả"
      />
    </div>
    <div className="form-group">
      <label htmlFor="coverUrl">Ảnh bìa:</label>
      <div className="cover-image-upload">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          id="coverImageUpload"
        />
        <button
          type="button"
          onClick={() => document.getElementById('coverImageUpload').click()}
          className="upload-button"
        >
          <FaUpload /> Chọn ảnh
        </button>
        {book.coverUrl && (
          <img src={book.coverUrl} alt="Book cover preview" className="cover-preview" />
        )}
      </div>
    </div>
    <div className="form-group">
      <label htmlFor="genres">Thể loại:</label>
      <MultiSelect
        options={genres}
        value={book.genreIds}
        onChange={handleChange}
        name="genreIds"
        placeholder="Chọn thể loại"
      />
    </div>
    <div className="form-group">
      <label htmlFor="publisher">Nhà xuất bản:</label>
      <select
        id="publisher"
        name="publisherId"
        value={book.publisherId}
        onChange={handleChange}
        required
      >
        <option value="">Chọn nhà xuất bản</option>
        {publishers.map(publisher => (
          <option key={publisher.id} value={publisher.id}>{publisher.name}</option>
        ))}
      </select>
    </div>
  </div>
);

// DetailedInfoSection component
const DetailedInfoSection = ({ book, handleChange }) => (
  <div className="add-book-section">
    <h2><FaInfoCircle /> Thông tin chi tiết</h2>
    <div className="form-group">
      <label htmlFor="description">Mô tả:</label>
      <textarea id="description" name="description" value={book.description} onChange={handleChange} required />
    </div>
    <div className="form-group">
      <label htmlFor="pages">Số trang:</label>
      <input type="number" id="pages" name="pages" value={book.pages} onChange={handleChange} required />
    </div>
    <div className="form-group">
      <label htmlFor="language">Ngôn ngữ:</label>
      <select
        id="language"
        name="language"
        value={book.language}
        onChange={handleChange}
        required
      >
        <option value="">Chọn ngôn ngữ</option>
        {countries.map(country => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>
    </div>
  </div>
);

// PublishingInfoSection component
const PublishingInfoSection = ({ book, handleChange }) => (
  <div className="add-book-section">
    <h2><FaUser /> Thông tin xuất bản</h2>
    <div className="form-group">
      <label htmlFor="publicationDate">Ngày xuất bản:</label>
      <input type="date" id="publicationDate" name="publicationDate" value={book.publicationDate} onChange={handleChange} required />
    </div>
    <div className="form-group">
      <label htmlFor="isbn">ISBN:</label>
      <input type="text" id="isbn" name="isbn" value={book.isbn} onChange={handleChange} required />
    </div>
  </div>
);

// BookStatusSection component
const BookStatusSection = ({ book, handleAvailabilityChange }) => (
  <div className="add-book-section">
    <h2><FaInfoCircle /> Tình trạng sách</h2>
    <div className="form-group">
      <label htmlFor="copiesAvailable">Số lượng có sẵn:</label>
      <input type="number" id="copiesAvailable" name="copiesAvailable" value={book.availability.copiesAvailable} onChange={handleAvailabilityChange} required />
    </div>
    <div className="form-group">
      <label>Trạng thái:</label>
      <input type="text" value={book.availability.status === 'available' ? 'Có sẵn' : 'Không có sẵn'} readOnly />
    </div>
  </div>
);

// BookContentSection component
const BookContentSection = ({ book, handleContentChange }) => (
  <div className="add-book-section">
    <h2><FaBookOpen /> Nội dung sách</h2>
    <div className="form-group">
      <label htmlFor="totalChapters">Tổng số chương:</label>
      <input type="number" id="totalChapters" name="totalChapters" value={book.content.totalChapters} onChange={handleContentChange} required />
    </div>
  </div>
);

// Main AddBook component
function AddBook() {
  const navigate = useNavigate();
  const [isAsideVisible, setIsAsideVisible] = useState(true);

  const [book, setBook] = useState({
    title: "",
    authorIds: [],
    coverUrl: "",
    genreIds: [],
    publisherId: "",
    description: "",
    publicationDate: "",
    pages: 0,
    language: "",
    isbn: "",
    availability: {
      status: "available",
      copiesAvailable: 0
    },
    content: {
      totalChapters: 0,
      chapters: []
    }
  });

  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authorsSnapshot, publishersSnapshot, genresSnapshot] = await Promise.all([
          get(ref(database, 'authors')),
          get(ref(database, 'producers')),
          get(ref(database, 'categories'))
        ]);

        const formatData = (snapshot) => snapshot.exists() 
          ? Object.entries(snapshot.val()).map(([id, data]) => ({ id, name: data.name }))
          : [];

        setAuthors(formatData(authorsSnapshot));
        setPublishers(formatData(publishersSnapshot));
        setGenres(formatData(genresSnapshot));
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  const handleGoBack = () => navigate(-1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook(prevBook => ({ ...prevBook, [name]: value }));
  };

  const handleAvailabilityChange = (e) => {
    const { name, value } = e.target;
    const copiesAvailable = parseInt(value);
    setBook(prevBook => ({
      ...prevBook,
      availability: {
        copiesAvailable: copiesAvailable,
        status: copiesAvailable > 0 ? 'available' : 'unavailable'
      }
    }));
  };

  const handleContentChange = (e) => {
    const { name, value } = e.target;
    setBook(prevBook => ({
      ...prevBook,
      content: {
        ...prevBook.content,
        [name]: parseInt(value)
      }
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
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
      const newBookRef = push(ref(database, 'books'));
      await set(newBookRef, book);
      console.log('New book added successfully');
      navigate('/admin/books');
    } catch (error) {
      console.error('Error adding new book: ', error);
    }
  };

  const toggleAside = () => setIsAsideVisible(!isAsideVisible);

  return (
    <div className="add-book-container">
      {/*<Aside className={isAsideVisible ? 'visible' : 'hidden'} />*/}
      <div className={`add-book-main ${isAsideVisible ? '' : 'full-width'}`}>
        <button className="back-button" onClick={handleGoBack}>
          <FaArrowLeft />
        </button>
        <div className="add-book-header">
          <div className='add-book-toggle'>
            <h1>Thêm sách mới</h1>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="add-book-form">
          <div className="add-book-column">
            <BasicInfoSection 
              book={book} 
              authors={authors} 
              genres={genres} 
              publishers={publishers} 
              handleChange={handleChange}
              handleImageUpload={handleImageUpload}
            />
            <DetailedInfoSection book={book} handleChange={handleChange} />
          </div>
          <div className="add-book-column">
            <PublishingInfoSection book={book} handleChange={handleChange} />
            <BookStatusSection book={book} handleAvailabilityChange={handleAvailabilityChange} />
            <BookContentSection book={book} handleContentChange={handleContentChange} />
          </div>
        </form>
        <button type="submit" className="save-button" onClick={handleSubmit}>
          <FaSave /> Thêm sách
        </button>
      </div>
    </div>
  );
}

export default AddBook;