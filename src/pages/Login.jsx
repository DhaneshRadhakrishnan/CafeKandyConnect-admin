import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom"; // 1. Import this

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [error, setError] = useState("");
  const [busy,  setBusy]  = useState(false);

        const navigate = useNavigate();


  const handleLogin = async () => {
    setBusy(true); setError("");
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      navigate("/");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>☕ CaféKandy Admin</h1>
        <input type="email"    placeholder="Admin email"    value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password"       value={pass}  onChange={e => setPass(e.target.value)}  />
        {error && <p className="err">{error}</p>}
        <button className="btn-primary" onClick={handleLogin} disabled={busy}>
          {busy ? "Signing in..." : "Sign In"}
        </button>
      </div>
    </div>
  );
}