import { useState } from "react";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/instrument-sans";
import Auth from "./Auth";
import ApplicationList from "./ApplicationList";
import "./App.css";

function App() {
  // If a token is saved in the browser, we start logged in.
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [email, setEmail] = useState(localStorage.getItem("email") || "");

  function handleLogin(newToken, newEmail) {
    localStorage.setItem("token", newToken);
    localStorage.setItem("email", newEmail);
    setToken(newToken);
    setEmail(newEmail);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setToken(null);
    setEmail("");
  }

  if (!token) {
    return <Auth onLogin={handleLogin} />;
  }

  return <ApplicationList token={token} email={email} onLogout={handleLogout} />;
}

export default App;
