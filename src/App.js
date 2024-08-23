import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pageJS/login/Login';
import Home from './pageJS/Home/Home';
import AddBooks from './pageJS/Admin/Books/AddBooks';
import UserList from './pageJS/Admin/UserList/UserList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/AddBooks" element={<AddBooks />} />
        <Route path="/UserList" element={<UserList />} />
      </Routes>
    </Router>
  );
}

export default App;