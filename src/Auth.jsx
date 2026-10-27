import { useState } from "react";
import Mark from "./Mark";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// One screen for both "Log in" and "Create account".
function Auth({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  function switchMode() {
    setMode(isRegister ? "login" : "register");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (isRegister && password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }

    setBusy(true);
    try {
      const url = isRegister ? `${API}/api/auth/register` : `${API}/api/auth/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        onLogin(data.token, data.email); // both register and login return a token
      } else if (response.status === 409) {
        setError("That email already has an account. Log in instead.");
      } else if (response.status === 401) {
        setError("That email and password don't match.");
      } else {
        setError("Check your email and password, then try again.");
      }
    } catch {
      setError("Can't reach the server. Check that the API is running.");
    }
    setBusy(false);
  }

  return (
    <main className="auth">
      <section className="auth-brand">
        <div className="brand">
          <Mark size={32} />
          <span>JobTrack</span>
        </div>

        <div>
          <h1>Know where every application stands.</h1>
          <p className="auth-lead">
            Log each role, move it through the stages, and see what needs your attention.
          </p>
        </div>

        <ol className="route">
          <li data-stage="Applied">
            <strong>Applied</strong>
            <span>You sent it. Now you wait.</span>
          </li>
          <li data-stage="Interview">
            <strong>Interview</strong>
            <span>Someone wants to talk.</span>
          </li>
          <li data-stage="Offer">
            <strong>Offer</strong>
            <span>Time to decide.</span>
          </li>
        </ol>
      </section>

      <section className="auth-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>
          <p className="muted">
            {isRegister
              ? "It takes a few seconds. You'll be logged in right away."
              : "Log in to see your applications."}
          </p>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {isRegister && <small className="muted">At least 8 characters.</small>}
          </label>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <button className="primary" type="submit" disabled={busy}>
            {busy ? "Please wait..." : isRegister ? "Create account" : "Log in"}
          </button>

          <p className="switch muted">
            {isRegister ? "Already have an account?" : "New here?"}{" "}
            <button type="button" className="link" onClick={switchMode}>
              {isRegister ? "Log in" : "Create an account"}
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Auth;
