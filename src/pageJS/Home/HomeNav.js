import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth, signOut } from 'firebase/auth';
import NotificationsModal from './NotificationsModal';
import '../../pageCSS/HomeCss/HomeNavCss.css';

const HomeNav = ({ user: userProp }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = userProp || location.state?.user;
  const [categories, setCategories] = useState([]);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // New state for navigation visibility
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);

  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth <= 768;
      setIsMobile(newIsMobile);
      
      if (newIsMobile) {
        setIsDropdownOpen(false);
        setIsNavOpen(false);
        setIsNavVisible(true); // Reset nav visibility for mobile
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add scroll handling effect - only when not mobile
  useEffect(() => {
    // Only add scroll listener when not in mobile mode
    if (!isMobile) {
      const handleScroll = () => {
        const currentScrollPosition = window.pageYOffset;

        // Only change visibility if scrolled past a threshold to prevent minor scrolls from triggering
        if (currentScrollPosition > 100) {
          // If scrolling down and current position is more than last position
          if (currentScrollPosition > lastScrollPosition) {
            setIsNavVisible(false);
          } 
          // If scrolling up
          else if (currentScrollPosition < lastScrollPosition) {
            setIsNavVisible(true);
          }
          
          // Update last scroll position
          setLastScrollPosition(currentScrollPosition);
        } else {
          // Always show nav when near the top of the page
          setIsNavVisible(true);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isMobile, lastScrollPosition]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Xử lý dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
  
      // Xử lý đóng navbar khi click ngoài
      const header = document.querySelector('header');
      const navToggle = document.querySelector('.nav-toggle');
      
      if (
        isNavOpen && 
        header && 
        !header.contains(event.target) && 
        navToggle && 
        !navToggle.contains(event.target)
      ) {
        setIsNavOpen(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNavOpen]);

  // Fetch categories and user data
  useEffect(() => {
    setIsLoading(true);
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
      setIsLoading(false);
    });

    if (user && user.uid) {
      const userRef = ref(db, `users/${user.uid}`);
      const unsubscribeUser = onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          if (userData.avatar) {
            setUserAvatar(userData.avatar);
          }
          setIsAdmin(userData.role === 'Admin');
        }
      });

      return () => {
        unsubscribeCategories();
        unsubscribeUser();
      };
    }

    return () => unsubscribeCategories();
  }, [user]);

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

  const handleNavigation = (path, navigationState = {}) => {
    navigate(path, { 
      state: { 
        ...navigationState,
        user, 
      } 
    });
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
    if (isMobile || !user) {
      return null; 
    }

    return (
      <div className="user-section" ref={userDropdownRef}>
        <div className={`avatar ${isUserDropdownOpen ? 'open' : ''}`}>
          <div className="NavUser-info" onClick={toggleUserDropdown}>
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
              <div onClick={() => handleNavigation(`/user/profile/${user.uid}`)}>
                Thông tin
              </div>
              {isAdmin && (
                <div onClick={() => handleNavigation('/admin/users')}>
                  Quản lý
                </div>
              )}
              <div onClick={handleLogout}>Đăng xuất</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <button 
        className="nav-toggle" 
        onClick={toggleNav}
        style={{ 
          display: isMobile ? 'block' : (isNavVisible ? 'block' : 'none'),
          position: 'fixed',
          top: !isMobile && !isNavVisible ? '-50px' : '10px',
          transition: 'top 0.3s ease-in-out'
        }}
      >
        {isNavOpen ? '✕' : '☰'}
      </button>

      <header 
        className={`${isNavOpen ? 'open' : ''} ${!isMobile && !isNavVisible ? 'nav-hidden' : ''}`}
        style={{
          transform: !isMobile && !isNavVisible ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 0.3s ease-in-out',
          position: 'fixed',
          width: '100%',
          zIndex: 1000
        }}
      >
        <nav>
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
                    {isLoading ? (
                      <div className="bs-loading-container">
                        <div className="bs-loading-spinner"></div>
                      </div>
                    ) : (
                      categories.map((category) => (
                        <div
                          key={category.id}
                          onClick={() => handleNavigation('/library', { categoryId: category.id })}
                        >
                          {category.name}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </li>
            <li>
              <div onClick={() => handleNavigation('/library')}>Kho sách</div>
            </li>
            {isMobile && user && (
              <>
                <li>
                  <div onClick={() => handleNavigation(`/user/profile/${user.uid}`)}>
                    Thông tin
                  </div>
                </li>
                {isAdmin && (
                  <li>
                    <div onClick={() => handleNavigation('/admin/users')}>
                      Quản lý
                    </div>
                  </li>
                )}
                <li>
                  <div onClick={handleLogout}>Đăng xuất</div>
                </li>
              </>
            )}
          </ul>
          <div className="userSection">
            {user && (
              <>
                <NotificationsModal user={user} />
                {!isMobile && renderUserInfo()}
              </>
            )}
          </div>
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