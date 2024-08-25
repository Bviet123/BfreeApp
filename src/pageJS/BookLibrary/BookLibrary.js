import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../pageCSS/BookLibraryCss/BookLibraryCss.css';
import HomeFoot from '../Home/HomeFoot';
import HomeNav from '../Home/HomeNav';

function BookLibrary() {
    const [books, setBooks] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const user = location.state?.user;

    useEffect(() => {
        setBooks(sampleBooks);
      }, []);

    const sampleBooks = [
        {
            id: 1,
            title: "Đắc Nhân Tâm",
            author: "Dale Carnegie",
            cover: "https://salt.tikicdn.com/cache/w1200/ts/product/2e/eb/ad/43a9c8507abd1f26c8af50ed88de5ba4.jpg",
            genre: "Tự giúp bản thân",
            description: "Đắc nhân tâm của Dale Carnegie là quyển sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại. Tác phẩm đã được chuyển ngữ sang hầu hết các thứ tiếng trên thế giới và có mặt ở hàng trăm quốc gia.",
            rating: 4.5,
            price: 86000
        },
        {
            id: 2,
            title: "Nhà Giả Kim",
            author: "Paulo Coelho",
            cover: "https://salt.tikicdn.com/cache/w1200/ts/product/37/d7/e2/e4d3ecdb9d7e3141ebfb1f46a2a31191.jpg",
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
            cover: "https://salt.tikicdn.com/cache/w1200/ts/product/b5/b8/d0/b944ef03ada72c1c3851e515c47b4826.jpg",
            genre: "Khoa học",
            description: "Sapiens là một câu chuyện lớn về sự tiến hóa của loài người. Yuval Noah Harari sử dụng kiến thức từ sinh học, nhân chủng học, cổ sinh vật học và kinh tế học để giải thích làm thế nào Homo sapiens trở thành loài sinh vật thống trị trên Trái đất.",
            rating: 4.9,
            price: 299000
        },
        {
            id: 5,
            title: "Tôi Tài Giỏi, Bạn Cũng Thế",
            author: "Adam Khoo",
            cover: "https://salt.tikicdn.com/cache/w1200/ts/product/22/cb/a9/524a27dcd45e8a13ae6eecb3dfacba7c.jpg",
            genre: "Giáo dục",
            description: "Tôi Tài Giỏi, Bạn Cũng Thế! là cuốn sách bán chạy nhất của Adam Khoo, đã được dịch ra 25 thứ tiếng và bán ra hơn 1 triệu bản trên toàn thế giới.",
            rating: 4.6,
            price: 110000
        },
        {
            id: 6,
            title: "Điều Kỳ Diệu Của Tiệm Tạp Hóa Namiya",
            author: "Higashino Keigo",
            cover: "https://salt.tikicdn.com/cache/w1200/ts/product/22/33/56/02f95cbe44c3b8432712e16243c72a65.jpg",
            genre: "Tiểu thuyết",
            description: "Điều Kỳ Diệu Của Tiệm Tạp Hóa Namiya là câu chuyện li kì, hấp dẫn về một tiệm tạp hóa cũ với những bức thư bí ẩn. Với ngòi bút tài hoa, Keigo Higashino đã tạo nên một tác phẩm vừa hồi hộp vừa ấm áp tình người.",
            rating: 4.7,
            price: 105000
        }
    ];

    const handleBookClick = (book) => {
        navigate('/BookDetail', { state: { user, book } });
    };

    return (
        
        <div className="book-library">
            <HomeNav />
            <div className="book-list">
                {books.map(book => (
                    <div key={book.id} onClick={() => handleBookClick(book)} className="book-item">
                        <img src={book.cover} alt={book.title} className="book-cover-library" />
                        <div className="book-info-library">
                            <h3 className="book-title">{book.title}</h3>
                            <p className="book-author">{book.author}</p>
                            <p className="book-genre">{book.genre}</p>
                            <p className="book-description">{book.description.substring(0, 100)}...</p>
                        </div>
                    </div>
                ))}
            </div>
            <HomeFoot/>
        </div>
    );
}

export default BookLibrary;
