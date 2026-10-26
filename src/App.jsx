import { useState } from "react";
import Login from "./Login";
import ApplicationList from "./ApplicationList";
import "./App.css";

function App() {
    const [token, setToken] = useState(localStorage.getItem("token"));

    function handleLogin(newToken) {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    }

    function handleLogout() {
        localStorage.removeItem("token");
        setToken(null);
    }

    if (!token) {
        return <Login onLogin={handleLogin} />;
    }

    return <ApplicationList token={token} onLogout={handleLogout} />;
}

export default App;