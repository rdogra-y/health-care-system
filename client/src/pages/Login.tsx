import {
  useState,
  type FormEvent
} from "react";

import {
  Navigate,
  useNavigate
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Login() {
  const {
    user,
    login
  } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState(
    "admin@healthcare.local"
  );

  const [password, setPassword] = useState(
    "HealthCareDemo2026!"
  );

  const [error, setError] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-brand-panel">
        <div className="login-brand">
          <div className="login-logo">H</div>

          <span>HEALTH CARE SYSTEM</span>
        </div>

        <div className="login-statement">
          <span className="login-eyebrow">
            CLINICAL OPERATIONS
          </span>

          <h1>
            Intelligence for every moment of care.
          </h1>

          <p>
            A unified operational workspace for patient
            flow, provider capacity and clinical
            intelligence.
          </p>
        </div>

        <div className="login-signal">
          <div>
            <span className="login-signal-dot" />

            <div>
              <strong>System operational</strong>
              <span>Secure clinical workspace</span>
            </div>
          </div>

          <span>2026</span>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-container">
          <span className="section-tag">
            AUTHORIZED ACCESS
          </span>

          <h2>Welcome back.</h2>

          <p className="login-description">
            Sign in to continue to the clinic command
            center.
          </p>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <label>
              Email address

              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />
            </label>

            <label>
              Password

              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />
            </label>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={submitting}
            >
              {submitting
                ? "Signing in..."
                : "Enter workspace"}
            </button>
          </form>

          <div className="demo-access">
            <span>DEMO ACCESS</span>

            <p>
              Administrator account is preconfigured for
              portfolio review.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;