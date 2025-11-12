import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import api from '../../api/client';
import type { Category } from '../../types';

const DEFAULT_COLORS = ['#2563EB', '#F97316', '#10B981', '#EC4899', '#6366F1', '#F59E0B'];

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | undefined>(undefined);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formValues, setFormValues] = useState({
    name: '',
    colorHex: DEFAULT_COLORS[0],
    iconName: '',
  });

  const loadCategories = async () => {
    setLoading(true);
    setLoadError(undefined);
    try {
      const { data } = await api.get<Category[]>('/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
      setLoadError('Unable to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormValues({
        name: category.name,
        colorHex: category.colorHex ?? DEFAULT_COLORS[0],
        iconName: category.iconName ?? '',
      });
    } else {
      setEditingCategory(null);
      setFormValues({
        name: '',
        colorHex: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
        iconName: '',
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formValues.name.trim()) {
      setModalError('Enter a category name.');
      return;
    }

    setSaving(true);
    setModalError(undefined);

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, {
          name: formValues.name.trim(),
          colorHex: formValues.colorHex,
          iconName: formValues.iconName.trim() || undefined,
        });
      } else {
        await api.post('/categories', {
          name: formValues.name.trim(),
          colorHex: formValues.colorHex,
          iconName: formValues.iconName.trim() || undefined,
        });
      }
      setModalOpen(false);
      await loadCategories();
    } catch (err) {
      console.error('Failed to save category', err);
      setModalError('Could not save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    const confirmed = window.confirm(
      `Delete category "${category.name}"? Expenses using it will need reassignment.`
    );
    if (!confirmed) {
      return;
    }
    try {
      await api.delete(`/categories/${category.id}`);
      await loadCategories();
    } catch (err) {
      console.error('Failed to delete category', err);
      window.alert('Unable to delete category.');
    }
  };

  return (
    <div className="categories-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organize your spending with clear, reusable tags.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => openModal()}>
          + New Category
        </button>
      </div>

      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
        </div>
      ) : loadError ? (
        <div className="empty-state">
          <p>{loadError}</p>
          <button type="button" className="btn-primary section-spacing" onClick={() => loadCategories()}>
            Retry
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <p>No categories yet. Add one to start grouping expenses.</p>
          <button type="button" className="btn-primary section-spacing" onClick={() => openModal()}>
            Create Category
          </button>
        </div>
      ) : (
        <div className="dashboard-card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Icon</th>
                <th>Color</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.iconName || '-'}</td>
                  <td>
                    <span className="category-color">
                      <span
                        className="category-color-dot"
                        style={{ backgroundColor: category.colorHex ?? '#cbd5f5' }}
                      />
                      {category.colorHex || '#cbd5f5'}
                    </span>
                  </td>
                  <td>
                    <div className="goal-actions">
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => openModal(category)}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => handleDelete(category)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'New Category'}</h2>
              <button type="button" className="icon-button" onClick={closeModal}>
                ×
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSubmit}>
              {modalError && <div className="form-error">{modalError}</div>}
              <div className="form-field">
                <label htmlFor="category-name" className="label">
                  Category Name
                </label>
                <input
                  id="category-name"
                  type="text"
                  value={formValues.name}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="category-color" className="label">
                    Color
                  </label>
                  <input
                    id="category-color"
                    type="color"
                    value={formValues.colorHex}
                    onChange={(event) =>
                      setFormValues((prev) => ({
                        ...prev,
                        colorHex: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="category-icon" className="label">
                    Icon (optional)
                  </label>
                  <input
                    id="category-icon"
                    type="text"
                    placeholder="e.g., ShoppingBag"
                    value={formValues.iconName}
                    onChange={(event) =>
                      setFormValues((prev) => ({
                        ...prev,
                        iconName: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;

