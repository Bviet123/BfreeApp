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
import AuthorList from './pageJS/Admin/AuthorList/AuthorList';
import OtherList from './pageJS/Admin/OtherList/OtherList';
import BorrowList from './pageJS/Admin/BorrowList/BorrowList';
import AddBook from './pageJS/Admin/BookList/AddBook';
import AdminBookDetails from './pageJS/Admin/BookList/AdminBookDetails';
import UpdateBookInfo from './pageJS/Admin/BookList/UpdateBookInfo';
import AddChapter from './pageJS/Admin/BookList/chapter/AddChapter';
import EditChapter from './pageJS/Admin/BookList/chapter/EditChapter';
import EditBookDetails from './pageJS/Admin/BookList/EditBookDetails';

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
        <Route path="/admin/books/BookDetail/:id" element={<AdminBookDetails />} />
        <Route path="/admin/books/:id/edit" element={<EditBookDetails />} />
        <Route path="/admin/books/:bookId/AddChapter" element={<AddChapter />} />
        <Route path="/admin/books/:bookId/EditChapter/:chapterId" element={<EditChapter />} /> 
        <Route path="/admin/books/edit" element={<UpdateBookInfo />} />
        <Route path="/admin/books/add/" element={<AddBook />} />
        <Route path="/admin/authors" element={<AuthorList />} />
        <Route path="/admin/other" element={<OtherList />} />
        <Route path="/admin/borrows" element={<BorrowList />} />
      </Routes>
    </Router>
  );
}

export default App;