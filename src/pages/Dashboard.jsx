import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [stats,    setStats]    = useState({ users:0, products:0, orders:0, revenue:0 });
  const [recent,   setRecent]   = useState([]);
  const [byStatus, setByStatus] = useState({});

  useEffect(() => {
    (async () => {
      const [uSnap, pSnap, oSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "products")),
        getDocs(query(collection(db, "orders"), orderBy("orderDate", "desc")))
      ]);
      const orders   = oSnap.docs.map(d => ({ id:d.id, ...d.data() }));
     const revenue = orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);
      const statusCount = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1; return acc;
      }, {});
      setStats({ users:uSnap.size, products:pSnap.size, orders:oSnap.size, revenue });
      setRecent(orders.slice(0, 5));
      setByStatus(statusCount);
    })();
  }, []);

return (
  <div>
    <h2 style={{marginBottom:20}}>Dashboard</h2>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
      <StatCard icon="👥" label="Users"    value={stats.users}    accent="var(--blue)" />
      <StatCard icon="☕" label="Products" value={stats.products} accent="var(--cream)" />
      <StatCard icon="📦" label="Orders"   value={stats.orders}   accent="var(--gold)" />
      <StatCard icon="💰" label="Revenue"  value={`LKR ${stats.revenue.toLocaleString()}`} accent="var(--green)" />
    </div>
    <div className="card">
      <h3 style={{marginBottom:14}}>Recent Orders</h3>
      <table>
        <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          {recent.map(o => (
            <tr key={o.id}>
              <td style={{fontFamily:"monospace",fontSize:11}}>{o.orderId}</td>
              <td>{o.shippingAddress?.name || "—"}</td>
              <td>LKR {o.totalAmount?.toFixed(2)}</td>
              <td><span className={`badge ${o.status?.toLowerCase()}`}>{o.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
}
