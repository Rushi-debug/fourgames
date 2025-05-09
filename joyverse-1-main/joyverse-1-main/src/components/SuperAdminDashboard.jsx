import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, UserPlus, UserMinus } from 'lucide-react';

export function SuperAdminDashboard() {
  const [admins, setAdmins] = useState([]);
  const [adminFeedback, setAdminFeedback] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState('admins');

  useEffect(() => {
    fetchAdmins();
    fetchFeedback();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch('http://localhost:3002/api/admins');
      const data = await res.json();
      setAdmins(data);
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };

  const fetchFeedback = async () => {
    try {
      const res = await fetch('http://localhost:3002/api/feedback');
      const data = await res.json();
      setAdminFeedback(data);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (newAdmin.username && newAdmin.password) {
      try {
        const response = await fetch('http://localhost:3002/api/admins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAdmin),
        });

        if (response.ok) {
          setNewAdmin({ username: '', password: '' });
          fetchAdmins(); // Reload after adding
        } else {
          const err = await response.json();
          alert(err.error || 'Failed to add admin');
        }
      } catch (err) {
        console.error('Error adding admin:', err);
      }
    }
  };

  const handleDeleteAdmin = async (username) => {
    try {
      const response = await fetch('http://localhost:3002/api/admins/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) throw new Error('Failed to delete');

      fetchAdmins(); // Reload after deleting
    } catch (err) {
      console.error('🔥 Error deleting admin:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-comic text-blue-600">Super Admin Dashboard</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('admins')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              activeTab === 'admins' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            <Users size={20} />
            Manage Admins
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              activeTab === 'feedback' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            <MessageSquare size={20} />
            Admin Feedback
          </button>
        </div>
      </div>

      {activeTab === 'admins' ? (
        <div className="space-y-8">
          <form onSubmit={handleAddAdmin} className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-comic mb-4 flex items-center gap-2">
              <UserPlus size={24} className="text-green-500" />
              Add New Admin
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Username"
                value={newAdmin.username}
                onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                className="px-4 py-2 rounded-lg border-2 border-blue-300 focus:border-blue-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                className="px-4 py-2 rounded-lg border-2 border-blue-300 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              Add Admin
            </button>
          </form>

          <div>
            <h3 className="text-xl font-comic mb-4">Current Admins</h3>
            <div className="space-y-4">
              {admins.map((admin) => (
                <div
                  key={admin._id}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                >
                  <span className="text-lg">{admin.username}</span>
                  <button
                    onClick={() => handleDeleteAdmin(admin.username)}
                    className="flex items-center gap-2 text-red-500 hover:text-red-600"
                  >
                    <UserMinus size={20} />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-comic mb-4">Admin Feedback</h3>
          <div className="space-y-4">
            {adminFeedback.map((feedback, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold">From Admin: </span>
                    <span className="text-blue-600">{feedback.adminName}</span>
                  </div>
                  <span className="text-gray-500">{feedback.date}</span>
                </div>
                <p className="mt-2 text-gray-700">{feedback.message}</p>
              </div>
            ))}
            {adminFeedback.length === 0 && (
              <p className="text-gray-500 text-center py-4">No feedback messages received</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
