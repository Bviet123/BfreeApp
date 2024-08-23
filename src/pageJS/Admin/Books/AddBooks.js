import React, { useState } from 'react';
import { getDatabase, ref, push, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { app } from '../../../firebaseConfig';
import '../../../pageCSS/Admin/AddBooksCss.css';
import { format } from 'date-fns';

const AddBooks = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    cover: null,
    genre: '',
    releaseDate: null,
  });
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    if (e.target.name === 'cover') {
      setFormData({ ...formData, cover: e.target.files[0] });
    } else if (e.target.name === 'releaseDate') {
      setFormData({ ...formData, releaseDate: e.target.value });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Kiểm tra xác thực người dùng
      const auth = getAuth(app);
      const currentUser = await auth.currentUser;
      if (!currentUser) {
        setErrorMessage('Bạn phải đăng nhập để thêm sách mới.');
        return;
      }

      // Lưu sách vào Realtime Database
      const database = getDatabase(app);
      const booksRef = ref(database, 'books');
      const newBookRef = push(booksRef);
      await set(newBookRef, {
        id: newBookRef.key,
        title: formData.title,
        author: formData.author,
        cover: formData.cover ? formData.cover.name : '',
        genre: formData.genre,
        releaseDate: formData.releaseDate ? format(new Date(formData.releaseDate), 'yyyy-MM-dd') : '',
      });

      // Xóa dữ liệu biểu mẫu
      setFormData({
        title: '',
        author: '',
        cover: null,
        genre: '',
        releaseDate: null,
      });
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(`Có lỗi xảy ra: ${error.message}`);
    }
  };

  return (
    <div className="add-books-container">
      <h2 className="add-books-title">Thêm sách mới</h2>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <form onSubmit={handleSubmit} className="add-books-form">
        <div className="form-group">
          <label htmlFor="title" className="form-label">Tiêu đề:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="author" className="form-label">Tác giả:</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="cover" className="form-label">Ảnh bìa:</label>
          <input
            type="file"
            id="cover"
            name="cover"
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="genre" className="form-label">Thể loại:</label>
          <input
            type="text"
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="releaseDate" className="form-label">Ngày phát hành:</label>
          <input
            type="date"
            id="releaseDate"
            name="releaseDate"
            value={formData.releaseDate}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>
        <button type="submit" className="form-button">Lưu</button>
      </form>
    </div>
  );
};

export default AddBooks;