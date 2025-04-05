import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../utils/api';

const ExpenseContext = createContext();

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};

console.log(API_URL)

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState();

  const [currency, setCurrency] = useState(() => {
    // Initialize currency from localStorage if available
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser).currency || 'USD' : 'USD';
  });

  // Create axios instance with base URL
  const api = axios.create({
    baseURL: `${API_URL}/api`
  });

  // Add token to requests
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Handle token expiration
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  // Load user data and fetch expenses on mount



  const loadUser = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setCurrency(userData.currency || 'USD');
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error loading user:', error);
      return null;
    }
  };

  const login = async ({email, password}) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setCurrency(userData.currency || 'USD');

      // Fetch expenses after successful login
      const currentDate = new Date();
      const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      await fetchExpenses(currentMonth);

      toast.success('Login successful!');
      window.location.href = '/';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({name, email, password}) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setCurrency(userData.currency || 'USD');
      
      toast.success('Registration successful!');
      window.location.href = '/';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setExpenses([]);
    window.location.href = '/login';
  };

  const updateUser = async ({name}) => {
    try {
      setLoading(true);
      const response = await api.put('/auth/profile', {
        name
      });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCurrency = async (newCurrency) => {
    try {
      setLoading(true);
      const response = await api.put('/auth/currency', { currency: newCurrency });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setCurrency(newCurrency);
      setUser(userData);
      
      toast.success('Currency updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update currency');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async (month) => {
    try {
      setLoading(true);
      const userData = await loadUser();
      if (!userData?.id) {
        throw new Error('User not found');
      }
      const response = await api.get(`/expenses?month=${month}&userId=${userData.id}`);
      console.log(response);
      setExpenses(response.data);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData) => {
    try {
      setLoading(true);
      const response = await api.post('/expenses', expenseData);
      setExpenses([...expenses, response.data]);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      setLoading(true);
      const updatedExpense = await api.put(`/expenses/${id}`, expenseData);
      setExpenses(expenses.map(exp =>
        exp._id === id ? updatedExpense.data : exp
      ));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter(exp => exp._id !== id));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getMonthlySummary = async (month) => {
    try {
      setLoading(true);
      const userData = await loadUser();
      if (!userData?.id) {
        throw new Error('User not found');
      }
      const response = await api.get(`/expenses/summary?month=${month}&userId=${userData.id}`);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const exportExpenses = async (month) => {
    try {
      setLoading(true);
      const response = await api.get(`/expenses/export?month=${month}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expenses-${month}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Expenses exported successfully!');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        loading,
        error,
        user,
        currency,
        login,
        register,
        logout,
        updateUser,
        updateCurrency,
        fetchExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        getMonthlySummary,
        exportExpenses
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}; 