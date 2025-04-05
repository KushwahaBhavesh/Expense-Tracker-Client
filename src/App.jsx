import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ExpenseProvider } from './context/ExpenseContext';
import Dashboard from './components/Dashboard';
import AddExpense from './components/AddExpense';
import ExpenseList from './components/ExpenseList';
import Settings from './components/Settings';
import MonthlySummary from './components/MonthlySummary';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
      <ExpenseProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <main className="container mx-auto px-2 py-2">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/dashboard" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<MonthlySummary />} />
                  <Route path="expenses" element={<ExpenseList />} />
                  <Route path="add" element={<AddExpense />} />
                  <Route path="edit/:id" element={<AddExpense />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Routes>
            </main>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </ExpenseProvider>
  );
}

export default App;
