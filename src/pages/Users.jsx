import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uSnap, oSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "orders"))
        ]);
        const orderCountMap = {};
        oSnap.forEach(doc => {
          const data = doc.data();
          const uid = data.userId;
          if (uid) orderCountMap[uid] = (orderCountMap[uid] || 0) + 1;
        });
        const userData = uSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          orderCount: orderCountMap[doc.id] || 0
        }));
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.id?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>User Management</h2>
        <input
          type="text"
          placeholder="Search by name, email, or UID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: 'var(--surface3)', border: '1px solid var(--surface3)', borderRadius: 8, padding: '8px 14px', color: 'var(--text)', fontSize: 13, width: 280 }}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>UID</th>
              <th style={{ textAlign: 'center' }}>Total Orders</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={user.profilePicUrl || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=8F4C34&color=fff`}
                      alt="avatar"
                      style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ fontWeight: 600 }}>{user.name || 'Anonymous'}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--muted)' }}>{user.email || 'N/A'}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--muted)' }}>{user.id.substring(0, 12)}...</td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ background: 'rgba(128,203,196,.2)', color: 'var(--blue)', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                    {user.orderCount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No users found matching your search.</div>
        )}
      </div>
    </div>
  );
};

export default Users;