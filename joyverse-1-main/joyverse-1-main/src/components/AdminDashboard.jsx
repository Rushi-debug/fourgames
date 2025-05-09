import React, { useEffect, useState } from 'react';
import { Users, MessageSquare, UserPlus, BarChart as ChartBar } from 'lucide-react';

export function AdminDashboard({ adminUsername }) {
  const [activeTab, setActiveTab] = useState('children');
  const [children, setChildren] = useState([]);
  const [newChild, setNewChild] = useState({ username: '', password: '', hint: '' });
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);

  // 🔃 Fetch children from DB
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await fetch(`http://localhost:3002/api/children?admin=${adminUsername}`);
        const data = await res.json();
        if (res.ok) {
          setChildren(data);
        } else {
          console.error('Error loading children:', data.error);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchChildren();
  }, [adminUsername]);

  // ➕ Add child to DB
  const handleAddChild = async (e) => {
    e.preventDefault();
    if (newChild.username && newChild.password && newChild.hint) {
      try {
        const response = await fetch('http://localhost:3002/api/children', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...newChild, adminId: adminUsername })
        });

        const data = await response.json();

        if (response.ok) {
          setChildren((prev) => [...prev, data]); // Add to UI
          setNewChild({ username: '', password: '', hint: '' });
        } else {
          alert(data.error || 'Something went wrong');
        }
      } catch (err) {
        console.error('Error:', err);
        alert('Failed to connect to backend');
      }
    }
  };

  // ✉️ Send feedback (still local unless connected to DB)
  const handleSendFeedback = (e) => {
    e.preventDefault();
    if (feedbackMessage.trim()) {
      const newFeedback = {
        message: feedbackMessage,
        adminName: adminUsername,
        date: new Date().toISOString().split('T')[0]
      };
      setFeedbacks([...feedbacks, newFeedback]);
      setFeedbackMessage('');
    }
  };

  


  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-comic text-blue-600">Admin Dashboard</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('children')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              activeTab === 'children' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            <Users size={20} />
            Manage Children
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              activeTab === 'reports' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            <ChartBar size={20} />
            Reports
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              activeTab === 'feedback' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            <MessageSquare size={20} />
            Send Feedback
          </button>
        </div>
      </div>

      {activeTab === 'children' && (
        <div className="space-y-8">
          <form onSubmit={handleAddChild} className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-comic mb-4 flex items-center gap-2">
              <UserPlus size={24} className="text-green-500" />
              Create Child Account
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Username"
                value={newChild.username}
                onChange={(e) => setNewChild({ ...newChild, username: e.target.value })}
                className="px-4 py-2 rounded-lg border-2 border-blue-300 focus:border-blue-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={newChild.password}
                onChange={(e) => setNewChild({ ...newChild, password: e.target.value })}
                className="px-4 py-2 rounded-lg border-2 border-blue-300 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Password Hint"
                value={newChild.hint}
                onChange={(e) => setNewChild({ ...newChild, hint: e.target.value })}
                className="px-4 py-2 rounded-lg border-2 border-blue-300 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              Create Account
            </button>
          </form>

          <div>
            <h3 className="text-xl font-comic mb-4">Child Accounts</h3>
            <div className="space-y-4">
              {children.map((child) => (
                <div
                  key={child.username}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                >
                  <div>
                    <p className="text-lg font-semibold">{child.username}</p>
                    <p className="text-sm text-gray-600">Hint: {child.hint}</p>
                  </div>
                </div>
              ))}
              {children.length === 0 && (
                <p className="text-gray-500 text-center py-4">No child accounts created yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div>
          <h3 className="text-xl font-comic mb-4">Game Reports</h3>
          <div className="space-y-4">
            {children.map((child) => (
              <div key={child.username} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">{child.username}</h4>
                {child.scores && child.scores.length > 0 ? (
                  <div className="space-y-2">
                    {child.scores.map((score, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>Score: {score.score}</span>
                        <span className="text-gray-500">{score.date}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No game scores recorded yet</p>
                )}
              </div>
            ))}
            {children.length === 0 && (
              <p className="text-gray-500 text-center py-4">No children to show reports for</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="space-y-8">
          <form onSubmit={handleSendFeedback} className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-comic mb-4">Send Feedback to Super Admin</h3>
            <textarea
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder="Type your feedback message here..."
              className="w-full px-4 py-2 rounded-lg border-2 border-blue-300 focus:border-blue-500 h-32"
            />
            <button
              type="submit"
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Send Feedback
            </button>
          </form>

          <div>
            <h3 className="text-xl font-comic mb-4">Sent Feedback</h3>
            <div className="space-y-4">
              {feedbacks.map((feedback, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <p className="text-gray-700">{feedback.message}</p>
                    <span className="text-sm text-gray-500">{feedback.date}</span>
                  </div>
                </div>
              ))}
              {feedbacks.length === 0 && (
                <p className="text-gray-500 text-center py-4">No feedback messages sent yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}