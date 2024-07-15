import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [isUnauthorized, setIsUnauthorized] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (!user) {
            setIsUnauthorized(true);
            setTimeout(() => {
                window.location.href = '/login';
            }, 0); // Short delay to allow empty page render before redirection
        }
    }, [user]);

    if (isUnauthorized) {
        return <div></div>; // Render an empty div
    }

    return children;
};

export default ProtectedRoute;