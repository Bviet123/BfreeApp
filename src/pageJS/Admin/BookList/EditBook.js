import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaBook, FaUser, FaInfoCircle, FaSave } from 'react-icons/fa';
import '../../../pageCSS/Admin/BookListCss/EditBookCss.css';
import Aside from '../Aside/Aside';

function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAsideVisible, setIsAsideVisible] = useState(true);

  const [book, setBook] = useState({
    title: "",
    authorId: "",
    coverUrl: "",
    genres: [],
    description: "",
    publicationDate: "",
    publisher: "",
    pages: "",
    language: "",
    isbn: "",
    availability: {
      status: "",
      copiesAvailable: 0
    }
  });

  useEffect(() => {
    // Fetch book data (placeholder)
    setBook({
      title: "Đắc Nhân Tâm",
      authorId: "author1",
      coverUrl: "https://example.com/images/dacnhantam.jpg",
      genres: ["self-help", "psychology"],
      description: "Đắc Nhân Tâm của Dale Carnegie là một trong những cuốn sách bán chạy nhất mọi thời đại. Đây là cuốn sách dạy về cách ứng xử, cư xử trong cuộc sống để đạt được thành công.",
      publicationDate: "1936-10-17",
      publisher: "Simon and Schuster",
      pages: 292,
      language: "Tiếng Việt",
      isbn: "978-604-1-XXXXX-X",
      availability: {
        status: "available",
        copiesAvailable: 5
      }
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook(prevBook => ({
      ...prevBook,
      [name]: value
    }));
  };

  const handleGenreChange = (e) => {
    const genres = e.target.value.split(',').map(genre => genre.trim());
    setBook(prevBook => ({
      ...prevBook,
      genres: genres
    }));
  };

  const handleAvailabilityChange = (e) => {
    const { name, value } = e.target;
    setBook(prevBook => ({
      ...prevBook,
      availability: {
        ...prevBook.availability,
        [name]: name === 'copiesAvailable' ? parseInt(value) : value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Updated book:', book);
    navigate(`/book/${id}`);
  };

  const toggleAside = () => {
    setIsAsideVisible(!isAsideVisible);
  };

  return (
    <div className="edit-book-container">
      <Aside className={isAsideVisible ? 'visible' : 'hidden'} />
      <div className={`edit-book-main ${isAsideVisible ? '' : 'full-width'}`}>
        <div className="edit-book-header">
          <div className='edit-book-toggle'>
            <button className="toggle-aside-btn" onClick={toggleAside}>
              {isAsideVisible ? <FaTimes /> : <FaBars />}
            </button>
            <h1>Chỉnh sửa thông tin sách</h1>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="edit-book-form">
          <div className="edit-book-column">
            <div className="edit-book-section">
              <h2><FaBook /> Thông tin cơ bản</h2>
              <div className="form-group">
                <label htmlFor="title">Tiêu đề:</label>
                <input type="text" id="title" name="title" value={book.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="authorId">ID Tác giả:</label>
                <input type="text" id="authorId" name="authorId" value={book.authorId} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="coverUrl">URL Ảnh bìa:</label>
                <input type="text" id="coverUrl" name="coverUrl" value={book.coverUrl} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="genres">Thể loại (phân cách bằng dấu phẩy):</label>
                <input type="text" id="genres" name="genres" value={book.genres.join(', ')} onChange={handleGenreChange} required />
              </div>
            </div>
            <div className="edit-book-section">
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
          <div className="edit-book-column">
            <div className="edit-book-section">
              <h2><FaUser /> Thông tin xuất bản</h2>
              <div className="form-group">
                <label htmlFor="publisher">Nhà xuất bản:</label>
                <input type="text" id="publisher" name="publisher" value={book.publisher} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="publicationDate">Ngày xuất bản:</label>
                <input type="date" id="publicationDate" name="publicationDate" value={book.publicationDate} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="isbn">ISBN:</label>
                <input type="text" id="isbn" name="isbn" value={book.isbn} onChange={handleChange} required />
              </div>
            </div>
            <div className="edit-book-section">
              <h2><FaInfoCircle /> Tình trạng sách</h2>
              <div className="form-group">
                <label htmlFor="status">Trạng thái:</label>
                <select id="status" name="status" value={book.availability.status} onChange={handleAvailabilityChange} required>
                  <option value="available">Có sẵn</option>
                  <option value="unavailable">Không có sẵn</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="copiesAvailable">Số lượng có sẵn:</label>
                <input type="number" id="copiesAvailable" name="copiesAvailable" value={book.availability.copiesAvailable} onChange={handleAvailabilityChange} required />
              </div>
            </div>
          </div>
        </form>
        <button type="submit" className="save-button" onClick={handleSubmit}>
          <FaSave /> Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

export default EditBook;