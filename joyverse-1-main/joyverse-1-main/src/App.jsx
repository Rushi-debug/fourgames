import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { LoginForm } from './components/LoginForm';
import BoggleGame from './components/BoggleGame';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { GameSelection } from './components/GameSelection';
import { useAppData } from './hooks/useAppData';
import FruitGuesser from './components/fruitguesser';
import MemoryGame from './components/MemoryGame';
import MemorysGame from './components/MemorySequence';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const { admins, children, adminFeedback } = useAppData();

  const handleLogin = (role, username) => {
    setUserRole(role);
    setUserData({ username });
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100">
        <div className="container mx-auto px-4 py-8">
          {!userRole ? (
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="flex items-center justify-center gap-4">
                <BookOpen size={48} className="text-blue-600" />
                <h1 className="text-5xl font-comic text-blue-600">
                  Reading Adventure
                </h1>
              </div>
              
              <p className="text-2xl text-gray-700 font-comic leading-relaxed">
                Welcome to your special learning journey! 
                Let's make reading fun together.
              </p>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-3xl font-comic mb-6 text-gray-800">
                  Sign In to Continue
                </h2>
                <LoginForm onLogin={handleLogin} admins={admins} children={children} />
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto flex flex-col items-center space-y-8">
              <Routes>
                <Route path="/" element={
                  userRole === 'superadmin' ? <SuperAdminDashboard adminFeedback={adminFeedback} /> :
                  userRole === 'admin' ? <AdminDashboard adminUsername={userData.username} /> :
                  <GameSelection />
                } />
                <Route path="/boggle" element={<BoggleGame username={userData.username} />} />
                <Route path="/fruit-guesser" element={<FruitGuesser username={userData.username} />} />
                <Route path="/memory-game" element={<MemoryGame username={userData.username} />} />
                <Route path="/memorys-game" element={<MemorysGame username={userData.username} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>

              <button
                onClick={() => {
                  setUserRole(null);
                  setUserData(null);
                }}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;