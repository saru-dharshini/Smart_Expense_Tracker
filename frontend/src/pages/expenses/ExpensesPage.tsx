import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import type { Category, Expense, ExpenseRequestPayload, SavingsGoal } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/format';

const defaultExpenseDate = () => new Date().toISOString().split('T')[0];

const ExpensesPage = () => {
  const { currency, user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const [formValues, setFormValues] = useState({
    amount: '',
    categoryId: '',
    expenseDate: defaultExpenseDate(),
    merchant: '',
    note: '',
    savingsGoalId: '',
  });

  const loadData = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }
    setError(undefined);
    try {
      const [categoryResponse, expenseResponse] = await Promise.all([
        api.get<Category[]>('/categories'),
        api.get<Expense[]>('/expenses'),
      ]);
      setCategories(categoryResponse.data);
      setExpenses(expenseResponse.data);

      if (!formValues.categoryId && categoryResponse.data.length > 0) {
        setFormValues((prev) => ({
          ...prev,
          categoryId: categoryResponse.data[0].id,
        }));
      }
    } catch (err) {
      console.error('Failed to load expenses data', err);
      setError('Unable to load expenses. Please try again.');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user?.token) {
      return;
    }

    const fetchGoals = async () => {
      try {
        const { data } = await api.get<SavingsGoal[]>('/goals');
        setSavingsGoals(data);
        setFormValues((prev) => {
          if (!prev.categoryId || !canSelectSavingsGoal(prev.categoryId) || prev.savingsGoalId) {
            return prev;
          }
          const defaultId = data[0]?.id ?? '';
          if (!defaultId) {
            return prev;
          }
          return {
            ...prev,
            savingsGoalId: defaultId,
          };
        });
      } catch (err) {
        console.error('Failed to load savings goals', err);
      }
    };

    fetchGoals();

    const handler = () => {
      fetchGoals();
    };
    window.addEventListener('paypulse-goals-refresh', handler);
    return () => {
      window.removeEventListener('paypulse-goals-refresh', handler);
    };
  }, [user?.token]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const canSelectSavingsGoal = (categoryId: string) => {
    const category = categories.find((item) => item.id === categoryId);
    if (!category) {
      return false;
    }
    return /goal|saving/i.test(category.name);
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setFormValues((prev) => {
      const supportsGoal = canSelectSavingsGoal(value);
      const defaultGoalId =
        supportsGoal && savingsGoals.length > 0
          ? prev.savingsGoalId || savingsGoals[0].id
          : '';
      return {
        ...prev,
        categoryId: value,
        savingsGoalId: defaultGoalId,
      };
    });
  };

  const resetForm = () => {
    setFormValues({
      amount: '',
      categoryId: categories[0]?.id ?? '',
      expenseDate: defaultExpenseDate(),
      merchant: '',
      note: '',
      savingsGoalId: '',
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formValues.amount || Number.parseFloat(formValues.amount) <= 0) {
      setError('Enter a valid amount.');
      return;
    }
    if (!formValues.categoryId) {
      setError('Select a category.');
      return;
    }

    const goalSelectionNeeded = showGoalSelector;
    if (goalSelectionNeeded && !formValues.savingsGoalId) {
      setError('Select the savings goal to credit.');
      return;
    }

    const payload: ExpenseRequestPayload = {
      amount: Number.parseFloat(formValues.amount),
      categoryId: formValues.categoryId,
      expenseDate: formValues.expenseDate,
      merchant: formValues.merchant.trim() || undefined,
      note: formValues.note.trim() || undefined,
      savingsGoalId: formValues.savingsGoalId || undefined,
    };

    setSaving(true);
    setError(undefined);

    try {
      await api.post<Expense>('/expenses', payload);
      resetForm();
      await loadData(false);
      if (payload.savingsGoalId) {
        window.dispatchEvent(new Event('paypulse-goals-refresh'));
      }
      window.dispatchEvent(new Event('paypulse-budgets-refresh'));
    } catch (err) {
      console.error('Failed to save expense', err);
      setError('Could not add expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const showGoalSelector =
    savingsGoals.length > 0 && formValues.categoryId && canSelectSavingsGoal(formValues.categoryId);

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort(
      (a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()
    );
  }, [expenses]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="expenses-page">
      <form className="dashboard-card" onSubmit={handleSubmit} noValidate>
        <div className="dashboard-card-header">
          <span className="dashboard-card-title">Expenses</span>
          <Link to="/categories" className="auth-footer-link">
            Manage Categories
          </Link>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-grid">
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="amount" className="label">
                Amount
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter amount"
                value={formValues.amount}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="category" className="label">
                Category
              </label>
              <select
                id="category"
                className="select"
                value={formValues.categoryId}
                onChange={handleCategoryChange}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="expenseDate" className="label">
                Date
              </label>
              <input
                id="expenseDate"
                name="expenseDate"
                type="date"
                value={formValues.expenseDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="merchant" className="label">
                Merchant (optional)
              </label>
              <input
                id="merchant"
                name="merchant"
                type="text"
                placeholder="Merchant"
                value={formValues.merchant}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="note" className="label">
              Note
            </label>
            <textarea
              id="note"
              name="note"
              placeholder="Add a note (optional)"
              value={formValues.note}
              onChange={handleInputChange}
            />
          </div>

          {showGoalSelector && (
            <div className="form-field">
              <label htmlFor="savingsGoalId" className="label">
                Savings Goal
              </label>
              <select
                id="savingsGoalId"
                name="savingsGoalId"
                className="select"
                value={formValues.savingsGoalId}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    savingsGoalId: event.target.value,
                  }))
                }
              >
                <option value="">Select goal</option>
                {savingsGoals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="action-row section-spacing">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Adding…' : 'Add Expense'}
          </button>
        </div>
      </form>

      <div className="dashboard-card section-spacing">
        <div className="dashboard-card-header">
          <span className="dashboard-card-title">Expense History</span>
        </div>
        {sortedExpenses.length === 0 ? (
          <div className="empty-state">
            <p>No expenses yet. Start by adding your first expense.</p>
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
              {sortedExpenses.map((expense) => (
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

export default ExpensesPage;

