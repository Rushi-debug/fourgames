const API_URL = 'http://localhost:3001/api';

export async function login(username, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  if (!response.ok) {
    throw new Error('Invalid credentials');
  }
  
  return response.json();
}

export async function getAdmins() {
  const response = await fetch(`${API_URL}/admins`);
  return response.json();
}

export async function createAdmin(username, password) {
  const response = await fetch(`${API_URL}/admins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return response.json();
}

export async function deleteAdmin(id) {
  await fetch(`${API_URL}/admins/${id}`, { method: 'DELETE' });
}

export async function getChildren(adminId) {
  const url = adminId ? `${API_URL}/children?adminId=${adminId}` : `${API_URL}/children`;
  const response = await fetch(url);
  return response.json();
}

export async function createChild(data) {
  const response = await fetch(`${API_URL}/children`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function saveScore(childId, score) {
  const response = await fetch(`${API_URL}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ childId, score })
  });
  return response.json();
}

export async function getScores(childId) {
  const url = childId ? `${API_URL}/scores?childId=${childId}` : `${API_URL}/scores`;
  const response = await fetch(url);
  return response.json();
}

export async function saveFeedback(data) {
  const response = await fetch(`${API_URL}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function getFeedback(adminId) {
  const url = adminId ? `${API_URL}/feedback?adminId=${adminId}` : `${API_URL}/feedback`;
  const response = await fetch(url);
  return response.json();
}