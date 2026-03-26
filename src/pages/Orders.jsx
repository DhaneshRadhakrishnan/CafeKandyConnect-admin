import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import Modal from '../components/Modal'; 
import StatCard from '../components/StatCard';

const TABS = ["ALL", "PENDING", "PROCESSING", "DELIVERED", "CANCELLED"];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, "orders"), orderBy("orderDate", "desc"));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const visible = filterStatus === "ALL"
    ? orders
    : orders.filter(o => o.status === filterStatus);

  const count = (s) => orders.filter(o => o.status === s).length;

  const handleStatusUpdate = async () => {
    if (!selected?.id) return;
    try {
      const orderRef = doc(db, "orders", selected.id);
      await updateDoc(orderRef, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === selected.id ? { ...o, status: newStatus } : o));
      setSelected(null);
      alert("Status updated!");
    } catch (error) {
      alert("Update failed.");
    }
  };

  if (loading) return <div className="p-4">Loading Orders...</div>;

  return (
    <div className="orders-page" style={{ padding: '20px' }}>
      <h2>Order Management</h2>

      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <StatCard title="Pending" value={count("PENDING")} color="#f39c12" />
        <StatCard title="Processing" value={count("PROCESSING")} color="#3498db" />
        <StatCard title="Delivered" value={count("DELIVERED")} color="#2ecc71" />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t}
            style={{
              padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
              background: filterStatus === t ? "#7e5233" : "#e0e0e0",
              color: filterStatus === t ? "#fff" : "#666", fontSize: 12, fontWeight: 600
            }}
            onClick={() => setFilterStatus(t)}>{t}</button>
        ))}
      </div>

      <table width="100%" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
            <th style={{ padding: '12px' }}>Order ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {visible.map(order => (
            <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{order.orderId}</td>
              <td>{order.shippingAddress?.name || 'Guest'}</td>
              <td>LKR {order.totalAmount?.toFixed(2)}</td>
              <td>{order.status}</td>
              <td>
                <button onClick={() => { setSelected(order); setNewStatus(order.status); }}>
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* FIXED MODAL LOGIC */}
      <Modal 
        isOpen={!!selected} 
        onClose={() => setSelected(null)} 
        title={selected ? `Order: ${selected.orderId}` : "Details"}
      >
        {/* All selected property checks are safely hidden behind this 'selected' check */}
        {selected && (
          <div style={{ minWidth: '300px' }}>
            <p><strong>Customer:</strong> {selected.shippingAddress?.name}</p>
            <p><strong>Contact:</strong> {selected.shippingAddress?.contact}</p>
            <p style={{ color: "#666", fontSize: '13px' }}>{selected.shippingAddress?.location}</p>

            <div style={{ margin: "15px 0", borderTop: '1px solid #eee', paddingTop: '10px' }}>
              {selected.orderItems?.map((item, i) => (
                <div key={i} style={{ fontSize: '13px' }}>
                  {item.productId} × {item.quantity}
                </div>
              ))}
            </div>

         {selected.shippingAddress?.latitude && selected.shippingAddress?.longitude ? (
  <div style={{ marginBottom: 15, textAlign: 'center' }}>
    <img 
      style={{ 
        width: "100%",           // Fill the modal width
        maxWidth: "400px",       // Don't go bigger than 400px
        height: "auto",          // Keep aspect ratio
        borderRadius: 8, 
        display: 'block',
        margin: '0 auto',        // Center it
        background: '#eee', 
        minHeight: '150px' 
      }}
      /* Changed size to 400x150 in the URL below */
      src={`https://maps.googleapis.com/maps/api/staticmap?center=${selected.shippingAddress.latitude},${selected.shippingAddress.longitude}&zoom=15&size=400x150&markers=color:red%7C${selected.shippingAddress.latitude},${selected.shippingAddress.longitude}&key=AIzaSyCI2ntHtdY0_G-nvJSxb8Xi6vAjPpC3OgM`}
      alt="Delivery Map"
      onError={(e) => {
         console.error("Map Error. Attempted URL:", e.target.src);
         e.target.style.display = 'none';
      }}
    />
  </div>
) : (
  <p style={{fontSize: '11px', color: 'red'}}>No location coordinates found.</p>
)}

            <div style={{ display: 'flex', gap: 10 }}>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ flex: 1, padding: '8px' }}>
                {["PENDING", "PROCESSING", "DELIVERED", "CANCELLED"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button onClick={handleStatusUpdate} style={{ background: '#7e5233', color: '#fff', padding: '8px 15px', borderRadius: 4 }}>
                Save
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;