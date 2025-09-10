import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from './config';

function CustomerApp() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tempWeights, setTempWeights] = useState({});
  const [notReceivedProducts, setNotReceivedProducts] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });

  const searchCustomer = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${config.API_BASE_URL}${config.ENDPOINTS.CUSTOMER}/${encodeURIComponent(searchValue)}`);
      const data = await res.json();
      if (res.ok) {
        setCustomerData(data);
        setTempWeights({});
      } else {
        setMessage({ text: data.error || 'לא נמצא לקוח', type: 'error' });
        setCustomerData(null);
      }
    } catch (err) {
      setMessage({ text: 'שגיאה בחיפוש לקוח', type: 'error' });
    }
    setLoading(false);
  };

  const updateTempWeight = (orderProductId, newWeight) => {
    setTempWeights(prev => ({
      ...prev,
      [orderProductId]: newWeight
    }));
  };

  const saveAllWeights = async () => {
    const weightsToSave = Object.keys(tempWeights);
    if (weightsToSave.length === 0) {
      setMessage({ text: 'אין שינויים לשמירה', type: 'warning' });
      return;
    }
    
    setLoading(true);
    try {
      const promises = weightsToSave.map(orderProductId => {
        const product = customerData.orders.flatMap(order => order.products)
          .find(p => p.orderproductid.toString() === orderProductId);
        
        const weightToSend = notReceivedProducts[orderProductId] 
          ? product.avgweight 
          : tempWeights[orderProductId];
        
        return fetch(`${config.API_BASE_URL}${config.ENDPOINTS.UPDATE_WEIGHT}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderProductId: parseInt(orderProductId), 
            finalWeight: weightToSend,
            notReceived: notReceivedProducts[orderProductId] || false
          })
        });
      });
      
      const results = await Promise.all(promises);
      const allSuccessful = results.every(res => res.ok);
      
      if (allSuccessful) {
        await searchCustomer({ preventDefault: () => {} });
        setTempWeights({});
        setMessage({ text: `כל המשקלים נשמרו בהצלחה! (${weightsToSave.length} עדכונים)`, type: 'success' });
      } else {
        setMessage({ text: 'חלק מהעדכונים נכשלו. נסה שוב.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'שגיאה בשמירת המשקלים: ' + err.message, type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="main-container" dir="rtl">
      <div className="customer-header">
        <h1 className="main-title">🥩 מערכת מכירת בשר</h1>
      </div>
      
      <form onSubmit={searchCustomer} className="search-form">
        <input
          type="text"
          placeholder="הכנס טלפון, מייל או מספר הזמנה"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="search-input"
        />
        <button 
          type="submit"
          disabled={loading}
          className="search-button"
        >
          {loading ? 'מחפש...' : 'חפש לקוח'}
        </button>
      </form>

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

      {customerData && (
        <div>
          <div className="customer-info">
            <h2>פרטי לקוח</h2>
            <p><strong>שם:</strong> {customerData.customer.fullname}</p>
            <p><strong>טלפון:</strong> {customerData.customer.phone}</p>
            <p><strong>מייל:</strong> {customerData.customer.email}</p>
            <p><strong>תחנת חלוקה:</strong> {customerData.customer.distributionstation}</p>
          </div>

          <h3 className="orders-title">הזמנות בשר</h3>
          {customerData.orders.map(order => (
            <div key={order.orderid} className="order-container">
              <h4 className="order-title">הזמנה #{order.orderid} - {new Date(order.orderdate).toLocaleDateString('he-IL')}</h4>
              
              <table className="products-table">
                <thead>
                  <tr className="table-header">
                    <th>מוצר</th>
                    <th>משקל ממוצע (ק"ג)</th>
                    <th>מחיר לק"ג</th>
                    <th>מחיר ששולם</th>
                    <th>משקל סופי</th>
                    <th>לא קבלתי מוצר</th>
                    <th>סכום כולל</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products.map(product => {
                    const currentWeight = tempWeights[product.orderproductid] || product.finalweight || product.avgweight;
                    const finalPrice = (currentWeight - product.avgweight) * product.priceperkg + product.paidprice;
                    const hasUnsavedChanges = tempWeights[product.orderproductid] !== undefined;
                    
                    return (
                      <tr key={product.orderproductid}>
                        <td className="table-cell">{product.productname}</td>
                        <td className="table-cell">{product.avgweight}</td>
                        <td className="table-cell">₪{product.priceperkg}</td>
                        <td className="table-cell">₪{product.paidprice}</td>
                        <td className="table-cell">
                          <div className="weight-input-container">
                            <input
                              type="number"
                              step="0.01"
                              value={tempWeights[product.orderproductid] || product.finalweight || ''}
                              placeholder="הכנס משקל"
                              className="weight-input"
                              disabled={notReceivedProducts[product.orderproductid] !== undefined ? notReceivedProducts[product.orderproductid] : (product.notreceived || false)}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value) {
                                  updateTempWeight(product.orderproductid, parseFloat(value));
                                }
                              }}
                            />
                          </div>
                        </td>
                        <td className="table-cell">
                          <input
                            type="checkbox"
                            checked={notReceivedProducts[product.orderproductid] !== undefined ? notReceivedProducts[product.orderproductid] : (product.notreceived || false)}
                            onChange={(e) => {
                              setNotReceivedProducts(prev => ({
                                ...prev,
                                [product.orderproductid]: e.target.checked
                              }));
                            }}
                          />
                        </td>
                        <td className="table-cell">
                          <div>
                            <div className="final-price">
                              ₪{finalPrice.toFixed(2)}
                            </div>
                            {hasUnsavedChanges && (
                              <small className="unsaved-indicator">*</small>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="table-summary">
                    <td colSpan="6" className="summary-label">הפרש כולל להזמנה:</td>
                    <td className="summary-amount">
                      {(() => {
                        const totalDifference = order.products.reduce((sum, product) => {
                          const currentWeight = tempWeights[product.orderproductid] || product.finalweight || product.avgweight;
                          const finalPrice = (currentWeight - product.avgweight) * product.priceperkg + product.paidprice;
                          const difference = finalPrice - product.paidprice;
                          const hasWeight = product.finalweight || tempWeights[product.orderproductid] !== undefined;
                          return sum + (hasWeight ? difference : 0);
                        }, 0);   
                        if (totalDifference > 0) {
                          return <span className="total-debt">חוב: ₪{totalDifference.toFixed(2)}</span>;
                        } else if (totalDifference < 0) {
                          return <span className="total-credit">זיכוי: ₪{Math.abs(totalDifference).toFixed(2)}</span>;
                        } else {
                          return <span className="total-balanced">מאוזן</span>;
                        }
                      })()} 
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ))}
          
          {(Object.keys(tempWeights).length > 0 || Object.keys(notReceivedProducts).length > 0) && (
            <div className="save-changes-container">
              <p className="save-changes-text">
                יש לך {Object.keys(tempWeights).length + Object.keys(notReceivedProducts).length} שינויים שלא נשמרו
              </p>
              <button 
                onClick={saveAllWeights}
                disabled={loading}
                className="save-all-button"
              >
                {loading ? 'שומר...' : 'שמור את כל השינויים'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CustomerApp;