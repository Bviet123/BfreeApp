import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pageJS/login/Login';
import Home from './pageJS/Home/Home';
import AddBooks from './pageJS/Admin/Books/AddBooks';
import UserList from './pageJS/Admin/UserList/UserList';
import BookDetail from './pageJS/BookDetail/BookDetail';
import BookLibrary from './pageJS/BookLibrary/BookLibrary';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/AddBooks" element={<AddBooks />} />
        <Route path="/UserList" element={<UserList />} />
        <Route path="/BookDetail" element={<BookDetail />} />
        <Route path="/BookLibrary" element={<BookLibrary />} />
      </Routes>
    </Router>
  );
}

export default App;