import { useState } from "react";

const API = "http://localhost:5000";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage("Logging in...");

        try {
            const response = await fetch(`${API}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                onLogin(data.token);
            } else {
                setMessage("Wrong email or password");
            }
        } catch {
            setMessage("Cannot reach the API. Is it running?");
        }
    }

    return (
        <div className="login-box">
            <h1>JobTrack</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Log in</button>
            </form>
            <p>{message}</p>
        </div>
    );
}

export default Login;