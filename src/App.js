import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import Login from './pageJS/login/Login';
import SignUp from './pageJS/SignUp/SignUp';
import ForgotPassword from './pageJS/ForgotPassWord/ForgotPassword';
import Home from './pageJS/Home/Home';
import BookLibrary from './pageJS/BookLibrary/BookLibrary';
import BookDetail from './pageJS/BookDetail/BookDetail';
import ChapterDetail from './pageJS/BookDetail/ChapterDetail';

// User 
import UserProfile from './pageJS/User/UserInfor/UserProfile';
import Bookshelf from './pageJS/User/BookShelf/BookShelf';
import BorrowedBooksList from './pageJS/User/UserInfor/BorrowedBookList';

// Admin components
import UserList from './pageJS/Admin/UserList/UserList';
import BookList from './pageJS/Admin/BookList/BookList';
import AuthorList from './pageJS/Admin/AuthorList/AuthorList';
import OtherList from './pageJS/Admin/OtherList/OtherList';
import BorrowList from './pageJS/Admin/BorrowList/BorrowList';
import AddBook from './pageJS/Admin/BookList/AddBook';
import AdminBookDetails from './pageJS/Admin/BookList/AdminBookDetails';
import AddChapter from './pageJS/Admin/BookList/chapter/AddChapter';
import EditChapter from './pageJS/Admin/BookList/chapter/EditChapter';
import EditBookDetails from './pageJS/Admin/BookList/EditBookDetails';
import { AuthProvider } from './AuthProvider';
import { ProtectedRoute } from './ProtectedRoute ';
import NotFound from './ErrorPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/home/*" element={<Home />} />
          <Route path="/library" element={<BookLibrary />} />
          <Route path="/book/:bookId" element={<BookDetail />} />
          <Route path="/book/:bookId/chapter/:chapterId" element={<ChapterDetail />} />

          {/* User routes */}
          <Route path="/user/*" element={
            <ProtectedRoute>
              <Routes>
                <Route path="profile/:userId" element={<UserProfile />} />
                <Route path="bookshelf" element={<Bookshelf />} />
                <Route path="borrowedbooklist" element={<BorrowedBooksList />} />
              </Routes>
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute requireAdmin={true}>
              <Routes>
                <Route path="users" element={<UserList />} />
                <Route path="books" element={<BookList />} />
                <Route path="books/add" element={<AddBook />} />
                <Route path="books/:id" element={<AdminBookDetails />} />
                <Route path="books/:id/edit" element={<EditBookDetails />} />
                <Route path="books/:bookId/addchapter" element={<AddChapter />} />
                <Route path="books/:bookId/editchapter/:chapterId" element={<EditChapter />} />
                <Route path="authors" element={<AuthorList />} />
                <Route path="other" element={<OtherList />} />
                <Route path="borrows" element={<BorrowList />} />
              </Routes>
            </ProtectedRoute>
          } />
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;