import React, { useState, useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import '../../pageCSS/BookLibraryCss/FilterModalCss.css';
import { database } from '../../firebaseConfig';

const FilterModal = ({ isOpen, onClose, genres, onApplyFilters }) => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [authorFilter, setAuthorFilter] = useState('');
  const [yearStart, setYearStart] = useState('');
  const [yearEnd, setYearEnd] = useState('');
  const [authors, setAuthors] = useState([]);
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const authorInputRef = useRef(null);

  useEffect(() => {
    const authorsRef = ref(database, 'authors');
    const unsubscribe = onValue(authorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const authorList = Object.entries(data).map(([id, author]) => ({
          id,
          name: author.name || 'Không xác định',
        }));
        setAuthors(authorList);
      } else {
        setAuthors([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authors.length === 0) {
      setFilteredAuthors([]);
      return;
    }

    if (authorFilter.trim() === '') {
      setFilteredAuthors(authors);
    } else {
      const filtered = authors.filter(author =>
        author.name && author.name.toLowerCase().includes(authorFilter.toLowerCase())
      );
      setFilteredAuthors(filtered);
    }
  }, [authorFilter, authors]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (authorInputRef.current && !authorInputRef.current.contains(event.target)) {
        setShowAuthorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  const handleGenreChange = (genreId) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId);
      }
      return [...prev, genreId];
    });
  };

  const handleApplyFilters = () => {
    onApplyFilters({
      genres: selectedGenres,
      author: authorFilter,
      yearRange: {
        start: yearStart,
        end: yearEnd
      }
    });
    onClose();
  };

  const handleResetFilters = () => {
    setSelectedGenres([]);
    setAuthorFilter('');
    setYearStart('');
    setYearEnd('');
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const handleAuthorSelect = (author) => {
    setAuthorFilter(author.name || '');
    setShowAuthorDropdown(false);
  };

  return (
    <div className="fm-overlay" onClick={onClose}>
      <div className="fm-content" onClick={stopPropagation}>
        <div className="fm-header">
          <h2>Lọc Sách</h2>
          <button className="fm-close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="fm-body">
          <div className="fm-section">
            <label className="fm-label">Tác giả</label>
            <div className="fm-author-input" ref={authorInputRef}>
              <input
                className="fm-input"
                type="text"
                placeholder="Chọn hoặc nhập tên tác giả..."
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                onFocus={() => setShowAuthorDropdown(true)}
              />
              {showAuthorDropdown && (
                <ul className="fm-author-dropdown">
                  {filteredAuthors.map(author => (
                    <li
                      key={author.id}
                      className="fm-author-dropdown-item"
                      onClick={() => handleAuthorSelect(author)}
                    >
                      {author.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="fm-section">
            <label className="fm-label">Thể loại</label>
            <div className="fm-genre-grid">
              {Object.entries(genres).map(([id, genre]) => (
                <div key={id} className="fm-genre-item">
                  <input
                    type="checkbox"
                    id={id}
                    checked={selectedGenres.includes(id)}
                    onChange={() => handleGenreChange(id)}
                  />
                  <label htmlFor={id}>{genre.name}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="fm-section">
            <label className="fm-label">Năm xuất bản</label>
            <div className="fm-year-range">
              <input
                className="fm-input fm-year-input"
                type="number"
                placeholder="Từ năm"
                value={yearStart}
                onChange={(e) => setYearStart(e.target.value)}
              />
              <span>-</span>
              <input
                className="fm-input fm-year-input"
                type="number"
                placeholder="Đến năm"
                value={yearEnd}
                onChange={(e) => setYearEnd(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="fm-footer">
          <button className="fm-button fm-reset-button" onClick={handleResetFilters}>
            Đặt lại
          </button>
          <button className="fm-button fm-apply-button" onClick={handleApplyFilters}>
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;