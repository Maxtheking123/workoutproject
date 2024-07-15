import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Chart from './components/Chart';
import Calendar from './components/Calendar';
import Tasks from './components/Tasks';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { getAndSaveLocalData } from './utils/getAndSaveLocalData';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Main />
            </Router>
        </AuthProvider>
    );
};

const Main = () => {
    const location = useLocation();
    const { updateEntriesFromDatabase, getLocalData } = getAndSaveLocalData();
    const { loading } = useContext(AuthContext);

    useEffect(() => {
        if (location.pathname !== '/login' && location.pathname !== '/register') {
            const { calendarEntries, categoryEntries, tasks } = getLocalData();
            if (!calendarEntries || !categoryEntries || !tasks) {
                updateEntriesFromDatabase(); // You might need to pass a userID if required
            }
        }
    }, [location, updateEntriesFromDatabase, getLocalData]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (location.pathname === '/login' || location.pathname === '/register') {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        );
    }

    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/chart" element={<ProtectedRoute><Chart /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                <Route path="/tasks/:id" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            </Routes>
            {location.pathname === '/' && <Footer />}
        </>
    );
};

export default App;