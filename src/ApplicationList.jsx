import { useEffect, useState } from "react";
import Mark from "./Mark";

const API = "http://localhost:5000";
const STAGES = ["Applied", "Interview", "Offer", "Rejected"];

// "2026-10-24T13:34:20" -> "24 Oct"
function formatDate(text) {
  return new Date(text).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
    </svg>
  );
}

function ApplicationList({ token, email, onLogout }) {
  const [applications, setApplications] = useState([]); // the rows on screen
  const [counts, setCounts] = useState({}); // how many in each stage
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  // the "add" form
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [formError, setFormError] = useState("");

  // Sends a request with our token. If the token is no longer valid, we log out.
  async function authFetch(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      onLogout();
    }
    return response;
  }

  // The rows: uses the search and stage filters.
  async function loadApplications() {
    try {
      const params = new URLSearchParams();
      if (filterStatus) {
        params.append("status", filterStatus);
      }
      if (search) {
        params.append("search", search);
      }

      const response = await authFetch(`/api/applications?${params}`);
      if (response.ok) {
        setApplications(await response.json());
        setError("");
      }
    } catch {
      setError("Can't reach the server. Check that the API is running.");
    }
    setLoading(false);
  }

  // The numbers above the list: always counts everything, ignoring the filters.
  async function loadCounts() {
    try {
      const response = await authFetch("/api/applications");
      if (response.ok) {
        const all = await response.json();
        const result = {};
        STAGES.forEach((stage) => {
          result[stage] = all.filter((a) => a.status === stage).length;
        });
        setCounts(result);
        setTotal(all.length);
      }
    } catch {
      // the rows already show an error message if the server is down
    }
  }

  function refresh() {
    loadApplications();
    loadCounts();
  }

  useEffect(() => {
    loadCounts();
  }, [token]);

  useEffect(() => {
    loadApplications();
  }, [token, filterStatus, search]);

  async function handleAdd(event) {
    event.preventDefault();
    setFormError("");

    if (!company.trim() || !role.trim()) {
      setFormError("Add a company and a role.");
      return;
    }

    try {
      const response = await authFetch("/api/applications", {
        method: "POST",
        body: JSON.stringify({ company, role, status }),
      });

      if (response.ok) {
        setCompany("");
        setRole("");
        setStatus("Applied");
        refresh();
      } else {
        setFormError("Couldn't add that. Check the company and role.");
      }
    } catch {
      setFormError("Can't reach the server. Check that the API is running.");
    }
  }

  async function handleStatusChange(app, newStatus) {
    try {
      // The API's PUT wants every field, so we send the whole application with the new stage.
      const response = await authFetch(`/api/applications/${app.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...app, status: newStatus }),
      });
      if (response.ok) {
        refresh();
      }
    } catch {
      setError("Can't reach the server. Check that the API is running.");
    }
  }

  async function handleDelete(app) {
    if (!window.confirm(`Delete ${app.company}?`)) {
      return;
    }

    try {
      const response = await authFetch(`/api/applications/${app.id}`, { method: "DELETE" });
      if (response.ok) {
        refresh();
      }
    } catch {
      setError("Can't reach the server. Check that the API is running.");
    }
  }

  function toggleStage(stage) {
    setFilterStatus(filterStatus === stage ? "" : stage);
  }

  const isFiltered = filterStatus !== "" || search !== "";

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <Mark />
          <span>JobTrack</span>
        </div>
        <div className="who">
          <span className="who-email">{email}</span>
          <button className="ghost" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <main>
        <h1 className="page-title">Your pipeline</h1>
        <p className="muted page-sub">
          {total === 0 ? "Nothing tracked yet." : `${total} ${total === 1 ? "application" : "applications"} tracked.`}
        </p>

        <div className="stages" role="group" aria-label="Filter by stage">
          {STAGES.map((stage) => (
            <button
              key={stage}
              type="button"
              className={filterStatus === stage ? "stage active" : "stage"}
              data-stage={stage}
              aria-pressed={filterStatus === stage}
              onClick={() => toggleStage(stage)}
            >
              <span className="stage-dot" />
              <span className="stage-count">{counts[stage] ?? 0}</span>
              <span className="stage-name">{stage}</span>
            </button>
          ))}
        </div>

        <form className="add" onSubmit={handleAdd}>
          <h2>Add an application</h2>
          <div className="add-fields">
            <label className="field">
              <span>Company</span>
              <input value={company} onChange={(e) => setCompany(e.target.value)} />
            </label>
            <label className="field">
              <span>Role</span>
              <input value={role} onChange={(e) => setRole(e.target.value)} />
            </label>
            <label className="field">
              <span>Stage</span>
              <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STAGES.map((stage) => (
                  <option key={stage}>{stage}</option>
                ))}
              </select>
            </label>
            <button className="primary" type="submit">
              Add application
            </button>
          </div>
          {formError && (
            <p className="error" role="alert">
              {formError}
            </p>
          )}
        </form>

        <div className="toolbar">
          <label className="search">
            <SearchIcon />
            <input
              type="search"
              placeholder="Search company or role"
              aria-label="Search company or role"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          {filterStatus && (
            <button className="link" onClick={() => setFilterStatus("")}>
              Show all stages
            </button>
          )}
        </div>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && applications.length === 0 && (
          <p className="empty">
            {isFiltered
              ? "Nothing matches. Try another stage or clear the search."
              : "No applications yet. Add your first one above."}
          </p>
        )}

        <ul className="rows">
          {applications.map((app) => (
            <li key={app.id} className="row" data-stage={app.status}>
              <div className="row-main">
                <strong className="company">{app.company}</strong>
                <span className="role">{app.role}</span>
              </div>
              <span className="row-date">Added {formatDate(app.appliedOn)}</span>
              <select
                className="select pill"
                value={app.status}
                aria-label={`Stage for ${app.company}`}
                onChange={(e) => handleStatusChange(app, e.target.value)}
              >
                {STAGES.map((stage) => (
                  <option key={stage}>{stage}</option>
                ))}
              </select>
              <button className="icon-btn" aria-label={`Delete ${app.company}`} onClick={() => handleDelete(app)}>
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default ApplicationList;
