import { useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import type { DashboardSummary } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, formatPercent } from '../../utils/format';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { currency } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const loadSummary = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const { data } = await api.get<DashboardSummary>('/dashboard');
      setSummary(data);
    } catch (err) {
      console.error('Failed to load dashboard summary', err);
      setError('Unable to load your dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const spendingByCategory = useMemo(() => {
    const entries = Object.entries(summary?.spendingByCategory ?? {});
    if (!entries.length) {
      return [];
    }
    const maxValue = Math.max(...entries.map(([, value]) => value)) || 1;
    return entries.map(([name, value]) => ({
      name,
      value,
      percent: Math.round((value / maxValue) * 100),
    }));
  }, [summary?.spendingByCategory]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <p>{error}</p>
        <button type="button" className="btn-primary section-spacing" onClick={loadSummary}>
          Retry
        </button>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Total Savings</span>
          <span className="kpi-value">{formatCurrency(summary.totalSavings, currency)}</span>
          <span className="kpi-caption">
            {summary.activeSavingsGoals} active goal
            {summary.activeSavingsGoals === 1 ? '' : 's'}
          </span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Total Spent This Month</span>
          <span className="kpi-value">
            {formatCurrency(summary.totalSpentThisMonth, currency)}
          </span>
          <span className="kpi-caption">Updated in real time from your expenses</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Total Spent Today</span>
          <span className="kpi-value">{formatCurrency(summary.totalSpentToday, currency)}</span>
          <span className="kpi-caption">Stay mindful of today&apos;s spending</span>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">Savings Goals</span>
            <Link to="/savings-goals" className="auth-footer-link">
              View all
            </Link>
          </div>
          <div className="card-grid">
            {summary.savingsGoalsPreview.length === 0 && (
              <div className="empty-state">
                <p>No savings goals yet. Create one to start tracking progress.</p>
                <Link to="/savings-goals" className="btn-primary section-spacing">
                  Create goal
                </Link>
              </div>
            )}
            {summary.savingsGoalsPreview.map((goal) => (
              <div key={goal.id} className="goal-card">
                <div className="goal-card-header">
                  <div>
                    <div className="goal-name">{goal.name}</div>
                    {goal.label && <div className="goal-label">{goal.label}</div>}
                  </div>
                  <div className="goal-progress-percent">{formatPercent(goal.progressPercent)}</div>
                </div>
                <div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="goal-stats">
                  <div>
                    <div className="label">Saved</div>
                    <div>{formatCurrency(goal.savedAmount, currency)}</div>
                  </div>
                  <div>
                    <div className="label">Remaining</div>
                    <div>{formatCurrency(goal.remainingAmount, currency)}</div>
                  </div>
                </div>
                <div className="goal-stats">
                  <div>
                    <div className="label">Daily needed</div>
                    <div>{formatCurrency(goal.dailyAmountNeeded, currency)}/day</div>
                  </div>
                  <div>
                    <div className="label">Target</div>
                    <div>{formatDate(goal.targetDate)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">Spending by Category</span>
          </div>
          {spendingByCategory.length === 0 ? (
            <div className="empty-state">
              <p>No category insights yet. Add expenses to see where your money goes.</p>
            </div>
          ) : (
            <div className="card-grid">
              {spendingByCategory.map((item) => (
                <div key={item.name} className="goal-card">
                  <div className="goal-card-header">
                    <span className="goal-name">{item.name}</span>
                    <span className="goal-progress-percent">
                      {formatCurrency(item.value, currency)}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card section-spacing">
        <div className="dashboard-card-header">
          <span className="dashboard-card-title">Recent Expenses</span>
          <Link to="/expenses" className="auth-footer-link">
            View expenses
          </Link>
        </div>
        {summary.recentExpenses.length === 0 ? (
          <div className="empty-state">
            <p>No expenses recorded yet. Add your first expense to see it here.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Merchant</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {summary.recentExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{formatDate(expense.expenseDate)}</td>
                  <td>{expense.merchant || '-'}</td>
                  <td>
                    <span className="category-badge">{expense.categoryName}</span>
                  </td>
                  <td>{formatCurrency(expense.amount, currency)}</td>
                  <td>{expense.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

