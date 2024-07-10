import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Chart from './components/Chart';
import Calendar from './components/Calendar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Tasks from './components/Tasks';

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

    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/chart" element={<Chart />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/tasks/:id" element={<Tasks />} />
            </Routes>
            {location.pathname === '/' && <Footer />}
        </>
    );
};

export default App;