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
import BorrowList from './pageJS/Admin/BorrowList/BorrowList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home/*" element={<Home />} />
        <Route path="/admin/users" element={<UserList />} />
        <Route path="/BookDetail" element={<BookDetail />} />
        <Route path="/library" element={<BookLibrary />} />
        <Route path="/user/profile/:userId" element={<UserProfile />} />
        <Route path="/user/bookshelf" element={<Bookshelf />} />
        <Route path="/admin/books" element={<BookList />} />
        <Route path="/admin/books/edit/" element={<EditBook />} />
        <Route path="/admin/authors" element={<AuthorList />} />
        <Route path="/admin/other" element={<OtherList />} />
        <Route path="/admin/borrows" element={<BorrowList />} />
      </Routes>
    </Router>
  );
}

export default App;