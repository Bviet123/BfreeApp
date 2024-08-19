import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../../pageCSS/HomeCss/HomeCss.css';
import img2 from '../../resource/image/DacNhanTam.jpeg'
import img3 from '../../resource/image/NhaGiaKim.jpeg'
import img4 from '../../resource/image/SoDo.jpeg'
import img5 from '../../resource/image/TuDienTiengEm.jpeg'
import img6 from '../../resource/image/LuocSuLoaiNguoi.png'
import img7 from '../../resource/image/ToiTaiGioi.jpeg'
import avatarIcon from '../../resource/image/Avatar.png'

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const user = location.state?.user;

  const featuredBooks = [
    { id: 1, title: "Đắc Nhân Tâm", author: "Dale Carnegie", cover: img2, genre: "Tự giúp bản thân" },
    { id: 2, title: "Nhà Giả Kim", author: "Paulo Coelho", cover: img3, genre: "Tiểu thuyết" },
    { id: 3, title: "Số Đỏ", author: "Vũ Trọng Phụng", cover: img4, genre: "Văn học Việt Nam" },
    { id: 4, title: "Từ Điển Tiếng Em ", author: "Khotudien", cover: img5, genre: "Thơ" },
    { id: 5, title: "Sapiens: Lược Sử Loài Người", author: "Yuval Noah Harari", cover: img6, genre: "Khoa học" },
    { id: 6, title: "Tôi Tài Giỏi, Bạn Cũng Thế", author: "Adam Khoo", cover: img7, genre: "Giáo dục" },
  ];

  const newReleases = [
    { id: 1, title: "Cây Cam Ngọt Của Tôi", author: "José Mauro de Vasconcelos", releaseDate: "01/05/2024" },
    { id: 2, title: "Hoàng Tử Bé", author: "Antoine de Saint-Exupéry", releaseDate: "15/04/2024" },
    { id: 3, title: "Tôi Là Bê Tô", author: "Nguyễn Nhật Ánh", releaseDate: "10/04/2024" },
    { id: 4, title: "Có Hai Con Mèo Ngồi Bên Cửa Sổ", author: "Nguyễn Nhật Ánh", releaseDate: "05/04/2024" },
    { id: 5, title: "Tuổi Trẻ Đáng Giá Bao Nhiêu", author: "Rosie Nguyễn", releaseDate: "01/04/2024" },
    { id: 6, title: "Hai Số Phận", author: "Jeffrey Archer", releaseDate: "20/03/2024" },
    { id: 7, title: "Điều Kỳ Diệu Của Tiệm Tạp Hóa Namiya", author: "Higashino Keigo", releaseDate: "15/03/2024" },
    { id: 8, title: "Những Tù Nhân Của Địa Lý", author: "Tim Marshall", releaseDate: "10/03/2024" },
  ];

  const genres = [
    "Tất cả",
    "Tự giúp bản thân",
    "Tiểu thuyết",
    "Văn học Việt Nam",
    "Thơ",
    "Khoa học",
    "Giáo dục"
  ];

  return (
    <div className="home-page">
      <header>
        <nav>
          <ul>
            <li><a href="/">Trang chủ</a></li>
            <li>
              <div className="dropdown">
                <button className="dropbtn">Thể loại</button>
                <div className="dropdown-content">
                  {genres.map((genre, index) => (
                    <a key={index} href={`/theloai/${genre}`}>{genre}</a>
                  ))}
                </div>
              </div>
            </li>
            <li><a href="/xephang">Xếp hạng</a></li>
          </ul>
          <div className='searchAvatar'>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm sách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit">Tìm</button>
            </div>
            <div className="avatar">
              <span>{user.email}</span>
              <img src={avatarIcon} alt="Avatar" />
            </div>
          </div>
        </nav>
      </header>

      <main>
        <section className="featured-books">
          <h2>Sách nổi bật</h2>
          <div className="book-grid">
            {featuredBooks.map(book => (
              <div key={book.id} className="book-card">
                <img src={book.cover} alt={book.title} />
                <h3>{book.title}</h3>
                <p>{book.author}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="new-releases">
          <h2>Sách mới phát hành</h2>
          <ul>
            {newReleases.map(book => (
              <li key={book.id}>
                <span className="book-title">{book.title}</span>
                <span className="book-author">{book.author}</span>
                <span className="release-date">{book.releaseDate}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer>
        <p>&copy; 2024 All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;