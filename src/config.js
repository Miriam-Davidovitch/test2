// קובץ הגדרות לכתובות שרת
const config = {
  // כתובת השרת - תשתנה בהתאם לסביבה
  API_BASE_URL: process.env.REACT_APP_API_URL
    //|| 
    //(window.location.hostname === 'localhost' 
      //? 'http://localhost:5000' 
      //: 'https://server-side-eight-swart.vercel.app'),  // כתובת השרת ב-Vercel
    
  // נתיבי API
  ENDPOINTS: {
    CUSTOMER: '/api/customer',
    CUSTOMER_BY_ID: '/api/customer-by-id',
    UPDATE_WEIGHT: '/api/update-weight',
    UPDATE_PAYMENT: '/api/update-payment',
    REPORTS: '/api/reports'
  }
};

export default config;

// הדרכה ל-Vercel (שני repositories):
// 1. העלה את backend-server ל-GitHub ואז ל-Vercel
// 2. הגדר ב-Vercel: SUPABASE_URL ו-SUPABASE_ANON_KEY
// 3. קבל כתובת כמו: https://backend-name.vercel.app
// 4. שנה את 'YOUR-BACKEND-NAME' לכתובת האמיתית
// 5. העלה את הקליינט ל-Vercel בנפרד
