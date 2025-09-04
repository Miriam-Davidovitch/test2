import React, { useState } from 'react';

function App() {
  const [searchValue, setSearchValue] = useState('');
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchCustomer = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/customer/${encodeURIComponent(searchValue)}`);
      const data = await res.json();
      
      if (res.ok) {
        setCustomerData(data);
      } else {
        alert(data.error || 'לא נמצא לקוח');
        setCustomerData(null);
      }
    } catch (err) {
      console.error('שגיאה בחיפוש:', err);
      alert('שגיאה בחיפוש לקוח');
    }
    setLoading(false);
  };

  const updateWeight = async (orderProductId, newWeight) => {
    try {
      const res = await fetch('http://localhost:3001/api/update-weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderProductId, finalWeight: newWeight })
      });
      
      if (res.ok) {
        // רענון נתוני הלקוח
        searchCustomer({ preventDefault: () => {} });
      } else {
        alert('שגיאה בעדכון משקל');
      }
    } catch (err) {
      console.error('שגיאה בעדכון:', err);
      alert('שגיאה בעדכון משקל');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#d32f2f' }}>🥩 מערכת מכירת בשר</h1>
      
      <form onSubmit={searchCustomer} style={{ marginBottom: '30px', textAlign: 'center' }}>
        <input
          type="text"
          placeholder="הכנס טלפון, מייל או מספר הזמנה"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{ 
            padding: '12px', 
            fontSize: '16px', 
            width: '300px', 
            marginLeft: '10px',
            border: '2px solid #ddd',
            borderRadius: '5px'
          }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '12px 20px', 
            fontSize: '16px',
            backgroundColor: '#d32f2f', 
            color: 'white', 
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'מחפש...' : 'חפש לקוח'}
        </button>
      </form>

      {customerData && (
        <div>
          <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
            <h2>פרטי לקוח</h2>
            <p><strong>שם:</strong> {customerData.customer.fullname}</p>
            <p><strong>טלפון:</strong> {customerData.customer.phone}</p>
            <p><strong>מייל:</strong> {customerData.customer.email}</p>
            <p><strong>תחנת חלוקה:</strong> {customerData.customer.distributionstation}</p>
          </div>

          <h3>הזמנות בשר</h3>
          {customerData.orders.map(order => (
            <div key={order.orderid} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
              <h4>הזמנה #{order.orderid} - {new Date(order.orderdate).toLocaleDateString('he-IL')}</h4>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e0e0e0' }}>
                    <th style={{ border: '1px solid #ccc', padding: '8px' }}>מוצר</th>
                    <th style={{ border: '1px solid #ccc', padding: '8px' }}>משקל ממוצע (ק"ג)</th>
                    <th style={{ border: '1px solid #ccc', padding: '8px' }}>מחיר לק"ג</th>
                    <th style={{ border: '1px solid #ccc', padding: '8px' }}>מחיר ששולם</th>
                    <th style={{ border: '1px solid #ccc', padding: '8px' }}>משקל סופי</th>
                    <th style={{ border: '1px solid #ccc', padding: '8px' }}>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products.map(product => {
                    const expectedPrice = (product.finalweight || product.avgweight) * product.priceperkg;
                    const difference = expectedPrice - product.paidprice;
                    
                    return (
                      <tr key={product.orderproductid}>
                        <td style={{ border: '1px solid #ccc', padding: '8px' }}>{product.productname}</td>
                        <td style={{ border: '1px solid #ccc', padding: '8px' }}>{product.avgweight}</td>
                        <td style={{ border: '1px solid #ccc', padding: '8px' }}>₪{product.priceperkg}</td>
                        <td style={{ border: '1px solid #ccc', padding: '8px' }}>₪{product.paidprice}</td>
                        <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={product.finalweight || ''}
                            placeholder="הכנס משקל"
                            style={{ width: '80px', padding: '4px' }}
                            onBlur={(e) => {
                              if (e.target.value) {
                                updateWeight(product.orderproductid, parseFloat(e.target.value));
                              }
                            }}
                          />
                        </td>
                        <td style={{ 
                          border: '1px solid #ccc', 
                          padding: '8px',
                          color: difference > 0 ? 'red' : difference < 0 ? 'green' : 'black',
                          fontWeight: 'bold'
                        }}>
                          {product.finalweight ? (
                            difference > 0 ? `חוב: ₪${difference.toFixed(2)}` :
                            difference < 0 ? `זיכוי: ₪${Math.abs(difference).toFixed(2)}` :
                            'מאוזן'
                          ) : 'ממתין למשקל'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
