import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDatabase, ref, onValue } from "firebase/database";
import '../../pageCSS/HomeCss/HomeNavCss.css';
import { getAuth, signOut } from 'firebase/auth';

function HomeNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const [categories, setCategories] = useState([]);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsDropdownOpen(false);
        setIsNavOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch categories and user data
  useEffect(() => {
    const db = getDatabase();
    const categoriesRef = ref(db, 'categories');
    const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const categoriesList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setCategories(categoriesList);
      }
    });

    if (user && user.uid) {
      const userRef = ref(db, `users/${user.uid}`);
      const unsubscribeUser = onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.avatar) {
          setUserAvatar(userData.avatar);
        }
      });

      return () => {
        unsubscribeCategories();
        unsubscribeUser();
      };
    }

    return () => unsubscribeCategories();
  }, [user]);

  // Handle body class for nav open state
  useEffect(() => {
    if (isNavOpen) {
      document.body.classList.add('nav-open');
    } else {
      document.body.classList.remove('nav-open');
    }
    return () => {
      document.body.classList.remove('nav-open');
    };
  }, [isNavOpen]);

  const handleNavigation = (path, userId) => {
    navigate(path, { state: { user, userId } });
    setIsNavOpen(false);
    setIsUserDropdownOpen(false);
    setIsDropdownOpen(false);
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
    setIsUserDropdownOpen(false);
    setIsDropdownOpen(false);
  };

  const toggleUserDropdown = (e) => {
    e.stopPropagation();
    setIsUserDropdownOpen(!isUserDropdownOpen);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    if (isMobile) {
      setIsDropdownOpen(!isDropdownOpen);
      setIsUserDropdownOpen(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality here
      console.log('Searching for:', searchQuery);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderUserInfo = () => {
    if (isMobile) {
      return null; // Mobile user info is rendered in the main menu
    }

    return (
      <div className="user-section" ref={userDropdownRef}>
        <div className={`avatar ${isUserDropdownOpen ? 'open' : ''}`}>
          <div className="user-info" onClick={toggleUserDropdown}>
            <span>{user.email}</span>
            {userAvatar ? (
              <img src={userAvatar} alt="User Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {user.email.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {isUserDropdownOpen && (
            <div className="user-dropdown">
              <div onClick={() => handleNavigation(`/user/profile/${user.uid}`, user.uid)}>
                Thông tin
              </div>
              <div onClick={handleLogout}>Đăng xuất</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <button className="nav-toggle" onClick={toggleNav}>
        {isNavOpen ? '✕' : '☰'}
      </button>
      
      <header className={isNavOpen ? 'open' : ''}>
        <nav>
          <div className="searchAvatar">
            <form className="search-bar" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Tìm kiếm sách..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">Tìm</button>
            </form>
            {!isMobile && user && renderUserInfo()}
          </div>

          <ul className="nav-list">
            <li>
              <div onClick={() => handleNavigation('/Home')}>Trang chủ</div>
            </li>
            <li ref={dropdownRef}>
              <div className={`dropdown ${isDropdownOpen ? 'open' : ''}`}>
                <button className="dropbtn" onClick={toggleDropdown}>
                  Thể loại {isMobile && <span className="dropdown-arrow">▼</span>}
                </button>
                {(!isMobile || isDropdownOpen) && (
                  <div className="dropdown-content">
                    {categories.map((category) => (
                      <div 
                        key={category.id}
                        onClick={() => handleNavigation(`/category/${category.id}`, { categoryId: category.id })}
                      >
                        {category.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </li>
            <li>
              <div onClick={() => handleNavigation('/Author')}>Tác giả</div>
            </li>
            <li>
              <div onClick={() => handleNavigation('/BookLibrary')}>Kho sách</div>
            </li>
            {isMobile && user && (
              <>
                <li>
                  <div onClick={() => handleNavigation(`/user/profile/${user.uid}`, user.uid)}>
                    Thông tin
                  </div>
                </li>
                <li>
                  <div onClick={handleLogout}>Đăng xuất</div>
                </li>
              </>
            )}
          </ul>

          {!user && (
            <div className="login-button" onClick={() => handleNavigation('/login')}>
              Đăng nhập
            </div>
          )}
        </nav>
      </header>
    </>
  );
}

export default HomeNav;