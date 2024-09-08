import React from 'react';
import { Routes, Route } from 'react-router-dom';
import '../../pageCSS/HomeCss/HomeCss.css';
import HomeNav from './HomeNav';
import HomeMain from './HomeMain';
import HomeFoot from './HomeFoot';
import BookDetail from '../BookDetail/BookDetail';
import BookLibrary from '../BookLibrary/BookLibrary';

function Home() {
  
  return (
    <div className="home-page">
      <HomeNav />
      <Routes>
        <Route path="/" element={<HomeMain />} />
        <Route path="/BookDetail" element={<BookDetail />} />
        <Route path="/BookLibrary" element={<BookLibrary />} />
      </Routes>
      <HomeFoot />
    </div>
  );
}

export default Home;