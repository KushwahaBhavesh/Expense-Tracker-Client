import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExpense } from '../context/ExpenseContext';
import { toast } from 'react-toastify';
import { getCurrencySymbol } from '../utils/currency';

const AddExpense = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { expenses, addExpense, updateExpense, loading, error, currency } = useExpense();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: '',
    type: 'expense'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      const expense = expenses.find(exp => exp._id === id);
      if (expense) {
        setFormData({
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          date: expense.date.split('T')[0],
          type: expense.type
        });
      }
    }
  }, [id, expenses, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setLocalError(null);
      if (isEditing) {
        await updateExpense(id, formData);
        toast.success('Expense updated successfully!');
      } else {
        await addExpense(formData);
        toast.success('Expense added successfully!');
      }
      navigate('/dashboard/expenses');
    } catch (err) {
      setLocalError(isEditing ? 'Failed to update expense.' : 'Failed to add expense.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-xl shadow-lg overflow-hidden border border-indigo-100/50">
        <div className="px-6 py-4 border-b border-indigo-100/50">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>
          <p className="mt-1 text-sm text-indigo-600">
            {isEditing ? 'Update your transaction details below.' : 'Fill in the details to add a new transaction.'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {localError && (
            <div className="bg-gradient-to-br from-red-50 via-red-100/50 to-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg relative shadow-sm" role="alert">
              <span className="block sm:inline">{localError}</span>
            </div>
          )}
          <div className="space-y-6">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-indigo-700 mb-1.5">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 text-gray-900 placeholder-gray-400 shadow-sm"
                placeholder="Enter description"
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-indigo-700 mb-1.5">
                Amount
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-indigo-500 sm:text-sm">{getCurrencySymbol(currency)}</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="block w-full pl-7 pr-12 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 text-gray-900 placeholder-gray-400 shadow-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-indigo-700 mb-1.5">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 text-gray-900 shadow-sm"
              >
                <option value="">Select a category</option>
                <option value="Food">Food</option>
                <option value="Transportation">Transportation</option>
                <option value="Housing">Housing</option>
                <option value="Utilities">Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Shopping">Shopping</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-indigo-700 mb-1.5">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 text-gray-900 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-indigo-700 mb-1.5">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 text-gray-900 shadow-sm"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/expenses')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-indigo-200 rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:via-purple-50 hover:to-pink-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense; 