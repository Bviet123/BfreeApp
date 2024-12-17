import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from "firebase/database";
import '../../pageCSS/HomeCss/CategoriesModalCss.css';

const CategoriesModal = ({ isOpen, onClose, onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories from Firebase
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
        setIsLoading(false);
      }
    });

    return () => unsubscribeCategories();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="categories-modal-overlay">
      <div className="categories-modal">
        <div className="categories-modal-header">
          <h2>Danh sách thể loại</h2>
          <button onClick={onClose} className="close-modal-btn">✕</button>
        </div>
        
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="category-item"
                onClick={() => {
                  onSelectCategory(category);
                  onClose();
                }}
              >
                {category.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesModal;