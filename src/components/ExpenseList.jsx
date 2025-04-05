import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useExpense } from '../context/ExpenseContext';
import debounce from 'lodash/debounce';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/currency';

const ExpenseList = () => {
  const { expenses, loading, error, fetchExpenses, deleteExpense, currency } = useExpense();
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    search: ''
  });

  // Debounced fetch function to prevent rapid API calls
  const debouncedFetch = useCallback(
    debounce(async (month) => {
      try {
        await fetchExpenses(month);
      } catch (err) {
        console.error('Error fetching expenses:', err);
        toast.error('Failed to fetch expenses');
      }
    }, 500),
    [fetchExpenses]
  );

  useEffect(() => {
    debouncedFetch(new Date().toISOString().slice(0, 7));

    // Cleanup function to cancel any pending debounced calls
    return () => {
      debouncedFetch.cancel();
    };
  }, [setMonth]);

  useEffect(() => {
    let result = [...expenses];

    // Apply filters
    if (filters.type !== 'all') {
      result = result.filter(expense => expense.type === filters.type);
    }

    if (filters.category !== 'all') {
      result = result.filter(expense => expense.category === filters.category);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm) ||
        expense.category.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredExpenses(result);
  }, [expenses, filters, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatAmount = (amount) => formatCurrency(amount, currency);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        toast.success('Expense deleted successfully!');
        // Refresh the list after successful deletion
        await fetchExpenses(new Date().toISOString().slice(0, 7));
      } catch (err) {
        console.error('Error deleting expense:', err);
        toast.error('Failed to delete expense');
      }
    }
  };

  const categories = [...new Set(expenses.map(expense => expense.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-3 shadow-lg"></div>
          <p className="text-indigo-700 font-medium">Loading your expenses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-lg border border-red-100">
          <div className="w-12 h-12 bg-gradient-to-br from-red-100 via-red-50 to-red-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-900 mb-1">{error}</p>
          <p className="text-sm text-gray-600">Please try again or contact support if the problem persists.</p>
        </div>
      </div>
    );
  }

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
    debouncedFetch(e.target.value);
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-xl shadow-lg p-6 border border-indigo-100/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Expense History</h1>
            <p className="text-indigo-600 mt-1">Manage and track your financial transactions</p>
          </div>
          <Link
            to="/dashboard/add"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Transaction
          </Link>
        </div>
      </div>

      {/* Filters and Sort Section */}
      <div className="bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-xl shadow-lg p-6 border border-indigo-100/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-indigo-700 mb-1.5">
              Transaction Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="block w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 text-gray-900 shadow-sm"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-indigo-700 mb-1.5">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="block w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 text-gray-900 shadow-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Month Selection */}
          <div>
            <label className="block text-sm font-medium text-indigo-700 mb-1.5">
              Month
            </label>
            <input
              type="month"
              value={month}
              onChange={handleMonthChange}
              className="block w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 text-gray-900 shadow-sm"
            />
          </div>

          {/* Search Filter */}
          <div>
            <label className="block text-sm font-medium text-indigo-700 mb-1.5">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search transactions..."
                className="block w-full pl-9 pr-3 py-2 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 text-gray-900 placeholder-gray-400 shadow-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-xl shadow-lg border border-indigo-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-indigo-100">
            <thead className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider cursor-pointer hover:text-indigo-900 transition-colors duration-200"
                  onClick={() => handleSort('date')}
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider cursor-pointer hover:text-indigo-900 transition-colors duration-200"
                  onClick={() => handleSort('description')}
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider cursor-pointer hover:text-indigo-900 transition-colors duration-200"
                  onClick={() => handleSort('category')}
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider cursor-pointer hover:text-indigo-900 transition-colors duration-200"
                  onClick={() => handleSort('amount')}
                >
                  Amount
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-indigo-100">
              {filteredExpenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:via-purple-50/50 hover:to-pink-50/50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${
                      expense.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatAmount(expense.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <Link
                        to={`/dashboard/edit/${expense._id}`}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-150"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;