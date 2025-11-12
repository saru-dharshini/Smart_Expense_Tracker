import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import api from '../../api/client';
import type { Budget, BudgetPayload, Category } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, formatPercent } from '../../utils/format';

const toInputDate = (value?: string) => {
  if (!value) {
    return '';
  }
  return value.split('T')[0];
};

const formatRange = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const startFragment = startDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
  const endFragment = endDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
  return `${startFragment} - ${endFragment}`;
};

const BudgetsPage = () => {
  const { currency } = useAuth();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [historyBudget, setHistoryBudget] = useState<Budget | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [modalError, setModalError] = useState<string | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | undefined>(undefined);

  const [formValues, setFormValues] = useState({
    name: '',
    totalAmount: '',
    categoryId: '',
    startDate: '',
    endDate: '',
    recurringMonthly: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(undefined);
    try {
      const [categoryResponse, budgetResponse] = await Promise.all([
        api.get<Category[]>('/categories'),
        api.get<Budget[]>('/budgets'),
      ]);
      setCategories(categoryResponse.data);
      setBudgets(budgetResponse.data);

      if (!formValues.categoryId && categoryResponse.data.length > 0) {
        setFormValues((prev) => ({
          ...prev,
          categoryId: categoryResponse.data[0].id,
        }));
      }
    } catch (err) {
      console.error('Failed to load budgets', err);
      setLoadError('Unable to load budgets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formValues.categoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handler = () => {
      loadData();
    };
    window.addEventListener('paypulse-budgets-refresh', handler);
    return () => {
      window.removeEventListener('paypulse-budgets-refresh', handler);
    };
  }, [loadData]);

  const openModal = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      setFormValues({
        name: budget.name,
        totalAmount: budget.totalAmount.toString(),
        categoryId: budget.categoryId,
        startDate: toInputDate(budget.startDate),
        endDate: toInputDate(budget.endDate),
        recurringMonthly: budget.recurringMonthly,
      });
    } else {
      setEditingBudget(null);
      setFormValues({
        name: '',
        totalAmount: '',
        categoryId: categories[0]?.id ?? '',
        startDate: '',
        endDate: '',
        recurringMonthly: true,
      });
    }
    setModalError(undefined);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }
    setModalOpen(false);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = event.target as HTMLInputElement;
    if (type === 'checkbox') {
      setFormValues((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormValues((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formValues.name.trim()) {
      setModalError('Enter a budget name.');
      return;
    }
    if (!formValues.totalAmount || Number.parseFloat(formValues.totalAmount) <= 0) {
      setModalError('Budget amount must be greater than zero.');
      return;
    }
    if (!formValues.categoryId) {
      setModalError('Select a category.');
      return;
    }
    if (!formValues.startDate || !formValues.endDate) {
      setModalError('Choose a date range.');
      return;
    }

    const payload: BudgetPayload = {
      name: formValues.name.trim(),
      totalAmount: Number.parseFloat(formValues.totalAmount),
      startDate: formValues.startDate,
      endDate: formValues.endDate,
      recurringMonthly: formValues.recurringMonthly,
      categoryId: formValues.categoryId,
    };

    setSaving(true);
    setModalError(undefined);
    try {
      if (editingBudget) {
        await api.put(`/budgets/${editingBudget.id}`, payload);
      } else {
        await api.post('/budgets', payload);
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to save budget', err);
      setModalError('Could not save budget. Please review your values.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (budget: Budget) => {
    const confirmed = window.confirm(`Delete budget "${budget.name}"?`);
    if (!confirmed) {
      return;
    }
    try {
      await api.delete(`/budgets/${budget.id}`);
      await loadData();
    } catch (err) {
      console.error('Failed to delete budget', err);
      window.alert('Unable to delete budget.');
    }
  };

  const totals = useMemo(() => {
    if (!budgets.length) {
      return {
        totalAmount: 0,
        totalSpent: 0,
        totalRemaining: 0,
      };
    }
    return budgets.reduce(
      (acc, budget) => ({
        totalAmount: acc.totalAmount + budget.totalAmount,
        totalSpent: acc.totalSpent + budget.spentAmount,
        totalRemaining: acc.totalRemaining + budget.remainingAmount,
      }),
      { totalAmount: 0, totalSpent: 0, totalRemaining: 0 }
    );
  }, [budgets]);

  return (
    <div className="budgets-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Plan every rupee and stay on track effortlessly.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => openModal()}>
          + New Budget
        </button>
      </div>

      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
        </div>
      ) : loadError ? (
        <div className="empty-state">
          <p>{loadError}</p>
          <button type="button" className="btn-primary section-spacing" onClick={() => loadData()}>
            Retry
          </button>
        </div>
      ) : budgets.length === 0 ? (
        <div className="empty-state">
          <p>No budgets yet. Create one to start managing your spending.</p>
          <button type="button" className="btn-primary section-spacing" onClick={() => openModal()}>
            Create Budget
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {budgets.map((budget) => {
            const isOverspent = budget.remainingAmount < 0;
            const progress = Math.min(budget.completionPercent, 100);
            const statusLabel = isOverspent ? 'Over Spent' : 'On Track';
            const statusClass = isOverspent ? 'badge-negative' : 'badge-positive';

            return (
              <div key={budget.id} className="budget-card dashboard-card">
                <div className="goal-card-header">
                  <div>
                    <div className="goal-name">{budget.name}</div>
                    <div className="budget-period">
                      {budget.recurringMonthly ? 'Monthly • ' : ''}
                      {formatRange(budget.startDate, budget.endDate)}
                    </div>
                  </div>
                  <div className="goal-actions">
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => openModal(budget)}
                      title="Edit budget"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => handleDelete(budget)}
                      title="Delete budget"
                    >
                      🗑
                    </button>
                  </div>
                </div>

                <div className="budget-amounts">
                  <div className="budget-amount-main">
                    <span>{formatCurrency(budget.spentAmount, currency)}</span>
                    <span className="budget-amount-divider">/</span>
                    <span>{formatCurrency(budget.totalAmount, currency)}</span>
                  </div>
                  <div className="label">Remaining</div>
                  <div className="budget-remaining">{formatCurrency(budget.remainingAmount, currency)}</div>
                </div>

                <div className="progress-track">
                  <div
                    className={`progress-fill ${isOverspent ? 'progress-danger' : 'progress-success'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="goal-stats">
                  <div>
                    <div className="label">Daily Budget</div>
                    <div>{formatCurrency(budget.dailyBudget, currency)}</div>
                  </div>
                  <div>
                    <div className="label">Status</div>
                    <span className={`badge-pill ${statusClass}`}>{statusLabel}</span>
                  </div>
                </div>

                <div className="goal-stats">
                  <div>
                    <div className="label">Category</div>
                    <span className="category-badge">{budget.categoryName}</span>
                  </div>
                  <div>
                    <div className="label">Progress</div>
                    <div>{formatPercent(budget.completionPercent)}</div>
                  </div>
                </div>

                <div className="action-row section-spacing">
                  <button type="button" className="btn-secondary" onClick={() => setHistoryBudget(budget)}>
                    Show History
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {budgets.length > 0 && !loading && !loadError && (
        <div className="dashboard-card section-spacing">
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">Budget Insights</span>
          </div>
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-label">Total Budget</span>
              <span className="kpi-value">{formatCurrency(totals.totalAmount, currency)}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Total Spent</span>
              <span className="kpi-value">{formatCurrency(totals.totalSpent, currency)}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Remaining</span>
              <span className="kpi-value">{formatCurrency(totals.totalRemaining, currency)}</span>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2>{editingBudget ? 'Edit Budget' : 'New Budget'}</h2>
              <button type="button" className="icon-button" onClick={closeModal}>
                ×
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSubmit} noValidate>
              {modalError && <div className="form-error">{modalError}</div>}
              <div className="form-field">
                <label htmlFor="budget-name" className="label">
                  Budget Name
                </label>
                <input
                  id="budget-name"
                  name="name"
                  type="text"
                  placeholder="e.g., Groceries"
                  value={formValues.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="totalAmount" className="label">
                    Total Amount
                  </label>
                  <input
                    id="totalAmount"
                    name="totalAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formValues.totalAmount}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="categoryId" className="label">
                    Category
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    className="select"
                    value={formValues.categoryId}
                    onChange={handleInputChange}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="startDate" className="label">
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formValues.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="endDate" className="label">
                    End Date
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formValues.endDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="recurringMonthly"
                  checked={formValues.recurringMonthly}
                  onChange={handleInputChange}
                />
                <span>Repeat every month</span>
              </label>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editingBudget ? 'Update Budget' : 'Create Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {historyBudget && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2>{historyBudget.name} — History</h2>
              <button type="button" className="icon-button" onClick={() => setHistoryBudget(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Period: {formatDate(historyBudget.startDate)} to {formatDate(historyBudget.endDate)}
              </p>
              <p>Spent so far: {formatCurrency(historyBudget.spentAmount, currency)}</p>
              <p>Remaining: {formatCurrency(historyBudget.remainingAmount, currency)}</p>
              <p>
                {historyBudget.recurringMonthly
                  ? 'This budget recurs monthly. New history entries will appear as each cycle ends.'
                  : 'This is a one-time budget. History shows current cycle performance.'}
              </p>
              <div className="modal-footer">
                <button type="button" className="btn-primary" onClick={() => setHistoryBudget(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetsPage;

