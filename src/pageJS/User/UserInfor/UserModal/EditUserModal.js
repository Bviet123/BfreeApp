import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getDatabase, ref, set, onValue, update } from 'firebase/database';
import '../../../../pageCSS/User/UserProfileCss/UserModalCss/EditUserModalCss.css';

const EditUserModal = ({ user, onClose, onUpdate }) => {
  const [editedUser, setEditedUser] = useState({ ...user });
  const [genres, setGenres] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [imagePreview, setImagePreview] = useState(user.avatar);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [isPublisherDropdownOpen, setIsPublisherDropdownOpen] = useState(false);
  const [error, setError] = useState(null);
  const genreDropdownRef = useRef(null);
  const publisherDropdownRef = useRef(null);

  useEffect(() => {
    const db = getDatabase();

    const fetchData = (path, setter) => {
      const dataRef = ref(db, path);
      return onValue(dataRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.entries(data).map(([key, value]) => ({
            id: key,
            name: value.name
          }));
          setter(list);
        }
      }, (error) => {
        console.error(`Error fetching ${path}:`, error);
        setError(`Lỗi khi tải dữ liệu: ${error.message}`);
      });
    };

    const unsubscribeCategories = fetchData('categories', setGenres);
    const unsubscribePublishers = fetchData('producers', setPublishers);

    if (user.favoriteGenres && typeof user.favoriteGenres === 'object') {
      setSelectedGenres(Object.entries(user.favoriteGenres).map(([id, name]) => ({ id, name })));
    }

    const handleClickOutside = (event) => {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target)) {
        setIsGenreDropdownOpen(false);
      }
      if (publisherDropdownRef.current && !publisherDropdownRef.current.contains(event.target)) {
        setIsPublisherDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribeCategories();
      unsubscribePublishers();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditedUser(prevState => ({
      ...prevState,
      [name]: value
    }));
  }, []);

  const handleGenreToggle = useCallback((genre) => {
    setSelectedGenres(prevSelected => {
      const isSelected = prevSelected.some(g => g.id === genre.id);
      return isSelected
        ? prevSelected.filter(g => g.id !== genre.id)
        : [...prevSelected, genre];
    });
  }, []);

  const handlePublisherSelect = useCallback((publisher) => {
    setEditedUser(prevState => ({
      ...prevState,
      publisher: publisher
    }));
    setIsPublisherDropdownOpen(false);
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setEditedUser(prevState => ({
          ...prevState,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSave = useCallback(() => {
    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);
  
    const updatedUser = {
      uid: user.uid,
      avatar: editedUser.avatar || "",
      email: editedUser.email,
      password: editedUser.password,
      role: editedUser.role || "Người dùng",
      fullName: editedUser.fullName || "",
      birthDate: editedUser.birthDate || "",
      gender: editedUser.gender || "",
      favoriteGenres: selectedGenres.length > 0 
        ? selectedGenres.reduce((acc, genre) => {
            acc[genre.id] = genre.name;
            return acc;
          }, {})
        : { default: "Chưa có" },
      readingGoal: editedUser.readingGoal || "",
      favoriteBooks: editedUser.favoriteBooks || { default: "Chưa có" },
      borrowedBooks: editedUser.borrowedBooks || { default: "Chưa có" },
      createdAt: editedUser.createdAt,
      lastUpdated: new Date().toISOString()
    };
  
    update(userRef, updatedUser)
      .then(() => {
        console.log('User updated successfully');
        if (typeof onUpdate === 'function') {
          onUpdate(updatedUser);
        }
        onClose();
      })
      .catch((error) => {
        console.error('Error updating user:', error);
        setError(`Lỗi khi cập nhật thông tin: ${error.message}`);
      });
  }, [editedUser, selectedGenres, user.uid, onClose, onUpdate]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }, []);

  if (error) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Đã xảy ra lỗi</h3>
          <p>{error}</p>
          <button onClick={onClose}>Đóng</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Chỉnh sửa thông tin người dùng</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="avatar">Ảnh đại diện</label>
            <input type="file" id="avatar" name="avatar" accept="image/*" onChange={handleImageChange} />
            {imagePreview && <img src={imagePreview} alt="Avatar preview" className="avatar-preview" />}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={editedUser.email || ''} readOnly />
          </div>
          
          <div className="form-group">
            <label htmlFor="fullName">Họ và tên</label>
            <input type="text" id="fullName" name="fullName" value={editedUser.fullName || ''} onChange={handleInputChange} />
          </div>
          
          <div className="form-group">
            <label htmlFor="birthDate">Ngày sinh</label>
            <input type="date" id="birthDate" name="birthDate" value={formatDate(editedUser.birthDate)} onChange={handleInputChange} />
          </div>
          
          <div className="form-group">
            <label htmlFor="gender">Giới tính</label>
            <select id="gender" name="gender" value={editedUser.gender || ''} onChange={handleInputChange}>
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          
          <div className="form-group" ref={genreDropdownRef}>
            <label htmlFor="genres">Thể loại yêu thích</label>
            <div className="custom-dropdown">
              <div className="dropdown-toggle" onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}>
                {selectedGenres.length > 0 ? selectedGenres.map(g => g.name).join(', ') : 'Chọn thể loại...'}
              </div>
              {isGenreDropdownOpen && (
                <div className="dropdown-menu">
                  {genres.map(genre => (
                    <div
                      key={genre.id}
                      className={`dropdown-item ${selectedGenres.some(g => g.id === genre.id) ? 'selected' : ''}`}
                      onClick={() => handleGenreToggle(genre)}
                    >
                      {genre.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group" ref={publisherDropdownRef}>
            <label htmlFor="publisher">Nhà xuất bản yêu thích</label>
            <div className="custom-dropdown">
              <div className="dropdown-toggle" onClick={() => setIsPublisherDropdownOpen(!isPublisherDropdownOpen)}>
                {editedUser.publisher ? editedUser.publisher.name : 'Chọn nhà xuất bản...'}
              </div>
              {isPublisherDropdownOpen && (
                <div className="dropdown-menu">
                  {publishers.map(publisher => (
                    <div
                      key={publisher.id}
                      className="dropdown-item"
                      onClick={() => handlePublisherSelect(publisher)}
                    >
                      {publisher.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="readingGoal">Mục tiêu đọc sách</label>
            <textarea
              id="readingGoal"
              name="readingGoal"
              value={editedUser.readingGoal || ''}
              onChange={handleInputChange}
              rows="4"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="button" onClick={onClose}>Hủy</button>
          <button className="button primary" onClick={handleSave}>Lưu thay đổi</button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;