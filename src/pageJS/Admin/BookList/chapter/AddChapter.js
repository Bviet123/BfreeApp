import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { FaBook, FaPlus } from 'react-icons/fa';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import '../../../../pageCSS/Admin/BookListCss/ChapterCss/AddChapterCss.css';
import { database } from '../../../../firebaseConfig';

function AddChapter() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [book, setBook] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      const bookRef = ref(database, `books/${bookId}`);
      const snapshot = await get(bookRef);
      if (snapshot.exists()) {
        const bookData = snapshot.val();
        setBook(bookData);
        // Tự động điền tiêu đề với số chương tiếp theo
        const nextChapterNumber = (bookData.content?.totalChapters || 0) + 1;
        setTitle(`Chương ${nextChapterNumber}`);
      } else {
        console.error('Không tìm thấy sách');
      }
    };

    fetchBook();
  }, [bookId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!book) return;

    const currentTime = new Date().toISOString();

    const newChapter = {
      id: `chapter${book.content.totalChapters + 1}`,
      title,
      content,
      orderIndex: book.content.totalChapters + 1,
      createdAt: currentTime,
      lastUpdated: currentTime
    };

    const updatedChapters = [...(book.content.chapters || []), newChapter];
    const updatedBook = {
      ...book,
      content: {
        ...book.content,
        totalChapters: book.content.totalChapters + 1,
        chapters: updatedChapters
      },
      lastUpdated: currentTime
    };

    try {
      const bookRef = ref(database, `books/${bookId}`);
      await update(bookRef, updatedBook);
      alert('Chương đã được thêm thành công!');
      navigate(`/admin/books/BookDetail/${bookId}`);
    } catch (error) {
      console.error('Lỗi khi thêm chương:', error);
      alert('Có lỗi xảy ra khi thêm chương. Vui lòng thử lại.');
    }
  };

  if (!book) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="add-chapter-container">
      <h1 className="add-chapter-title"><FaBook /> Thêm Chương Mới cho "{book.title}"</h1>
      <form onSubmit={handleSubmit} className="add-chapter-form">
        <div className="form-group">
          <label htmlFor="chapterTitle">Tiêu đề chương:</label>
          <input
            type="text"
            id="chapterTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="chapterContent">Nội dung chương:</label>
          <CKEditor
            editor={ClassicEditor}
            data={content}
            onChange={(event, editor) => {
              const data = editor.getData();
              setContent(data);
            }}
          />
        </div>
        <button type="submit" className="submit-button">
          <FaPlus /> Thêm Chương
        </button>
      </form>
    </div>
  );
}

export default AddChapter;