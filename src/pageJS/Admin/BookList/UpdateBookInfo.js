import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaSave, FaArrowLeft, FaUpload } from 'react-icons/fa';
import { countries } from '../OtherList/Contries';
import '../../../pageCSS/Admin/BookListCss/UpdateBookInfoCss.css';

// Custom Dropdown Component
const Dropdown = ({ options, value, onChange, placeholder, multiple = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(multiple ? value : [value]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option) => {
    if (multiple) {
      const newSelection = selectedOptions.includes(option)
        ? selectedOptions.filter(item => item !== option)
        : [...selectedOptions, option];
      setSelectedOptions(newSelection);
      onChange(newSelection);
    } else {
      setSelectedOptions([option]);
      onChange(option);
      setIsOpen(false);
    }
  };

  return (
    <div className="custom-select">
      <div className="select-control" onClick={toggleDropdown}>
        {selectedOptions.length > 0 ? selectedOptions.join(', ') : placeholder}
      </div>
      {isOpen && (
        <ul className="select-options">
          {options.map((option) => (
            <li
              key={option}
              onClick={() => handleOptionClick(option)}
              className={selectedOptions.includes(option) ? 'selected' : ''}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Form Input Component
const FormInput = ({ label, type, name, value, onChange, required = false }) => (
  <div className="ubi-form-group">
    <label htmlFor={name}>{label}:</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
    />
  </div>
);

// Main UpdateBookInfo Component
function UpdateBookInfo() {
  const navigate = useNavigate();
  const [book, setBook] = useState({
    title: 'Sample Book Title',
    authorIds: ['author1', 'author2'],
    coverUrl: 'https://example.com/book-cover.jpg',
    genreIds: ['genre1', 'genre2'],
    publisherId: 'publisher1',
    description: 'This is a sample book description.',
    publicationDate: '2023-09-21',
    pages: 300,
    language: 'English',
    isbn: '1234567890123',
    availability: {
      copiesAvailable: 5,
      status: 'available'
    },
    content: {
      totalChapters: 20
    }
  });

  const authors = [
    { id: 'author1', name: 'Author One' },
    { id: 'author2', name: 'Author Two' },
    { id: 'author3', name: 'Author Three' }
  ];

  const publishers = [
    { id: 'publisher1', name: 'Publisher One' },
    { id: 'publisher2', name: 'Publisher Two' },
    { id: 'publisher3', name: 'Publisher Three' }
  ];

  const genres = [
    { id: 'genre1', name: 'Fiction' },
    { id: 'genre2', name: 'Non-Fiction' },
    { id: 'genre3', name: 'Mystery' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBook(prevBook => ({ ...prevBook, [name]: value }));
  };

  const handleAvailabilityChange = (e) => {
    const { name, value } = e.target;
    setBook(prevBook => ({
      ...prevBook,
      availability: {
        ...prevBook.availability,
        [name]: name === 'copiesAvailable' ? parseInt(value) : value,
        status: name === 'copiesAvailable' ? (parseInt(value) > 0 ? 'available' : 'unavailable') : prevBook.availability.status
      }
    }));
  };

  const handleContentChange = (e) => {
    const { name, value } = e.target;
    setBook(prevBook => ({
      ...prevBook,
      content: { ...prevBook.content, [name]: parseInt(value) }
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBook(prevBook => ({ ...prevBook, coverUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated book:", book);
    navigate(`/admin/books/${book.id}`);
  };

  return (
    <div className="ubi-layout">
      <main className="ubi-main">
        <div className="ubi-header">
          <h1 className="ubi-title">Cập nhật thông tin sách</h1>
          <button className="ubi-back-button" onClick={() => navigate(`/admin/books/${book.id}`)}>
            <FaArrowLeft /> Quay lại
          </button>
        </div>
        <form onSubmit={handleSubmit} className="ubi-form">
          <FormInput label="Tiêu đề" type="text" name="title" value={book.title} onChange={handleInputChange} required />
          
          <div className="ubi-form-group">
            <label htmlFor="authorIds">Tác giả:</label>
            <Dropdown
              options={authors.map(author => author.name)}
              value={book.authorIds.map(id => authors.find(a => a.id === id)?.name)}
              onChange={(selectedAuthors) => {
                const selectedIds = selectedAuthors.map(name => authors.find(a => a.name === name)?.id).filter(Boolean);
                setBook(prevBook => ({ ...prevBook, authorIds: selectedIds }));
              }}
              placeholder="Chọn tác giả"
              multiple
            />
          </div>

          <div className="ubi-form-group">
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

          <div className="ubi-form-group">
            <label htmlFor="genreIds">Thể loại:</label>
            <Dropdown
              options={genres.map(genre => genre.name)}
              value={book.genreIds.map(id => genres.find(g => g.id === id)?.name)}
              onChange={(selectedGenres) => {
                const selectedIds = selectedGenres.map(name => genres.find(g => g.name === name)?.id).filter(Boolean);
                setBook(prevBook => ({ ...prevBook, genreIds: selectedIds }));
              }}
              placeholder="Chọn thể loại"
              multiple
            />
          </div>

          <div className="ubi-form-group">
            <label htmlFor="publisherId">Nhà xuất bản:</label>
            <Dropdown
              options={publishers.map(publisher => publisher.name)}
              value={publishers.find(p => p.id === book.publisherId)?.name}
              onChange={(selectedPublisher) => {
                const selectedId = publishers.find(p => p.name === selectedPublisher)?.id;
                setBook(prevBook => ({ ...prevBook, publisherId: selectedId }));
              }}
              placeholder="Chọn nhà xuất bản"
            />
          </div>

          <div className="ubi-form-group">
            <label htmlFor="description">Mô tả:</label>
            <textarea
              id="description"
              name="description"
              value={book.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <FormInput label="Ngày xuất bản" type="date" name="publicationDate" value={book.publicationDate} onChange={handleInputChange} required />
          <FormInput label="Số trang" type="number" name="pages" value={book.pages} onChange={handleInputChange} required />

          <div className="ubi-form-group">
            <label htmlFor="language">Ngôn ngữ:</label>
            <Dropdown
              options={countries}
              value={book.language}
              onChange={(selectedLanguage) => {
                setBook(prevBook => ({ ...prevBook, language: selectedLanguage }));
              }}
              placeholder="Chọn ngôn ngữ"
            />
          </div>

          <FormInput label="ISBN" type="text" name="isbn" value={book.isbn} onChange={handleInputChange} required />
          <FormInput label="Số lượng có sẵn" type="number" name="copiesAvailable" value={book.availability.copiesAvailable} onChange={handleAvailabilityChange} required />
          <FormInput label="Tổng số chương" type="number" name="totalChapters" value={book.content.totalChapters} onChange={handleContentChange} required />

          <button type="submit" className="ubi-submit-button">
            <FaSave /> Lưu thay đổi
          </button>
        </form>
      </main>
    </div>
  );
}

export default UpdateBookInfo;