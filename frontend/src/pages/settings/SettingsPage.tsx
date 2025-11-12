import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { SettingsUpdatePayload } from '../../types';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD'];

const SettingsPage = () => {
  const { settings, refreshSettings } = useAuth();

  const [baseCurrency, setBaseCurrency] = useState('INR');
  const [pin, setPin] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings?.baseCurrency) {
      setBaseCurrency(settings.baseCurrency);
    }
  }, [settings?.baseCurrency]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const payload: SettingsUpdatePayload = {
      baseCurrency,
      newPin: pin.trim() ? pin.trim() : undefined,
    };

    try {
      await api.put('/settings', payload);
      await refreshSettings();
      setMessage('Settings saved successfully.');
      setPin('');
    } catch (err) {
      console.error('Failed to update settings', err);
      setError('Unable to save settings. Please check your PIN format.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-card">
        <h2 className="dashboard-card-title">Settings</h2>
        <p className="page-subtitle">Customize PayPulse to match your preferences.</p>

        <form className="form-grid section-spacing" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="currency" className="label">
              Base Currency
            </label>
            <select
              id="currency"
              className="select"
              value={baseCurrency}
              onChange={(event) => setBaseCurrency(event.target.value)}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="pin" className="label">
              Set / Update PIN
            </label>
            <input
              id="pin"
              type="password"
              placeholder="New PIN (optional)"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              maxLength={6}
            />
            <small className="field-hint">Use 4-6 digits. Leave blank to keep current PIN.</small>
          </div>

          {message && <div className="form-success">{message}</div>}
          {error && <div className="form-error">{error}</div>}

          <div className="action-row">
            <button type="submit" className="btn-neutral" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;

