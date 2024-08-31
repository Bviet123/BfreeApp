import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function HomeMain() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;

  const handleBookClick = (book) => {
    navigate('/BookDetail', { state: { user, book } });
  };

  const featuredBooks = [
    {
      id: 1,
      title: "Đắc Nhân Tâm",
      author: "Dale Carnegie",
      cover: "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
      genre: "Tự giúp bản thân",
      description: "Đắc nhân tâm của Dale Carnegie là quyển sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại. Tác phẩm đã được chuyển ngữ sang hầu hết các thứ tiếng trên thế giới và có mặt ở hàng trăm quốc gia.",
      rating: 4.5,
      price: 86000
    },
    {
      id: 2,
      title: "Nhà Giả Kim",
      author: "Paulo Coelho",
      cover: "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
      genre: "Tiểu thuyết",
      description: "Tác phẩm Nhà giả kim của Paulo Coelho như một câu chuyện cổ tích giản dị, nhân ái, giàu chất thơ, thấm đẫm những minh triết huyền bí của phương Đông.",
      rating: 4.7,
      price: 69000
    },
    {
      id: 3,
      title: "Cây Cam Ngọt Của Tôi",
      author: "José Mauro de Vasconcelos",
      cover: "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
      genre: "Văn học",
      description: "Cây Cam Ngọt Của Tôi là một tác phẩm tự truyện đầy xúc động của nhà văn Brazil José Mauro de Vasconcelos. Cuốn sách kể về Zezé, một cậu bé tinh nghịch và mơ mộng.",
      rating: 4.8,
      price: 108000
    },
    {
      id: 4,
      title: "Sapiens: Lược Sử Loài Người",
      author: "Yuval Noah Harari",
      cover: "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
      genre: "Khoa học",
      description: "Sapiens là một câu chuyện lớn về sự tiến hóa của loài người. Yuval Noah Harari sử dụng kiến thức từ sinh học, nhân chủng học, cổ sinh vật học và kinh tế học để giải thích làm thế nào Homo sapiens trở thành loài sinh vật thống trị trên Trái đất.",
      rating: 4.9,
      price: 299000
    },
    {
      id: 5,
      title: "Tôi Tài Giỏi, Bạn Cũng Thế",
      author: "Adam Khoo",
      cover: "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
      genre: "Giáo dục",
      description: "Tôi Tài Giỏi, Bạn Cũng Thế! là cuốn sách bán chạy nhất của Adam Khoo, đã được dịch ra 25 thứ tiếng và bán ra hơn 1 triệu bản trên toàn thế giới.",
      rating: 4.6,
      price: 110000
    },
    {
      id: 6,
      title: "Điều Kỳ Diệu Của Tiệm Tạp Hóa Namiya",
      author: "Higashino Keigo",
      cover: "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
      genre: "Tiểu thuyết",
      description: "Điều Kỳ Diệu Của Tiệm Tạp Hóa Namiya là câu chuyện li kì, hấp dẫn về một tiệm tạp hóa cũ với những bức thư bí ẩn. Với ngòi bút tài hoa, Keigo Higashino đã tạo nên một tác phẩm vừa hồi hộp vừa ấm áp tình người.",
      rating: 4.7,
      price: 105000
    }
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

  return (
    <main>
      <section className="featured-books">
        <h2>Sách nổi bật</h2>
        <div className="book-grid">
          {featuredBooks.map(book => (
            <div key={book.id} onClick={() => handleBookClick(book)} className="book-card">
              <img src={book.cover} alt={book.title} />
              <div className="book-info">
                <h3>{book.title}</h3>
                <p>{book.author}</p>
                <p className="book-genre">{book.genre}</p>
                <p className="book-description">{book.description.substring(0, 100)}...</p>
                
              </div>
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
  );
}

export default HomeMain;