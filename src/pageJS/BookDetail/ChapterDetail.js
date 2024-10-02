import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { database } from '../../firebaseConfig';
import { ref, get } from 'firebase/database';
import '../../pageCSS/BookDetailCss/ChapterDetailCss.css';
import HomeNav from '../Home/HomeNav';
import HomeFoot from '../Home/HomeFoot';

function ChapterDetail() {
  const { bookId, chapterId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [sameGenreBooks, setSameGenreBooks] = useState([]);
  const [sameAuthorBooks, setSameAuthorBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookRef = ref(database, `books/${bookId}`);
        const bookSnapshot = await get(bookRef);
        const bookData = bookSnapshot.val();
        
        if (bookData && bookData.content && Array.isArray(bookData.content.chapters)) {
          setBook(bookData);
          setChapters(bookData.content.chapters);
          const foundChapter = bookData.content.chapters.find(ch => ch.id === chapterId);
          if (foundChapter) {
            setChapter(foundChapter);
          } else {
            setError("Chapter not found");
          }

          // Fetch same genre books
          if (bookData.genreIds && bookData.genreIds.length > 0) {
            const mainGenreId = bookData.genreIds[0];
            const allBooksRef = ref(database, 'books');
            const allBooksSnapshot = await get(allBooksRef);
            const allBooks = allBooksSnapshot.val();
            if (allBooks) {
              const sameGenre = Object.entries(allBooks)
                .filter(([id, genreBook]) =>
                  id !== bookId && genreBook.genreIds && genreBook.genreIds.includes(mainGenreId)
                )
                .map(([id, book]) => ({ id, ...book }))
                .slice(0, 5);
              setSameGenreBooks(sameGenre);
            }
          }

          // Fetch same author books
          if (bookData.authorId) {
            const allBooksRef = ref(database, 'books');
            const allBooksSnapshot = await get(allBooksRef);
            const allBooks = allBooksSnapshot.val();
            if (allBooks) {
              const sameAuthor = Object.entries(allBooks)
                .filter(([id, authorBook]) =>
                  id !== bookId && authorBook.authorId === bookData.authorId
                )
                .map(([id, book]) => ({ id, ...book }))
                .slice(0, 5);
              setSameAuthorBooks(sameAuthor);
            }
          }
        } else {
          setError("Invalid book data structure");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An error occurred while loading the data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [bookId, chapterId]);

  const handleChapterChange = (newChapterId) => {
    navigate(`/book/${bookId}/chapter/${newChapterId}`);
  };

  const handleBookClick = (clickedBookId) => {
    navigate(`/book/${clickedBookId}`);
  };

  const currentChapterIndex = chapters.findIndex(ch => ch.id === chapterId);
  const prevChapter = chapters[currentChapterIndex - 1];
  const nextChapter = chapters[currentChapterIndex + 1];

  if (isLoading) return <div className="cd-loading">Đang tải...</div>;
  if (error) return <div className="cd-error">Lỗi: {error}</div>;
  if (!chapter || !book) return <div className="cd-not-found">Không tìm thấy chương hoặc sách</div>;

  const progress = ((currentChapterIndex + 1) / chapters.length) * 100;

  return (
    <div className="cd-chapter-detail-page">
      <HomeNav />
      <div className="cd-chapter-detail">
        <header className="cd-book-info">
          <h1>{book.title}</h1>
          <p className="cd-author">{book.author}</p>
        </header>

        <nav className="cd-chapter-navigation">
          <button 
            onClick={() => prevChapter && handleChapterChange(prevChapter.id)} 
            className="cd-nav-button cd-prev"
            disabled={!prevChapter}
          >
            &larr; Chương trước
          </button>
          <select 
            value={chapterId} 
            onChange={(e) => handleChapterChange(e.target.value)}
            className="cd-chapter-select"
          >
            {chapters.map((ch, index) => (
              <option key={ch.id} value={ch.id}>
                Chương {index + 1}: {ch.title || `Chương ${ch.id}`}
              </option>
            ))}
          </select>
          <button 
            onClick={() => nextChapter && handleChapterChange(nextChapter.id)} 
            className="cd-nav-button cd-next"
            disabled={!nextChapter}
          >
            Chương sau &rarr;
          </button>
        </nav>

        <div className="cd-progress-bar">
          <div className="cd-progress" style={{ width: `${progress}%` }}></div>
        </div>

        <article className="cd-chapter-content">
          <h2 className="cd-chapter-title">{chapter.title || `Chương ${currentChapterIndex + 1}`}</h2>
          <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
        </article>

        <footer className="cd-chapter-footer">
          <div className="cd-nav-buttons">
            <button 
              onClick={() => prevChapter && handleChapterChange(prevChapter.id)} 
              className="cd-nav-button cd-prev"
              disabled={!prevChapter}
            >
              &larr; Chương trước
            </button>
            <div className="cd-page-number">
              <p>Trang {currentChapterIndex + 1} / {chapters.length}</p>
            </div>
            <button 
              onClick={() => nextChapter && handleChapterChange(nextChapter.id)} 
              className="cd-nav-button cd-next"
              disabled={!nextChapter}
            >
              Chương sau &rarr;
            </button>
          </div>
        </footer>

        <div className="cd-related-books">
          <div className="cd-same-genre-books">
            <h3>Sách cùng thể loại</h3>
            <div className="cd-book-grid">
              {sameGenreBooks.map(book => (
                <div key={book.id} className="cd-book-card" onClick={() => handleBookClick(book.id)}>
                  {book.coverUrl && <img src={book.coverUrl} alt={book.title} />}
                  <h4>{book.title}</h4>
                </div>
              ))}
            </div>
          </div>
          <div className="cd-same-author-books">
            <h3>Sách cùng tác giả</h3>
            <div className="cd-book-grid">
              {sameAuthorBooks.map(book => (
                <div key={book.id} className="cd-book-card" onClick={() => handleBookClick(book.id)}>
                  {book.coverUrl && <img src={book.coverUrl} alt={book.title} />}
                  <h4>{book.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <HomeFoot />
    </div>
  );
}

export default ChapterDetail;