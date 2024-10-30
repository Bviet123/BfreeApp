import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { database } from '../../firebaseConfig';
import { ref, get, update, push, set } from 'firebase/database';
import '../../pageCSS/BookDetailCss/BookDetailCss.css'
import HomeNav from '../Home/HomeNav';
import HomeFoot from '../Home/HomeFoot';
import AuthorInfo from './AuthorInfor';

function BookDetail() {
  const { bookId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(location.state?.user || JSON.parse(localStorage.getItem('user')));

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [book, setBook] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [producer, setProducer] = useState(null);
  const [genres, setGenres] = useState([]);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [sameGenreBooks, setSameGenreBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [borrowStatus, setBorrowStatus] = useState('available'); // 'available', 'borrowed', 'pending'

  useEffect(() => {
    if (!user && localStorage.getItem('user')) {
      setUser(JSON.parse(localStorage.getItem('user')));
    }

    const fetchBookData = async () => {
      try {
        // Fetch book data
        const bookRef = ref(database, `books/${bookId}`);
        const bookSnapshot = await get(bookRef);
        const bookData = bookSnapshot.val();

        if (!bookData) {
          setError("Book not found");
          setIsLoading(false);
          return;
        }

        setBook(bookData);

        // Fetch chapters
        if (bookData.content && bookData.content.chapters) {
          const chaptersList = Object.entries(bookData.content.chapters).map(([id, chapter]) => ({
            id,
            ...chapter
          }));
          setChapters(chaptersList);
        } else {
          console.log("No chapters data found");
          setChapters([]);
        }

        // Fetch authors
        if (bookData.authorIds && bookData.authorIds.length > 0) {
          const authorPromises = bookData.authorIds.map(authorId =>
            get(ref(database, `authors/${authorId}`))
              .then(snapshot => ({ id: authorId, ...snapshot.val() }))
          );

          Promise.all(authorPromises)
            .then(authorsData => {
              setAuthors(authorsData.filter(Boolean));
            })
            .catch(error => {
              console.error("Error fetching authors:", error);
            });
        }

        // Fetch producer
        if (bookData.publisherId) {
          const producerSnapshot = await get(ref(database, `producers/${bookData.publisherId}`));
          const producerData = producerSnapshot.val();
          if (producerData) {
            setProducer({ id: bookData.publisherId, ...producerData });
          }
        }

        // Fetch genres
        if (bookData.genreIds && Array.isArray(bookData.genreIds)) {
          const genrePromises = bookData.genreIds.map(genreId =>
            get(ref(database, `categories/${genreId}`))
          );
          const genreSnapshots = await Promise.all(genrePromises);
          const genreData = genreSnapshots.map(snap => snap.val() ? ({ id: snap.key, ...snap.val() }) : null).filter(Boolean);
          setGenres(genreData);
        }

        // Fetch related books
        const relatedBooksRef = ref(database, 'books');
        const relatedBooksSnapshot = await get(relatedBooksRef);
        const allBooks = relatedBooksSnapshot.val();
        if (allBooks) {
          const related = Object.entries(allBooks)
            .filter(([id, relatedBook]) =>
              id !== bookId && relatedBook.authorId === bookData.authorId
            )
            .map(([id, book]) => ({ id, ...book }))
            .slice(0, 3);
          setRelatedBooks(related);
        }

        // Check favorites and borrow status
        if (user && user.uid) {
          // Check favorites
          const userRef = ref(database, `users/${user.uid}`);
          const userSnapshot = await get(userRef);
          const userData = userSnapshot.val();
          if (userData && userData.favoriteBooks) {
            setIsFavorite(userData.favoriteBooks.hasOwnProperty(bookId));
          }

          // Check borrow status
          const borrowRequestsRef = ref(database, 'borrowRequests');
          const borrowRequestsSnapshot = await get(borrowRequestsRef);
          const borrowRequests = borrowRequestsSnapshot.val();
          
          if (borrowRequests) {
            const userRequests = Object.values(borrowRequests).filter(request => 
              request.requesterId === user.uid && 
              request.bookId === bookId
            );

            if (userRequests.length > 0) {
              const latestRequest = userRequests[userRequests.length - 1];
              if (latestRequest.status === 'approved') {
                setBorrowStatus('borrowed');
              } else if (latestRequest.status === 'pending') {
                setBorrowStatus('pending');
              }
            }
          }
        }

        // Fetch same genre books
        if (bookData.genreIds && bookData.genreIds.length > 0) {
          const mainGenreId = bookData.genreIds[0];
          const sameGenreBooksRef = ref(database, 'books');
          const sameGenreBooksSnapshot = await get(sameGenreBooksRef);
          const allBooks = sameGenreBooksSnapshot.val();
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

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching book data:", error);
        setError("An error occurred while loading the book data");
        setIsLoading(false);
      }
    };

    fetchBookData();
  }, [bookId, user]);

  const handleFavoriteClick = async () => {
    if (!user || !user.uid) {
      alert("Vui lòng đăng nhập để thêm sách vào danh sách yêu thích.");
      return;
    }

    try {
      const userRef = ref(database, `users/${user.uid}/favoriteBooks`);
      const favoritesSnapshot = await get(userRef);
      const currentFavorites = favoritesSnapshot.val() || {};

      if (isFavorite) {
        delete currentFavorites[bookId];
      } else {
        currentFavorites[bookId] = true;
      }

      await update(ref(database, `users/${user.uid}`), { favoriteBooks: currentFavorites });

      setIsFavorite(!isFavorite);
      alert(isFavorite ? "Đã xóa khỏi danh sách yêu thích" : "Đã thêm vào danh sách yêu thích");
    } catch (error) {
      console.error("Error updating favorites:", error);
      alert("Có lỗi xảy ra khi cập nhật danh sách yêu thích");
    }
  };

  const handleRelatedBookClick = (relatedBookId) => {
    navigate(`/book/${relatedBookId}`, { state: { user } });
  };

  const handleReadBook = () => {
    if (chapters.length > 0) {
      const firstChapter = chapters[0];
      navigate(`/book/${bookId}/chapter/${firstChapter.id}`, { state: { user, chapter: firstChapter } });
    } else {
      alert("Không có chương nào để đọc.");
    }
  };

  const handleBorrowRequest = async () => {
    if (!user || !user.uid) {
      alert("Vui lòng đăng nhập để yêu cầu mượn sách.");
      return;
    }

    if (borrowStatus !== 'available') {
      alert(borrowStatus === 'pending' 
        ? "Bạn đã gửi yêu cầu mượn sách này và đang chờ xét duyệt." 
        : "Bạn đang mượn sách này.");
      return;
    }

    try {
      const borrowRequest = {
        bookId: bookId,
        title: book.title,
        author: authors.map(author => author.name).join(', '),
        requester: user.displayName || user.email,
        requesterId: user.uid,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        coverUrl: book.coverUrl,
        requestType: 'borrow',
      };

      const borrowRequestsRef = ref(database, 'borrowRequests');
      await push(borrowRequestsRef, borrowRequest);
      
      setBorrowStatus('pending');
      alert("Yêu cầu mượn sách đã được gửi thành công! Vui lòng đợi quản trị viên xét duyệt.");
    } catch (error) {
      console.error("Error sending borrow request:", error);
      alert("Có lỗi xảy ra khi gửi yêu cầu mượn sách.");
    }
  };

  
  if (isLoading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!book) return <div>Không tìm thấy sách</div>;

  return (
    <div className="dt-book-detail-page">
      <HomeNav user={user} />
      <div className="dt-book-detail-content">
      <BookMainInfo
          book={book}
          genres={genres}
          isFavorite={isFavorite}
          handleFavoriteClick={handleFavoriteClick}
          handleReadBook={handleReadBook}
          handleBorrowRequest={handleBorrowRequest}
          borrowStatus={borrowStatus}
        />
        <BookAdditionalInfo book={book} />
        <AuthorInfo authors={authors} />
        <ProducerInfo producer={producer} />
        {chapters.length > 0 ? (
          <ChaptersList chapters={chapters} bookId={bookId} />
        ) : (
          <p>Không có thông tin về các chương.</p>
        )}
        <RelatedBooks relatedBooks={relatedBooks} handleRelatedBookClick={handleRelatedBookClick} />
        <SameGenreBooks sameGenreBooks={sameGenreBooks} handleRelatedBookClick={handleRelatedBookClick} />
      </div>
      <HomeFoot />
    </div>
  );
}

function BookMainInfo({ book, genres, isFavorite, handleFavoriteClick, handleReadBook, handleBorrowRequest, borrowStatus }) {
  const getBorrowButtonText = (status) => {
    switch (status) {
      case 'borrowed':
        return "Đang mượn sách";
      case 'pending':
        return "Đang chờ xét duyệt";
      default:
        return "Mượn sách";
    }
  };

  return (
    <div className="dt-book-main-info">
      <div className="dt-bookDetail-cover">
        {book.coverUrl && <img src={book.coverUrl} alt={book.title} />}
      </div>
      <div className="dt-bookDetail-info">
        <h1>{book.title}</h1>
        <div className="dt-genre-list">
          {genres.map((genre) => (
            <span key={genre.id} className="dt-genre-tag">{genre.name}</span>
          ))}
        </div>
        {book.description && <p className="dt-description">{book.description}</p>}
        <div className="dt-bookDetail-actions">
          <button className="dt-read-button" onClick={handleReadBook}>
            Đọc sách
          </button>
          <button
            className="dt-borrow-button"
            onClick={handleBorrowRequest}
            disabled={borrowStatus !== 'available'}
            style={{
              opacity: borrowStatus !== 'available' ? 0.6 : 1,
              cursor: borrowStatus !== 'available' ? 'not-allowed' : 'pointer'
            }}
          >
            {getBorrowButtonText(borrowStatus)}
          </button>
          <button className="dt-favorite-button" onClick={handleFavoriteClick}>
            {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
          </button>
        </div>
      </div>
    </div>
  );
}

function BookAdditionalInfo({ book }) {
  return (
    <div className="dt-book-additional-info">
      <h2>Thông tin chi tiết</h2>
      <table>
        <tbody>
          {book.publicationDate && (
            <tr><td>Ngày xuất bản:</td><td>{new Date(book.publicationDate).toLocaleDateString('vi-VN')}</td></tr>
          )}
          {book.pages && <tr><td>Số trang:</td><td>{book.pages}</td></tr>}
          {book.language && <tr><td>Ngôn ngữ:</td><td>{book.language}</td></tr>}
          {book.isbn && <tr><td>ISBN:</td><td>{book.isbn}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}



function ProducerInfo({ producer }) {
  if (!producer) return <p>Không có thông tin về nhà sản xuất.</p>;

  return (
    <div className="dt-producer-info">
      <h2>Thông tin nhà sản xuất</h2>
      <p><strong>Tên:</strong> {producer.name}</p>
      <p><strong>Quốc gia:</strong> {producer.country}</p>
      <p><strong>Năm thành lập:</strong> {producer.founded}</p>
      <p><strong>Mô tả:</strong> {producer.description}</p>
    </div>
  );
}

function ChaptersList({ chapters, bookId }) {
  const [currentPage, setCurrentPage] = useState(1);
  const chaptersPerPage = 5;
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;

  if (!chapters || chapters.length === 0) return <p>Không có thông tin về các chương.</p>;

  const sortedChapters = [...chapters].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  const indexOfLastChapter = currentPage * chaptersPerPage;
  const indexOfFirstChapter = indexOfLastChapter - chaptersPerPage;
  const currentChapters = sortedChapters.slice(indexOfFirstChapter, indexOfLastChapter);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleChapterClick = (chapter) => {
    if (bookId && chapter.id) {
      navigate(`/book/${bookId}/chapter/${chapter.id}`, { state: { user, chapter } });
    } else {
      console.error("BookId or ChapterId is undefined", { bookId, chapterId: chapter.id });
    }
  };

  return (
    <div className="dt-book-chapters">
      <h2>Danh sách các chương</h2>
      <ul className="dt-chapter-list">
        {currentChapters.map((chapter) => (
          <li
            key={chapter.id}
            className="dt-chapter-item"
            onClick={() => handleChapterClick(chapter)}
          >
            <span className="dt-chapter-title">
              {chapter.title || `Chương ${chapter.orderIndex || 'Không xác định'}`}
            </span>
          </li>
        ))}
      </ul>
      <Pagination
        chaptersPerPage={chaptersPerPage}
        totalChapters={chapters.length}
        paginate={paginate}
        currentPage={currentPage}
      />
    </div>
  );
}

function Pagination({ chaptersPerPage, totalChapters, paginate, currentPage }) {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalChapters / chaptersPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="dt-pagination">
        {pageNumbers.map(number => (
          <li key={number} className={`dt-page-item ${currentPage === number ? 'active' : ''}`}>
            <button onClick={() => paginate(number)} className="dt-page-link">
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function RelatedBooks({ relatedBooks, handleRelatedBookClick }) {
  if (relatedBooks.length === 0) return null;

  return (
    <div className="dt-related-books">
      <h2>Các tác phẩm khác của tác giả</h2>
      <div className="dt-book-grid">
        {relatedBooks.map(relatedBook => (
          <div key={relatedBook.id} className="dt-book-card" onClick={() => handleRelatedBookClick(relatedBook.id)}>
            {relatedBook.coverUrl && <img src={relatedBook.coverUrl} alt={relatedBook.title} />}
            <h3>{relatedBook.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

function SameGenreBooks({ sameGenreBooks, handleRelatedBookClick }) {
  if (sameGenreBooks.length === 0) return null;

  return (
    <div className="dt-same-genre-books">
      <h2>Sách cùng thể loại</h2>
      <div className="dt-book-grid">
        {sameGenreBooks.map(book => (
          <div key={book.id} className="dt-book-card" onClick={() => handleRelatedBookClick(book.id)}>
            {book.coverUrl && <img src={book.coverUrl} alt={book.title} />}
            <h3>{book.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookDetail;