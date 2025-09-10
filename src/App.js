import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import CustomerApp from './CustomerApp';
import AdminApp from './AdminApp';
import './App.css';

// מפתח גישה למנהל
const ADMIN_KEY = 'admin2024';

// רכיב הגנה למנהלים
function ProtectedAdmin() {
  const [searchParams] = useSearchParams();
  const key = searchParams.get('key');
  
  if (key !== ADMIN_KEY) {
    return <Navigate to="/" />;
  }
  
  return <AdminApp />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CustomerApp />} />
        <Route path="/admin" element={<ProtectedAdmin />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;