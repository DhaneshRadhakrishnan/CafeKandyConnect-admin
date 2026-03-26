import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Login      from "./pages/Login";
import Layout     from "./components/Layout";
import Dashboard  from "./pages/Dashboard";
import Products   from "./pages/Products";
import Categories from "./pages/Categories";
import Orders     from "./pages/Orders";
import Users      from "./pages/Users";
import Promos     from "./pages/Promos";

const ADMIN_UID = "rAP2QohPqfSTqMwNLyWMjfqPLYS2"; // 👈 Paste it here

function ProtectedRoute({ user, loading, children }) {
  if (loading) return <div className="loading">Brewing...</div>;

// Only allow if logged in AND the UID matches your Admin account
  if (user && user.uid === ADMIN_UID) {
    return children;
  }

  // If someone else logs in, or no one is logged in, send to login
  return <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute user={user} loading={loading}><Layout /></ProtectedRoute>
        }>
          <Route index             element={<Dashboard />} />
          <Route path="products"   element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders"     element={<Orders />} />
          <Route path="users"      element={<Users />} />
          <Route path="promos"     element={<Promos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}