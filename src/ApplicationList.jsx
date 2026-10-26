import { useEffect, useState } from "react";

const API = "http://localhost:5000";

function ApplicationList({ token, onLogout }) {
    const [applications, setApplications] = useState([]);
    const [message, setMessage] = useState("Loading...");

    // the form fields
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("Applied");
    // the filters
    const [filterStatus, setFilterStatus] = useState("");
    const [search, setSearch] = useState("");

    async function loadApplications() {
        try {
            // build the URL, e.g. /api/applications?status=Interview&search=zain
            const params = new URLSearchParams();
            if (filterStatus) {
                params.append("status", filterStatus);
            }
            if (search) {
                params.append("search", search);
            }

            const response = await fetch(`${API}/api/applications?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 401) {
                onLogout(); // token expired or invalid, go back to login
                return;
            }

            const data = await response.json();
            setApplications(data);
            setMessage(data.length === 0 ? "No applications found." : "");
        } catch {
            setMessage("Cannot reach the API. Is it running?");
        }
    }

   
    useEffect(() => {
        loadApplications();
    }, [token, filterStatus, search]);

    async function handleAdd(event) {
        event.preventDefault();

        try {
            const response = await fetch(`${API}/api/applications`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ company, role, status }),
            });

            if (response.ok) {
                setCompany("");
                setRole("");
                setStatus("Applied");
                loadApplications(); // reload the list so the new one appears
            } else {
                setMessage("Could not add. Please fill in company and role.");
            }
        } catch {
            setMessage("Cannot reach the API. Is it running?");
        }
    }


    async function handleDelete(id) {
        if (!window.confirm("Delete this application?")) {
            return;
        }

        try {
            const response = await fetch(`${API}/api/applications/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                loadApplications();
            }
        } catch {
            setMessage("Cannot reach the API. Is it running?");
        }
    }

    async function handleStatusChange(app, newStatus) {
        try {
            const response = await fetch(`${API}/api/applications/${app.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...app, status: newStatus }),
            });

            if (response.ok) {
                loadApplications();
            }
        } catch {
            setMessage("Cannot reach the API. Is it running?");
        }
    }

    return (
        <div className="page">
            <div className="top-bar">
                <h1>My applications</h1>
                <button onClick={onLogout}>Log out</button>
            </div>

            <form className="add-form" onSubmit={handleAdd}>
                <input
                    placeholder="Company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                />
                <input
                    placeholder="Role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                />
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option>Applied</option>
                    <option>Interview</option>
                    <option>Offer</option>
                    <option>Rejected</option>
                </select>
                <button type="submit">Add</button>
            </form>


            <div className="filters">
                <input
                    placeholder="Search company or role"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="">All statuses</option>
                    <option>Applied</option>
                    <option>Interview</option>
                    <option>Offer</option>
                    <option>Rejected</option>
                </select>

            </div>
            {message && <p>{message}</p>}

            <ul className="app-list">
                {applications.map((app) => (
                    <li key={app.id} className="app-card">
                        <div className="app-info">
                            <strong>{app.company}</strong>
                            <span>{app.role}</span>
                        </div>
                        <div className="app-actions">
                            <select
                                value={app.status}
                                onChange={(e) => handleStatusChange(app, e.target.value)}
                            >
                                <option>Applied</option>
                                <option>Interview</option>
                                <option>Offer</option>
                                <option>Rejected</option>
                            </select>
                            <button onClick={() => handleDelete(app.id)}>Delete</button>
                        </div>
                    </li>                    
                ))}
            </ul>
        </div>
    );
}

export default ApplicationList;