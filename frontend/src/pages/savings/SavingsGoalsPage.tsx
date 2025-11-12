import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import api from '../../api/client';
import type { SavingsGoal, SavingsGoalPayload } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, formatPercent } from '../../utils/format';

const buildDateInputValue = (date?: string | null) => {
  if (!date) {
    return '';
  }
  return date.split('T')[0];
};

const SavingsGoalsPage = () => {
  const { currency, user } = useAuth();

  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | undefined>(undefined);
  const [modalError, setModalError] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [formValues, setFormValues] = useState({
    name: '',
    label: '',
    targetAmount: '',
    savedAmount: '',
    targetDate: '',
  });

  const loadGoals = useCallback(async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    setLoadError(undefined);
    try {
      const { data } = await api.get<SavingsGoal[]>('/goals');
      setGoals(data);
    } catch (err) {
      console.error('Failed to load goals', err);
      setLoadError('Unable to load savings goals. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  useEffect(() => {
    const handler = () => {
      loadGoals();
    };
    window.addEventListener('paypulse-goals-refresh', handler);
    return () => {
      window.removeEventListener('paypulse-goals-refresh', handler);
    };
  }, [loadGoals]);

  const openModal = (goal?: SavingsGoal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormValues({
        name: goal.name,
        label: goal.label ?? '',
        targetAmount: goal.targetAmount.toString(),
        savedAmount: goal.savedAmount.toString(),
        targetDate: buildDateInputValue(goal.targetDate),
      });
    } else {
      setEditingGoal(null);
      setFormValues({
        name: '',
        label: '',
        targetAmount: '',
        savedAmount: '',
        targetDate: '',
      });
    }
    setModalOpen(true);
    setModalError(undefined);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }
    setModalOpen(false);
    setModalError(undefined);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { name, targetAmount, savedAmount } = formValues;
    if (!name.trim()) {
      setModalError('Enter a goal name.');
      return;
    }
    if (!targetAmount || Number.parseFloat(targetAmount) <= 0) {
      setModalError('Target amount must be greater than zero.');
      return;
    }
    if (!savedAmount || Number.parseFloat(savedAmount) <= 0) {
      setModalError('Saved amount must be greater than zero.');
      return;
    }

    const payload: SavingsGoalPayload = {
      name: name.trim(),
      label: formValues.label.trim() || undefined,
      targetAmount: Number.parseFloat(targetAmount),
      savedAmount: Number.parseFloat(savedAmount),
      targetDate: formValues.targetDate ? formValues.targetDate : undefined,
    };

    setSaving(true);
    setModalError(undefined);

    try {
      if (editingGoal) {
        await api.put(`/goals/${editingGoal.id}`, payload);
      } else {
        await api.post('/goals', payload);
      }
      setModalOpen(false);
      await loadGoals();
    } catch (err) {
      console.error('Failed to save goal', err);
      setModalError('Could not save the goal. Please check your values.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (goal: SavingsGoal) => {
    const confirmed = window.confirm(`Delete goal "${goal.name}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }
    try {
      await api.delete(`/goals/${goal.id}`);
      await loadGoals();
    } catch (err) {
      console.error('Failed to delete goal', err);
      window.alert('Unable to delete goal. Please try again.');
    }
  };

  return (
    <div className="savings-goals-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">Stay on track with the targets that matter most.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => openModal()}>
          + New Goal
        </button>
      </div>

      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
        </div>
      ) : loadError ? (
        <div className="empty-state">
          <p>{loadError}</p>
          <button type="button" className="btn-primary section-spacing" onClick={() => loadGoals()}>
            Retry
          </button>
        </div>
      ) : goals.length === 0 ? (
        <div className="empty-state">
          <p>No goals yet. Create your first savings goal to get started.</p>
          <button type="button" className="btn-primary section-spacing" onClick={() => openModal()}>
            Create Goal
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {goals.map((goal) => (
            <div key={goal.id} className="goal-card">
              <div className="goal-card-header">
                <div>
                  <div className="goal-name">{goal.name}</div>
                  {goal.label && <div className="goal-label">{goal.label}</div>}
                </div>
                <div className="goal-actions">
                  <span className="goal-progress-percent">{formatPercent(goal.progressPercent)}</span>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => openModal(goal)}
                    title="Edit goal"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => handleDelete(goal)}
                    title="Delete goal"
                  >
                    🗑
                  </button>
                </div>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
                />
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
                  <div className="label">Target date</div>
                  <div>{formatDate(goal.targetDate)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2>{editingGoal ? 'Edit Goal' : 'New Goal'}</h2>
              <button type="button" className="icon-button" onClick={closeModal}>
                ×
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSubmit} noValidate>
              {modalError && <div className="form-error">{modalError}</div>}
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="goal-name" className="label">
                    Goal Name
                  </label>
                  <input
                    id="goal-name"
                    name="name"
                    type="text"
                    placeholder="e.g., Vacation"
                    value={formValues.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="goal-label" className="label">
                    Label (optional)
                  </label>
                  <input
                    id="goal-label"
                    name="label"
                    type="text"
                    placeholder="Category"
                    value={formValues.label}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="targetAmount" className="label">
                    Target Amount
                  </label>
                  <input
                    id="targetAmount"
                    name="targetAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formValues.targetAmount}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="savedAmount" className="label">
                    Saved Amount
                  </label>
                  <input
                    id="savedAmount"
                    name="savedAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formValues.savedAmount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="targetDate" className="label">
                  Target Date
                </label>
                <input
                  id="targetDate"
                  name="targetDate"
                  type="date"
                  value={formValues.targetDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsGoalsPage;


