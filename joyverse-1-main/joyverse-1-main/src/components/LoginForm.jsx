import React, { useState } from 'react';

export function LoginForm({ onLogin, admins, children }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Super admin (hardcoded)
    if (username === 'superadmin' && password === 'super123') {
      onLogin('superadmin', username);
      return;
    }
  
    try {
      const res = await fetch('http://localhost:3002/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
  
      const data = await res.json();
  
      if (res.ok) {
        onLogin(data.role, username); // role = 'admin' or 'user'
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server error. Try again later.');
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div>
        <label 
          htmlFor="username" 
          className="block text-2xl font-comic mb-2 text-gray-700"
        >
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 rounded-lg text-xl border-2 border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
        />
      </div>
      <div>
        <label 
          htmlFor="password" 
          className="block text-2xl font-comic mb-2 text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-lg text-xl border-2 border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
        />
      </div>
      {error && (
        <p className="text-red-500 text-xl">{error}</p>
      )}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white text-2xl py-3 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Sign In
      </button>
    </form>
  );
}