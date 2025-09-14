import React, { useState, useRef } from 'react';
import QRCode from 'qrcode';
import config from './config';

function QRGenerator() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const canvasRef = useRef(null);

  // שליפת רשימת לקוחות
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/reports/customers`);
      if (response.ok) {
        // כאן נצטרך להוסיף endpoint שמחזיר JSON במקום Excel
        setMessage({ text: 'נדרש endpoint נוסף לשליפת לקוחות', type: 'warning' });
      } else {
        setMessage({ text: 'שגיאה בשליפת לקוחות', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'שגיאה בחיבור לשרת', type: 'error' });
    }
    setLoading(false);
  };

  // יצירת QR Code ללקוח
  const generateQR = async (customerId, customerName) => {
    try {
      const canvas = canvasRef.current;
      // יצירת URL מלא עם Customer ID
      const qrUrl = `${window.location.origin}/?customer=${customerId}`;
      
      await QRCode.toCanvas(canvas, qrUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // הורדת התמונה
      const link = document.createElement('a');
      link.download = `QR_${customerName}_${customerId}.png`;
      link.href = canvas.toDataURL();
      link.click();

      setMessage({ text: `QR Code נוצר עבור ${customerName}`, type: 'success' });
    } catch (error) {
      setMessage({ text: 'שגיאה ביצירת QR Code', type: 'error' });
    }
  };

  // יצירת QR ידני
  const [manualId, setManualId] = useState('');
  const [manualName, setManualName] = useState('');

  const generateManualQR = () => {
    if (!manualId) {
      setMessage({ text: 'יש למלא מספר לקוח', type: 'error' });
      return;
    }
    const customerName = manualName || `לקוח_${manualId}`;
    generateQR(manualId, customerName);
  };

  return (
    <div className="qr-generator-container">
      <h2>יצירת QR Codes ללקוחות</h2>
      
      {message.text && (
        <div className={`message message-${message.type}`}>
          <span>{message.text}</span>
          <button
            onClick={() => setMessage({ text: '', type: '' })}
            className="message-close-btn"
          >
            ×
          </button>
        </div>
      )}

      {/* יצירה ידנית */}
      <div className="manual-qr-section">
        <h3>יצירת QR ידנית</h3>
        <div className="manual-inputs">
          <input
            type="number"
            placeholder="מספר לקוח (Customer ID)"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            className="manual-input"
          />
          <input
            type="text"
            placeholder="שם הלקוח (אופציונלי)"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            className="manual-input"
          />
          <button
            onClick={generateManualQR}
            className="generate-qr-btn"
          >
            צור QR Code
          </button>
        </div>
      </div>

      {/* Canvas נסתר ליצירת QR */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* הוראות שימוש */}
      <div className="qr-instructions">
        <h3>הוראות שימוש:</h3>
        <ol>
          <li><strong>חובה:</strong> הכנס מספר לקוח (Customer ID)</li>
          <li><strong>אופציונלי:</strong> הכנס שם (רק לשם הקובץ)</li>
          <li>לחץ "צור QR Code" - הקובץ יורד אוטומטית</li>
          <li>הדפס את ה-QR על דף ההזמנה</li>
          <li>הלקוח סורק את הקוד בטלפון</li>
          <li>נפתח לו האתר עם הנתונים שלו!</li>
        </ol>
        <div style={{marginTop: '15px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px'}}>
          <strong>שים לב:</strong> ה-QR Code מכיל קישור ישיר לאתר עם מספר הלקוח
        </div>
      </div>
    </div>
  );
}

export default QRGenerator;