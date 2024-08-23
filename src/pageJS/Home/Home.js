import React from 'react';
import '../../pageCSS/HomeCss/HomeCss.css';
import HomeNav from './HomeNav';
import HomeMain from './HomeMain';
import HomeFoot from './HomeFoot';

function Home() {
  return (
    <div className="home-page">
      <HomeNav />
      <HomeMain />
      <HomeFoot />
    </div>
  );
}

export default Home;