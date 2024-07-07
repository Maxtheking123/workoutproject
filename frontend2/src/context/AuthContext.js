import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { decodeToken } from '../utils/decodeToken';
import { v4 as uuidv4 } from 'uuid'; // Import UUID for generating unique IDs

const AuthContext = createContext();

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000', // Set your base URL here
});

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]); // Initialize as an array

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                const decodedToken = decodeToken(token);
                setUser({ username: decodedToken.username });
            } catch (error) {
                console.error('Invalid token:', error);
                logout();
            }
        }
        setLoading(false);
        fetchCategories(); // Fetch categories when the component mounts
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('/api/categories/entries');
            setCategories(response.data || []); // Ensure the response is an array
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]); // Fallback to an empty array on error
        }
    };

    const addCategory = async (category) => {
        const newCategory = { ...category, id: uuidv4() };
        try {
            const response = await axiosInstance.post('/api/categories/entries', newCategory);
            return response.data;
        } catch (error) {
            console.error('Error adding calendar entry:', error);
            throw error;
        }
    };

    const login = async (username, password) => {
        try {
            const response = await axiosInstance.post('/api/auth/login', { username, password });
            const token = response.data.token;
            localStorage.setItem('token', token);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const decodedToken = decodeToken(token);
            setUser({ username: decodedToken.username });
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (username, password) => {
        try {
            await axiosInstance.post('/api/auth/register', { username, password });
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axiosInstance.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const fetchCalendarEntries = async () => {
        try {
            const response = await axiosInstance.get('/api/calendar/entries');
            return response.data;
        } catch (error) {
            console.error('Error fetching calendar entries:', error);
            throw error;
        }
    };

    const addCalendarEntry = async (entry) => {
        try {
            const response = await axiosInstance.post('/api/calendar/entries', entry);
            return response.data;
        } catch (error) {
            console.error('Error adding calendar entry:', error);
            throw error;
        }
    };

    const updateCalendarEntry = async (id, entry) => {
        try {
            const response = await axiosInstance.put(`/api/calendar/entries/${id}`, entry);
            return response.data;
        } catch (error) {
            console.error('Error updating calendar entry:', error);
            throw error;
        }
    };

    const deleteCalendarEntry = async (id) => {
        try {
            const response = await axiosInstance.delete(`/api/calendar/entries/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting calendar entry:', error);
            throw error;
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, fetchCalendarEntries, addCalendarEntry, updateCalendarEntry, deleteCalendarEntry, categories, addCategory }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };