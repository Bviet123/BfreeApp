import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaBook, FaInfoCircle, FaListOl, FaPlus, FaBars, FaEdit, FaTimes, FaTrash } from 'react-icons/fa';
import { ref, get, update, remove } from 'firebase/database';
import { database } from '../../../firebaseConfig';
import Aside from '../Aside/Aside';
import '../../../pageCSS/Admin/BookListCss/AdminBookDetailsCss.css';

function AdminBookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [isAsideVisible, setIsAsideVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookAndRelatedData = async () => {
      try {
        const bookRef = ref(database, `books/${id}`);
        const bookSnapshot = await get(bookRef);

        if (bookSnapshot.exists()) {
          const bookData = { id, ...bookSnapshot.val() };
          console.log('Book data:', bookData);
          setBook(bookData);

          // Fetch publisher data
          if (bookData.publisherId) {
            const publisherRef = ref(database, `producers/${bookData.publisherId}`);
            const publisherSnapshot = await get(publisherRef);
            if (publisherSnapshot.exists()) {
              setPublisher(publisherSnapshot.val());
            }
          }

          // Fetch genres data
          if (bookData.genreIds && Array.isArray(bookData.genreIds)) {
            const genrePromises = bookData.genreIds.map(genreId =>
              get(ref(database, `categories/${genreId}`)).then(snapshot => snapshot.val())
            );
            const genreData = await Promise.all(genrePromises);
            setGenres(genreData.filter(genre => genre !== null));
          }

          // Fetch authors data
          if (bookData.authorIds && Array.isArray(bookData.authorIds)) {
            const authorPromises = bookData.authorIds.map(authorId =>
              get(ref(database, `authors/${authorId}`)).then(snapshot => snapshot.val())
            );
            const authorData = await Promise.all(authorPromises);
            setAuthors(authorData.filter(author => author !== null));
          }
        } else {
          console.log("No such book!");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookAndRelatedData();
  }, [id]);



  const toggleAside = () => {
    setIsAsideVisible(!isAsideVisible);
  };

  if (loading) return <div>Loading...</div>;
  if (!book) return <div>Book not found</div>;

  return (
    <div className={`ab-layout ${isAsideVisible ? 'aside-visible' : 'aside-hidden'}`}>
      {isAsideVisible && <Aside />}
      <main className="ab-main">
        <div className="ab-header">
          <h1 className="ab-title">{book.title}</h1>
          <button className="ab-toggle-aside" onClick={toggleAside}>
            {isAsideVisible ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        <div className="ab-content">
          <BookBasicInfo book={book} authors={authors} genres={genres} publisher={publisher} />
          <BookDetails book={book} />
          <ChapterList book={book} id={id} />
        </div>
      </main>
    </div>
  );
}

const BookBasicInfo = ({ book, authors, genres, publisher }) => (
  <section className="ab-section ab-book-basic-info">
    <h2 className="ab-section-title"><FaBook /> Thông tin cơ bản</h2>
    <div className="ab-section-content">
      <div className="ab-cover">
        <img src={book.coverUrl} alt={book.title} />
        <button className="ab-edit-button"><FaEdit /> Chỉnh sửa</button>
      </div>
      <div className="ab-basic-info">
        <p><strong>Tác giả:</strong> {authors.length > 0 ? authors.map(author => author.name).join(', ') : 'Không có thông tin'}</p>
        <p><strong>Thể loại:</strong> {genres.length > 0 ? genres.map(genre => genre.name).join(', ') : 'Không có thông tin'}</p>
        <p><strong>Nhà xuất bản:</strong> {publisher?.name || 'Không có thông tin'}</p>
        <p><strong>Mô tả:</strong> {book.description || 'Không có mô tả'}</p>
      </div>
    </div>
  </section>
);

const BookDetails = ({ book }) => (
  <section className="ab-section ab-book-details">
    <h2 className="ab-section-title"><FaInfoCircle /> Chi tiết</h2>
    <div className="ab-section-content">
      <div className="ab-detail-item">
        <span className="ab-detail-label">Số trang:</span>
        <span className="ab-detail-value">{book.pages || 'Không có thông tin'}</span>
      </div>
      <div className="ab-detail-item">
        <span className="ab-detail-label">Ngôn ngữ:</span>
        <span className="ab-detail-value">{book.language || 'Không có thông tin'}</span>
      </div>
      <div className="ab-detail-item">
        <span className="ab-detail-label">ISBN:</span>
        <span className="ab-detail-value">{book.isbn || 'Không có thông tin'}</span>
      </div>
      <div className="ab-detail-item">
        <span className="ab-detail-label">Ngày xuất bản:</span>
        <span className="ab-detail-value">
          {book.publicationDate ? new Date(book.publicationDate).toLocaleDateString() : 'Không có thông tin'}
        </span>
      </div>
      <div className="ab-detail-item">
        <span className="ab-detail-label">Trạng thái:</span>
        <span className="ab-detail-value">
          {book.availability?.status === 'available' ? 'Có sẵn' : 'Không có sẵn'}
        </span>
      </div>
      <div className="ab-detail-item">
        <span className="ab-detail-label">Số lượng có sẵn:</span>
        <span className="ab-detail-value">
          {book.availability?.copiesAvailable || 'Không có thông tin'}
        </span>
      </div>
    </div>
  </section>
);

const ChapterList = ({ book, id }) => {
  const chapters = book.content?.chapters || [];
  const totalChapters = book.content?.totalChapters || 0;
  const lastUpdated = book.content?.lastUpdated || '';

  const navigate = useNavigate();

  const handleAddChapter = () => {
    navigate(`/admin/books/${id}/AddChapter`);
  };

  const handleDeleteChapter = async (chapterId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chương này?')) {
      try {
        // Xóa chương khỏi danh sách chapters
        const updatedChapters = chapters.filter(chapter => chapter.id !== chapterId);
        
        // Cập nhật lại thông tin sách
        const bookRef = ref(database, `books/${id}`);
        await update(bookRef, {
          'content.chapters': updatedChapters,
          'content.totalChapters': totalChapters - 1,
          'content.lastUpdated': new Date().toISOString()
        });

        // Xóa chương khỏi database (nếu bạn lưu chương riêng)
        const chapterRef = ref(database, `books/${id}/content/chapters/${chapterId}`);
        await remove(chapterRef);

        alert('Chương đã được xóa thành công!');
        // Reload the page or update the state to reflect the changes
        window.location.reload();
      } catch (error) {
        console.error('Lỗi khi xóa chương:', error);
        alert('Có lỗi xảy ra khi xóa chương. Vui lòng thử lại.');
      }
    }
  };

  return (
    <section className="ab-section">
      <h2 className="ab-section-title"><FaListOl /> Danh sách chương</h2>
      <div className="ab-section-content">
        <p><strong>Tổng số chương:</strong> {totalChapters}</p>
        {chapters.length > 0 ? (
          <ul className="ab-chapter-list">
            {chapters.map(chapter => (
              <li key={chapter.id} className="ab-chapter-item">
                {chapter.title}
                <div className="ab-chapter-actions">
                  <button className="ab-button ab-edit-chapter-button">
                    <FaEdit /> Sửa
                  </button>
                  <button 
                    className="ab-button ab-delete-chapter-button"
                    onClick={() => handleDeleteChapter(chapter.id)}
                  >
                    <FaTrash /> Xóa
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Chưa có chương nào.</p>
        )}
        <div className="ab-chapter-actions">
          <button className="ab-button ab-add-chapter-button" onClick={handleAddChapter}>
            <FaPlus /> Thêm chương
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdminBookDetails;