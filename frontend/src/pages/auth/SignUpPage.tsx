import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '../../config/navigation';
import { useAuth } from '../../context/AuthContext';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError(undefined);

    try {
      await signUp(fullName.trim(), email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Sign-up failed', err);
      setError('Unable to create account. Try a different email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-sidebar">
        <div className="auth-logo">
          <span className="auth-logo-main">Pay</span>
          <span className="auth-logo-highlight">Pulse</span>
        </div>
        <nav className="auth-nav">
          {NAV_ITEMS.map((item) => (
            <span key={item.path} className="auth-nav-item">
              {item.label}
            </span>
          ))}
        </nav>
      </aside>

      <section className="auth-content">
        <header className="auth-topbar">
          <Link to="/signin" className="auth-topbar-link">
            Sign in
          </Link>
          <Link to="/signup" className="btn-primary btn-compact">
            Sign up
          </Link>
        </header>

        <div className="auth-card">
          <div className="auth-card-header">
            <h1>Create your account</h1>
          </div>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="fullName" className="sr-only">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="btn-primary btn-large" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Sign up'}
            </button>
          </form>
          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/signin" className="auth-footer-link">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default SignUpPage;

