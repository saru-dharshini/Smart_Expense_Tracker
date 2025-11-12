import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '../../config/navigation';
import { useAuth } from '../../context/AuthContext';

const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const returnTo = useMemo(() => {
    const state = location.state as { from?: { pathname?: string } } | null;
    return state?.from?.pathname ?? '/dashboard';
  }, [location.state]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Enter both email and password.');
      return;
    }

    setSubmitting(true);
    setError(undefined);

    try {
      await signIn(email.trim(), password);
      navigate(returnTo, { replace: true });
    } catch (err) {
      console.error('Sign-in failed', err);
      setError('Invalid email or password. Please try again.');
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
            <h1>Sign in to your account</h1>
          </div>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="btn-primary btn-large" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="auth-footer">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="auth-footer-link">
              Sign up
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default SignInPage;

