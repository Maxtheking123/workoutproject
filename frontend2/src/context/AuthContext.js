import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { decodeToken } from '../utils/decodeToken';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext();

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000',
});

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
            // Prevent the error from being propagated
            return new Promise(() => {});
        }
        return Promise.reject(error);
    }
);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = decodeToken(token);
                setUser({ username: decodedToken.username });
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                loadCategories();
            } catch (error) {
                console.error('Invalid token:', error);
                logout();
            }
        } else {
            setLoading(false);
        }
    }, []);

    const loadCategories = async () => {
        const localCategories = localStorage.getItem('categoryEntries');
        if (localCategories) {
            setCategories(JSON.parse(localCategories));
            setLoading(false);
        } else {
            fetchCategories();
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('/api/categories/entries');
            const categoryData = response.data || [];
            setCategories(categoryData);
            localStorage.setItem('categoryEntries', JSON.stringify(categoryData));
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        } finally {
            setLoading(false);
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
            window.location.href = '/'; // Redirect to home or another protected route
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
        window.location.href = '/login'; // Redirect to login page
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

    const fetchCategoryEntries = async () => {
        try {
            const response = await axiosInstance.get('/api/categories/entries');
            return response.data;
        } catch (error) {
            console.error('Error fetching category entries:', error);
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

    const addCategory = async (category) => {
        const newCategory = { ...category, id: uuidv4() };
        try {
            const response = await axiosInstance.post('/api/categories/entries', newCategory);
            setCategories(prevCategories => {
                const updatedCategories = [...prevCategories, response.data];
                localStorage.setItem('categoryEntries', JSON.stringify(updatedCategories));
                return updatedCategories;
            });
            return response.data;
        } catch (error) {
            console.error('Error adding category:', error);
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

    const deleteCategory = async (id) => {
        try {
            const response = await axiosInstance.delete(`/api/categories/entries/${id}`);
            setCategories(prevCategories => {
                const updatedCategories = prevCategories.filter(category => category.id !== id);
                localStorage.setItem('categoryEntries', JSON.stringify(updatedCategories));
                return updatedCategories;
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await axiosInstance.get('/api/tasks/entries');
            return response.data;
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    };

    const addTask = async (entry) => {
        try {
            const response = await axiosInstance.post('/api/tasks/entries', entry);
            return response.data;
        } catch (error) {
            console.error('Error adding task:', error);
            throw error;
        }
    };

    const updateTask = async (id, entry) => {
        try {
            const response = await axiosInstance.put(`/api/tasks/entries/${id}`, entry);
            return response.data;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    };

    const deleteTask = async (id) => {
        try {
            const response = await axiosInstance.delete(`/api/tasks/entries/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, fetchCalendarEntries, addCalendarEntry, updateCalendarEntry, deleteCalendarEntry, categories, addCategory, fetchCategoryEntries, fetchTasks, addTask, updateTask, deleteTask, deleteCategory }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };