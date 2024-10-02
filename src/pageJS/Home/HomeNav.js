import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDatabase, ref, onValue } from "firebase/database";
import avatarIcon from '../../resource/image/Avatar.png';
import '../../pageCSS/HomeCss/HomeNavCss.css'

function HomeNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const [categories, setCategories] = useState([]);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const db = getDatabase();
    const categoriesRef = ref(db, 'categories');
    onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const categoriesList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setCategories(categoriesList);
      }
    });
  }, []);

  const handleNavigation = (path, userId) => {
    navigate(path, { state: { user, userId } });
    setIsNavOpen(false);
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <>
      <button className="nav-toggle" onClick={toggleNav}>
        {isNavOpen ? '✕' : '☰'}
      </button>
      <header className={isNavOpen ? 'open' : ''}>
        <nav>
          <ul>
            <li><div onClick={() => handleNavigation('/Home')}>Trang chủ</div></li>
            <li>
              <div className="dropdown">
                <button className="dropbtn">Thể loại</button>
                <div className="dropdown-content">
                  {categories.map((category) => (
                    <div key={category.id} onClick={() => handleNavigation(`/category/${category.id}`, { categoryId: category.id })}>
                      {category.name}
                    </div>
                  ))}
                </div>
              </div>
            </li>
            <li><div onClick={() => handleNavigation('/Author')}>Tác giả</div></li>
            <li><div onClick={() => handleNavigation('/BookLibrary')}>Kho sách</div></li>
          </ul>
          <div className='searchAvatar'>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm sách..."
              />
              <button type="submit">Tìm</button>
            </div>
            <div className="avatar">
              {user ? (
                <>
                  <div onClick={() => handleNavigation(`/user/profile/${user.uid}`, user.uid)}>
                    <span>{user.email}</span>
                  </div>
                  <img src={avatarIcon} alt="Avatar" />
                </>
              ) : (
                <div onClick={() => handleNavigation('/login')}>Đăng nhập</div>
              )}
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

export default HomeNav;