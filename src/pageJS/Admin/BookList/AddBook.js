import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaBook, FaUser, FaInfoCircle, FaSave, FaBookOpen } from 'react-icons/fa';
import '../../../pageCSS/Admin/BookListCss/AddBookCss.css';
import Aside from '../Aside/Aside';
import { database } from '../../../firebaseConfig'; 
import { ref, get, push, set } from 'firebase/database';

// Custom MultiSelect component
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

  return (
    <div className="custom-multi-select" ref={dropdownRef}>
      <div className="select-header" onClick={handleToggle}>
        {selectedOptions.length > 0 
          ? `${selectedOptions.length} selected`
          : placeholder}
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
        const authorsSnapshot = await get(ref(database, 'authors'));
        const publishersSnapshot = await get(ref(database, 'publishers'));
        const genresSnapshot = await get(ref(database, 'categories'));

        if (authorsSnapshot.exists()) {
          setAuthors(Object.entries(authorsSnapshot.val()).map(([id, data]) => ({ id, name: data.name })));
        }
        if (publishersSnapshot.exists()) {
          setPublishers(Object.entries(publishersSnapshot.val()).map(([id, data]) => ({ id, ...data })));
        }
        if (genresSnapshot.exists()) {
          setGenres(Object.entries(genresSnapshot.val()).map(([id, data]) => ({ id, name: data.name })));
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook(prevBook => ({
      ...prevBook,
      [name]: value
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newBookRef = push(ref(database, 'books'));
      await set(newBookRef, book);
      console.log('New book added successfully');
      navigate('/books');
    } catch (error) {
      console.error('Error adding new book: ', error);
    }
  };

  const toggleAside = () => {
    setIsAsideVisible(!isAsideVisible);
  }

  return (
    <div className="add-book-container">
      <Aside className={isAsideVisible ? 'visible' : 'hidden'} />
      <div className={`add-book-main ${isAsideVisible ? '' : 'full-width'}`}>
        <div className="add-book-header">
          <div className='add-book-toggle'>
            <button className="toggle-aside-btn" onClick={toggleAside}>
              {isAsideVisible ? <FaTimes /> : <FaBars />}
            </button>
            <h1>Thêm sách mới</h1>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="add-book-form">
          <div className="add-book-column">
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
                <label htmlFor="coverUrl">URL Ảnh bìa:</label>
                <input type="url" id="coverUrl" name="coverUrl" value={book.coverUrl} onChange={handleChange} required />
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
                <input type="text" id="language" name="language" value={book.language} onChange={handleChange} required />
              </div>
            </div>
          </div>
          <div className="add-book-column">
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
            <div className="add-book-section">
              <h2><FaBookOpen /> Nội dung sách</h2>
              <div className="form-group">
                <label htmlFor="totalChapters">Tổng số chương:</label>
                <input type="number" id="totalChapters" name="totalChapters" value={book.content.totalChapters} onChange={handleContentChange} required />
              </div>
            </div>
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