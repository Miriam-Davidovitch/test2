import React from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerApp from './CustomerApp';
import QRGenerator from './QRGenerator';
import config from './config';

function AdminApp() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = React.useState('reports');

  const downloadReport = async (reportType) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/reports/${reportType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('שגיאה בהורדת הדוח');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('שגיאה בהורדת הדוח');
    }
  };

  const renderReportsPage = () => (
    <div className="main-container" dir="rtl">
      <div className="header">
        <h1 className="main-title">🥩 פאנל מנהל - דוחות</h1>
        <button onClick={() => navigate('/')} className="exit-btn">
          יציאה
        </button>
      </div>
      <div className="admin-content">
        <h2>דוחות מערכת</h2>
        <p className="admin-description">לחץ על הדוח הרצוי להורדה</p>
        
        <div className="reports-grid">
          <div className="report-card" onClick={() => downloadReport('customers')}>
            <div className="report-icon">👥</div>
            <h3>דוח לקוחות</h3>
            <p>רשימת כל הלקוחות במערכת</p>
          </div>
          
          <div className="report-card" onClick={() => downloadReport('orders')}>
            <div className="report-icon">📋</div>
            <h3>דוח הזמנות</h3>
            <p>כל ההזמנות במערכת</p>
          </div>
          
          <div className="report-card" onClick={() => downloadReport('products')}>
            <div className="report-icon">🥩</div>
            <h3>דוח מוצרים</h3>
            <p>רשימת כל המוצרים</p>
          </div>
          
          <div className="report-card" onClick={() => downloadReport('financial')}>
            <div className="report-icon">💰</div>
            <h3>דוח כספי</h3>
            <p>סיכום חובות וזיכויים</p>
          </div>
        </div>
        
        <div className="admin-actions">
          <button 
            onClick={() => setCurrentView('customer-update')}
            className="admin-action-btn"
          >
            עדכון פרטים ללקוחות
          </button>
          <button 
            onClick={() => setCurrentView('qr-generator')}
            className="admin-action-btn qr-generator-btn"
          >
            📱 יצירת QR Codes ללקוחות
          </button>
        </div>
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

  const renderQRGeneratorPage = () => (
    <div>
      <div className="admin-nav-header">
        <h2>יצירת QR Codes ללקוחות</h2>
        <button 
          onClick={() => setCurrentView('reports')}
          className="back-btn"
        >
          חזור לדוחות
        </button>
      </div>
      <QRGenerator />
    </div>
  );

  return (
    <>
      {currentView === 'reports' && renderReportsPage()}
      {currentView === 'customer-update' && renderCustomerUpdatePage()}
      {currentView === 'qr-generator' && renderQRGeneratorPage()}
    </>
  );
}

export default AdminApp;