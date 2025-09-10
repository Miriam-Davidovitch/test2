import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="main-container" dir="rtl">
      <h1 className="main-title">🥩 מערכת מכירת בשר</h1>
      <div className="login-section">
        <h2 className="login-title">בחר סוג כניסה</h2>
        <div className="login-buttons">
          <button 
            onClick={() => navigate('/customer?key=cust2024')}
            className="login-btn customer-btn"
          >
            כניסת לקוח
          </button>
          <button 
            onClick={() => navigate('/admin?key=admin2024')}
            className="login-btn admin-btn"
          >
            כניסת מנהל
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;