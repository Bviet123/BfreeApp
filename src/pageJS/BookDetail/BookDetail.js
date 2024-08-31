import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import '../../pageCSS/BookDetailCss/BookDetailCss.css'

import image1 from '../../resource/image/DacNhanTam.jpeg';
import HomeNav from '../Home/HomeNav';
import HomeFoot from '../Home/HomeFoot';
import img1 from '../../resource/image/SoDo.jpeg';
import img2 from '../../resource/image/TuDienTiengEm.jpeg';
import img3 from '../../resource/image/NhaGiaKim.jpeg';

function BookDetail() {
  const { id } = useParams();

  const location = useLocation();
  const user = location.state?.user;

  // Dữ liệu mẫu
  const book = {
    id: 1,
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    cover: image1,
    genre: ["Tự giúp bản thân", "Tâm lý học"],
    description: "Đắc Nhân Tâm của Dale Carnegie là một trong những cuốn sách bán chạy nhất mọi thời đại. Đây là cuốn sách dạy về cách ứng xử, cư xử trong cuộc sống để đạt được thành công.",
    publicationDate: "17/10/1936",
    publisher: "Simon and Schuster",
    pages: 292,
    language: "Tiếng Việt",
    isbn: "978-604-1-XXXXX-X",
  };

  const author = {
    name: "Dale Carnegie",
    bio: "Dale Carnegie là một nhà văn và nhà thuyết trình người Mỹ và là người phát triển các lớp tự giáo dục, nghệ thuật bán hàng, huấn luyện đoàn thể, nói trước công chúng và các kỹ năng giao tiếp giữa mọi người.",
  };

  const relatedBooks = [
    { id: 2, title: "Nhà Giả Kim", author: "Paulo Coelho", cover: img3 },
    { id: 3, title: "Số Đỏ", author: "Vũ Trọng Phụng", cover: img1 },
    { id: 4, title: "Từ Điển Tiếng Em", author: "Khotudien", cover: img2 }
  ];

  return (
    <div className="book-detail-page">
      <HomeNav />
      <div className="book-detail-content">
        <div className="book-main-info">
          <div className="book-cover">
            <img src={book.cover} alt={book.title} />
          </div>
          <div className="bookDetail-info">
            <h1>{book.title}</h1>
            <p className="author">Tác giả: <Link to={`/author/${author.name}`}>{book.author}</Link></p>
            <div className="genre-list">
              {book.genre.map((genre, index) => (
                <span key={index} className="genre-tag">{genre}</span>
              ))}
            </div>
            <p className="description">{book.description}</p>
            <div>
              <button className="read-button">Đọc sách</button>
              <button className="buy-button">Mượn sách</button>
            </div>
          </div>
        </div>

        <div className="book-additional-info">
          <h2>Thông tin chi tiết</h2>
          <table>
            <tbody>
              <tr><td>Ngày xuất bản:</td><td>{book.publicationDate}</td></tr>
              <tr><td>Nhà xuất bản:</td><td>{book.publisher}</td></tr>
              <tr><td>Số trang:</td><td>{book.pages}</td></tr>
              <tr><td>Ngôn ngữ:</td><td>{book.language}</td></tr>
              <tr><td>ISBN:</td><td>{book.isbn}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="author-info">
          <h2>Về tác giả</h2>
          <p>{author.bio}</p>
        </div>

        <div className="related-books">
          <h2>Một số tác phẩm khác</h2>
          <div className="book-grid">
            {relatedBooks.map(book => (
              <Link to={`/book/${book.id}`} key={book.id} className="book-card">
                <img src={book.cover} alt={book.title} />
                <h3>{book.title}</h3>
                <p>{book.author}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <HomeFoot />
    </div>
  );
}

export default BookDetail;