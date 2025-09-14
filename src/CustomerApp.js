import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import config from './config';

function CustomerApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tempWeights, setTempWeights] = useState({});
  const [notReceivedProducts, setNotReceivedProducts] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [finalAmount, setFinalAmount] = useState(0);

  const [showQrScanner, setShowQrScanner] = useState(false);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  // בדיקה אם זה מנהל (הגיע דרך /admin)
  const isAdmin = location.pathname === '/admin';

  // פונקציה לחיפוש לקוח לפי Customer ID
  const searchCustomerById = async (customerId) => {
    setMessage({ text: '', type: '' });
    setLoading(true);
    
    try {
      const res = await fetch(`${config.API_BASE_URL}${config.ENDPOINTS.CUSTOMER_BY_ID}/${customerId}`);
      const data = await res.json();
      
      if (res.ok) {
        setCustomerData(data);
        setTempWeights({});
        setMessage({ text: 'לקוח נמצא בהצלחה!', type: 'success' });
      } else {
        setMessage({ text: data.error || 'לא נמצא לקוח', type: 'error' });
        setCustomerData(null);
      }
    } catch (err) {
      setMessage({ text: 'שגיאה בחיפוש לקוח', type: 'error' });
    }
    
    setLoading(false);
  };

  // פתיחת סורק QR
  const startQrScanner = async () => {
    try {
      setShowQrScanner(true);
      
      if (videoRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            const customerId = result.data;
            if (/^\d+$/.test(customerId)) {
              searchCustomerById(customerId);
              stopQrScanner();
            } else {
              setMessage({ text: 'QR Code לא תקין - חיפוש מספר לקוח', type: 'error' });
            }
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );
        
        await qrScannerRef.current.start();
      }
    } catch (err) {
      setMessage({ text: 'שגיאה בפתיחת המצלמה', type: 'error' });
      setShowQrScanner(false);
    }
  };

  // סגירת סורק QR
  const stopQrScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setShowQrScanner(false);
  };

  // בדיקה אם יש Customer ID ב-URL (מ-QR Code)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const customerId = urlParams.get('customer');
    
    if (customerId && /^\d+$/.test(customerId)) {
      searchCustomerById(customerId);
      // מנקה את הפרמטר מה-URL לאחר החיפוש
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // ניקוי כשיוצאים מהרכיב
  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const searchCustomer = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    // מנקה הודעות קודמות
    setMessage({ text: '', type: '' });

    // בדיקה אם משתמש רגיל מנסה לחפש לפי מספר הזמנה (רק מספרים קצרים)
    if (!isAdmin && /^\d{1,6}$/.test(searchValue.trim())) {
      setMessage({ text: 'אין לך הרשאה לחפש לפי מספר הזמנה', type: 'error' });
      setCustomerData(null); // מנקה נתונים קודמים
      return;
    }

    setLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      // אם זה מנהל, נוסיף הדר לזיהוי
      if (isAdmin) {
        headers['x-user-role'] = 'admin';
      }

      let url = `${config.API_BASE_URL}${config.ENDPOINTS.CUSTOMER}/${encodeURIComponent(searchValue)}`;

      // אם זה מנהל, נוסיף פרמטר בURL במקום header
      if (isAdmin) {
        url += '?admin=true';
      }

      const res = await fetch(url);
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
    // בדיקה שכל המוצרים עודכנו
    const unupdatedProducts = [];
    
    customerData.orders.forEach(order => {
      order.products.forEach(product => {
        const hasUpdatedWeight = tempWeights[product.orderproductid] !== undefined;
        const hasUpdatedCheckbox = notReceivedProducts[product.orderproductid] !== undefined;
        const finalWeightEqualsAvg = product.finalweight === product.avgweight;
        
        console.log(`מוצר: ${product.productname}`);
        console.log(`finalweight: ${product.finalweight}, avgweight: ${product.avgweight}`);
        console.log(`finalWeightEqualsAvg: ${finalWeightEqualsAvg}`);
        console.log(`hasUpdatedWeight: ${hasUpdatedWeight}`);
        console.log(`hasUpdatedCheckbox: ${hasUpdatedCheckbox}`);
        
        // אם המשקל הסופי שווה לממוצע (לא עודכן) ולא עדכן עכשיו
        if (finalWeightEqualsAvg && !hasUpdatedWeight && !hasUpdatedCheckbox) {
          console.log(`מוצר לא מעודכן: ${product.productname}`);
          unupdatedProducts.push(product.productname);
        }
      });
    });
    
    console.log(`מוצרים לא מעודכנים:`, unupdatedProducts);
    
    if (unupdatedProducts.length > 0) {
      setMessage({ 
        text: `שים לב! יש מוצרים שלא עדכנת לגביהם: ${unupdatedProducts.join(', ')}. אנא עדכן את המשקל או סמן "לא קבלתי מוצר".`, 
        type: 'warning' 
      });
      return;
    }
    
    const weightsToSave = Object.keys(tempWeights);
    const checkboxesToSave = Object.keys(notReceivedProducts);
    const totalChanges = weightsToSave.length + checkboxesToSave.length;

    if (totalChanges === 0) {
      setMessage({ text: 'אין שינויים לשמירה', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      // אוספים את כל השינויים - משקלים וcheckboxes
      const allChangedIds = [...new Set([...weightsToSave, ...checkboxesToSave])];

      const promises = allChangedIds.map(orderProductId => {
        const product = customerData.orders.flatMap(order => order.products)
          .find(p => p.orderproductid.toString() === orderProductId);

        const weightToSend = notReceivedProducts[orderProductId]
          ? product.avgweight
          : (tempWeights[orderProductId] || product.finalweight || product.avgweight);

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
        // חישוב הסכום הכולל לאחר השינויים
        const totalAmount = customerData.orders.reduce((sum, order) => {
          return sum + order.products.reduce((orderSum, product) => {
            const isNotReceived = notReceivedProducts[product.orderproductid] !== undefined ?
              notReceivedProducts[product.orderproductid] : (product.notreceived || false);
            
            const currentWeight = isNotReceived ?
              product.avgweight :
              (tempWeights[product.orderproductid] || product.finalweight || product.avgweight);
            
            const finalPrice = (currentWeight - product.avgweight) * product.priceperkg + product.paidprice;
            const difference = finalPrice - product.paidprice;
            const hasWeight = product.finalweight || tempWeights[product.orderproductid] !== undefined ||
              (notReceivedProducts[product.orderproductid] !== undefined);
            
            return orderSum + (hasWeight ? difference : 0);
          }, 0);
        }, 0);

        // הצגת הודעה יפה עם הסכום
        setFinalAmount(totalAmount);
        setShowFinalMessage(true);
        
        // חזרה לדף הבית אחרי 4 שניות (ניקוי כל הנתונים)
        setTimeout(() => {
          // ניקוי כל הנתונים
          setCustomerData(null);
          setTempWeights({});
          setNotReceivedProducts({});
          setShowFinalMessage(false);
          setSearchValue('');
          setMessage({ text: '', type: '' });
          
          // חזרה לדף הבית
          if (isAdmin) {
            navigate('/admin?key=admin2024');
          } else {
            navigate('/');
          }
        }, 4000);
        
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
        <h1 className="main-title">🥩  מכירת בשר</h1>
      </div>

      <form onSubmit={searchCustomer} className="search-form">
        <input
          type="text"
          placeholder={isAdmin ? "הכנס טלפון, מייל, ת.ז. או מספר הזמנה" : "הכנס טלפון, מייל או ת.ז."}
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

      <div className="qr-section">
        <p className="qr-text">או סרוק את ה-QR Code שלך:</p>
        {!showQrScanner ? (
          <button
            onClick={startQrScanner}
            disabled={loading}
            className="qr-button"
          >
            📱 סרוק QR Code
          </button>
        ) : (
          <div className="qr-scanner-container">
            <video ref={videoRef} className="qr-video" />
            <button onClick={stopQrScanner} className="qr-close-button">
              סגור סורק
            </button>
          </div>
        )}
      </div>

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

      {/* הודעת סיום יפה */}
      {showFinalMessage && (
        <div className="final-message-overlay">
          <div className="final-message-modal">
            <div className="final-message-icon">✓</div>
            <h2 className="final-message-title">תודה!</h2>
            <p className="final-message-subtitle">השינויים נשמרו בהצלחה</p>
            
            <div className="final-amount-section">
              {finalAmount > 0 ? (
                <>
                  <div className="amount-label">סכום לתשלום:</div>
                  <div className="amount-value debt">₪{finalAmount.toFixed(2)}</div>
                </>
              ) : finalAmount < 0 ? (
                <>
                  <div className="amount-label">סכום להחזר:</div>
                  <div className="amount-value credit">₪{Math.abs(finalAmount).toFixed(2)}</div>
                </>
              ) : (
                <>
                  <div className="amount-label">החשבון מאוזן</div>
                  <div className="amount-value balanced">אין סכום לתשלום</div>
                </>
              )}
            </div>
            
            <div className="final-message-footer">
              <p>חזרה לדף הבית בעוד מספר שניות...</p>
              <button 
                onClick={() => {
                  // ניקוי מיידי
                  setCustomerData(null);
                  setTempWeights({});
                  setNotReceivedProducts({});
                  setShowFinalMessage(false);
                  setSearchValue('');
                  setMessage({ text: '', type: '' });
                  
                  // חזרה לדף הבית
                  if (isAdmin) {
                    navigate('/admin?key=admin2024');
                  } else {
                    navigate('/');
                  }
                }}
                className="close-page-btn"
              >
                חזר לדף הבית
              </button>
            </div>
          </div>
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
                    // אם סומן כ"לא קיבלתי", המשקל הוא המשקל הממוצע
                    const isNotReceived = notReceivedProducts[product.orderproductid] !== undefined ?
                      notReceivedProducts[product.orderproductid] : (product.notreceived || false);

                    const currentWeight = isNotReceived ?
                      product.avgweight :
                      (tempWeights[product.orderproductid] || product.finalweight || product.avgweight);

                    const finalPrice = (currentWeight - product.avgweight) * product.priceperkg + product.paidprice;
                    const hasUnsavedChanges = tempWeights[product.orderproductid] !== undefined ||
                      (notReceivedProducts[product.orderproductid] !== undefined);

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
                              value={tempWeights[product.orderproductid] !== undefined ? tempWeights[product.orderproductid] : (product.finalweight || '')}
                              placeholder="הכנס משקל"
                              className="weight-input"
                              disabled={notReceivedProducts[product.orderproductid] !== undefined ?
                                notReceivedProducts[product.orderproductid] : (product.notreceived || false)}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                  updateTempWeight(product.orderproductid, '');
                                } else {
                                  const numValue = parseFloat(value);
                                  if (!isNaN(numValue)) {
                                    updateTempWeight(product.orderproductid, numValue);
                                  }
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
                          // אם סומן כ"לא קיבלתי", המשקל הוא המשקל הממוצע
                          const isNotReceived = notReceivedProducts[product.orderproductid] !== undefined ?
                            notReceivedProducts[product.orderproductid] : (product.notreceived || false);

                          const currentWeight = isNotReceived ?
                            product.avgweight :
                            (tempWeights[product.orderproductid] || product.finalweight || product.avgweight);

                          const finalPrice = (currentWeight - product.avgweight) * product.priceperkg + product.paidprice;
                          const difference = finalPrice - product.paidprice;
                          const hasWeight = product.finalweight || tempWeights[product.orderproductid] !== undefined ||
                            (notReceivedProducts[product.orderproductid] !== undefined);
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