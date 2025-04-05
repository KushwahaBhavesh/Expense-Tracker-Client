import { useEffect, useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/currency';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const MonthlySummary = () => {
  const { getMonthlySummary, currency } = useExpense();
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        const data = await getMonthlySummary(selectedMonth);
        setSummary(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [selectedMonth]);

  const formatAmount = (amount) => formatCurrency(amount, currency);

  const chartData = {
    labels: summary.categoryBreakdown ? summary.categoryBreakdown.map(item => item.category) : [],
    datasets: [
      {
        label: 'Expenses by Category',
        data: summary.categoryBreakdown ? summary.categoryBreakdown.map(item => item.total) : [],
        backgroundColor: [
          'rgba(255, 61, 61, 0.85)',    // Bright Red
          'rgba(0, 198, 255, 0.85)',    // Electric Blue
          'rgba(255, 215, 0, 0.85)',    // Gold
          'rgba(147, 112, 219, 0.85)',  // Medium Purple
          'rgba(255, 165, 0, 0.85)',    // Bright Orange
          'rgba(0, 255, 127, 0.85)',    // Spring Green
          'rgba(255, 20, 147, 0.85)',   // Deep Pink
          'rgba(0, 191, 255, 0.85)',    // Deep Sky Blue
        ],
        borderColor: [
          'rgba(255, 61, 61, 1)',       // Bright Red
          'rgba(0, 198, 255, 1)',       // Electric Blue
          'rgba(255, 215, 0, 1)',       // Gold
          'rgba(147, 112, 219, 1)',     // Medium Purple
          'rgba(255, 165, 0, 1)',       // Bright Orange
          'rgba(0, 255, 127, 1)',       // Spring Green
          'rgba(255, 20, 147, 1)',      // Deep Pink
          'rgba(0, 191, 255, 1)',       // Deep Sky Blue
        ],
        borderWidth: 2,
        borderRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        },
      },
      title: {
        display: true,
        text: 'Monthly Expense Summary',
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: 'bold'
        },
        padding: 20
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          family: "'Inter', sans-serif"
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif"
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${formatAmount(context.raw)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatAmount(value),
          maxRotation: 45,
          minRotation: 45,
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        },
        grid: {
          display: false
        }
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mb-4 shadow-lg"></div>
          <p className="text-indigo-700 font-medium">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-lg border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-900 mb-2">{error}</p>
          <p className="text-sm text-gray-600">Please try again or contact support if the problem persists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Month Selector */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Financial Dashboard</h1>
            <p className="text-indigo-600 mt-1">Track your expenses and income</p>
          </div>
          <div className="relative">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 text-gray-900 shadow-sm"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-indigo-100">Total Income</h3>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 shadow-inner">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold mt-4">{formatAmount(summary.totalIncome || 0)}</p>
          <div className="mt-2 text-sm text-indigo-100">Your total earnings this month</div>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg p-6 text-white transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-red-100">Total Expenses</h3>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 shadow-inner">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold mt-4">{formatAmount(summary.totalExpenses || 0)}</p>
          <div className="mt-2 text-sm text-red-100">Your total spending this month</div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg p-6 text-white transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-green-100">Balance</h3>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 shadow-inner">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold mt-4">{formatAmount(summary.balance || 0)}</p>
          <div className="mt-2 text-sm text-green-100">Your current balance</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Distribution</h3>
          <div className="h-80">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          <div className="h-80">
            <Pie data={chartData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  display: false
                }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Detailed Breakdown</h3>
          <div className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-medium shadow-sm">
            {summary.categoryBreakdown ? summary.categoryBreakdown.length : 0} Categories
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <tr>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-5 py-2.5 text-right text-xs font-medium text-indigo-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-5 py-2.5 text-right text-xs font-medium text-indigo-700 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {!summary.categoryBreakdown || summary.categoryBreakdown.length === 0 ? 
                <tr>
                  <td colSpan="3" className="px-5 py-6 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-500">
                      <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                      <p>No expense data available for this month</p>
                    </div>
                  </td>
                </tr>
              : (summary.categoryBreakdown.map((item) => (
                  <tr key={item.category} className="hover:bg-indigo-50/30 transition-colors duration-150">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-2.5 h-2.5 rounded-full mr-2.5 shadow-sm" style={{ 
                          backgroundColor: chartData.datasets[0].backgroundColor[
                            chartData.labels.indexOf(item.category)
                          ] 
                        }}></div>
                        <div className="text-sm font-medium text-gray-800">{item.category}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-800">{formatAmount(item.total)}</div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-800">
                        {((item.total / summary.totalExpenses) * 100).toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlySummary; 