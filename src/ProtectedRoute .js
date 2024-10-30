import React from 'react';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user.role !== 'Admin') {
        return <Navigate to="/home" replace />;
    }

    return children;
};