import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pageJS/login/Login';
import Home from './pageJS/Home/Home';
import UserList from './pageJS/Admin/UserList/UserList';
import BookDetail from './pageJS/BookDetail/BookDetail';
import BookLibrary from './pageJS/BookLibrary/BookLibrary';
import UserProfile from './pageJS/User/UserInfor/UserProfile';
import Bookshelf from './pageJS/User/BookShelf/BookShelf';
import BookList from './pageJS/Admin/BookList/BookList';
import EditBook from './pageJS/Admin/BookList/EditBook';
import AuthorList from './pageJS/Admin/AuthorList/AuthorList';
import OtherList from './pageJS/Admin/OtherList/OtherList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/UserList" element={<UserList />} />
        <Route path="/BookDetail" element={<BookDetail />} />
        <Route path="/BookLibrary" element={<BookLibrary />} />
        <Route path="/UserProfile" element={<UserProfile />} />
        <Route path="/BookShelf" element={<Bookshelf />} />
        <Route path="/BookList" element={<BookList />} />
        <Route path="/EditBook" element={<EditBook />} />
        <Route path="/AuthorList" element={<AuthorList />} />
        <Route path="/OtherList" element={<OtherList />} />

      </Routes>
    </Router>
  );
}

export default App;