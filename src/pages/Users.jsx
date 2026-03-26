import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Adjust path based on your config
import { collection, getDocs } from 'firebase/firestore';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load users and orders in parallel to calculate order counts
        const [uSnap, oSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "orders"))
        ]);

        // Build an orderCount map (userId → count)
        const orderCountMap = {};
        oSnap.forEach(doc => {
          const data = doc.data();
          const uid = data.userId;
          if (uid) {
            orderCountMap[uid] = (orderCountMap[uid] || 0) + 1;
          }
        });

        // Merge counts into user objects
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

  if (loading) return <div className="p-6 text-center">Loading users...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <input
          type="text"
          placeholder="Search by name, email, or UID..."
          className="border p-2 rounded w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">UID</th>
              <th className="p-4 text-center">Total Orders</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4 flex items-center gap-3">
                  <img 
                    src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name || 'User'}`} 
                    alt="avatar" 
                    className="w-10 h-10 rounded-full object-cover bg-gray-200"
                  />
                  <span className="font-medium">{user.name || 'Anonymous'}</span>
                </td>
                <td className="p-4 text-gray-600">{user.email || 'N/A'}</td>
                <td className="p-4 text-xs font-mono text-gray-400">
                  {user.id.substring(0, 12)}...
                </td>
                <td className="p-4 text-center">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                    {user.orderCount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-10 text-center text-gray-500">No users found matching your search.</div>
        )}
      </div>
    </div>
  );
};

export default Users;