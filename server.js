require('dotenv').config({ path: '.env.local' });
const express = require('express');
const { searchCustomer, updateWeight } = require('./getData');
const app = express();
const PORT = process.env.PORT || 5000;

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // טיפול בבקשות preflight
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});


app.get('/api/customer/:searchTerm', (req, res) => {
  searchCustomer(req, res);
});

app.post('/api/update-weight', (req, res) => {
  updateWeight(req, res);
});

app.listen(PORT, () => {
  // console.log(`🥩 מערכת מכירת בשר פועלת על http://localhost:${PORT}`);
  console.log('🔍 חיפוש לקוח: /api/customer/:searchTerm');
  console.log('⚖️ עדכון משקל: /api/update-weight');
  console.log('🧪 בדיקה: /test');
  console.log('Supabase URL:', process.env.SUPABASE_URL ? 'מוגדר' : 'חסר');
});