import React from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerApp from './CustomerApp';

function AdminApp() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = React.useState('reports');

  const renderReportsPage = () => (
    <div className="main-container" dir="rtl">
      <div className="header">
        <h1 className="main-title">🥩 פאנל מנהל - דוחות</h1>
        <button onClick={() => navigate('/')} className="exit-btn">
          יציאה
        </button>
      </div>
      <div className="admin-content">
        <h2>דוחות</h2>
        <p className="admin-description">כאן יהיו הדוחות של המערכת</p>
        
        <button 
          onClick={() => setCurrentView('customer-update')}
          className="admin-action-btn"
        >
          עדכון פרטים ללקוחות
        </button>
      </div>
    </div>
  );

  const renderCustomerUpdatePage = () => (
    <div>
      <div className="admin-nav-header">
        <h2>עדכון פרטים ללקוחות</h2>
        <button 
          onClick={() => setCurrentView('reports')}
          className="back-btn"
        >
          חזור לדוחות
        </button>
      </div>
      <CustomerApp />
    </div>
  );

  return (
    <>
      {currentView === 'reports' && renderReportsPage()}
      {currentView === 'customer-update' && renderCustomerUpdatePage()}
    </>
  );
}

export default AdminApp;