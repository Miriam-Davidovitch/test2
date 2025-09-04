require('dotenv').config({ path: '.env.local' });
const express = require('express');
const { searchCustomer, updateWeight } = require('./api/getData');
const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// API routes
app.get('/api/customer/:searchTerm', (req, res) => {
  console.log('חיפוש לקוח:', req.params.searchTerm);
  searchCustomer(req, res);
});

app.post('/api/update-weight', (req, res) => {
  console.log('עדכון משקל:', req.body);
  updateWeight(req, res);
});

app.listen(PORT, () => {
  console.log(`🥩 מערכת מכירת בשר פועלת על http://localhost:${PORT}`);
  console.log('🔍 חיפוש לקוח: /api/customer/:searchTerm');
  console.log('⚖️ עדכון משקל: /api/update-weight');
  console.log('🧪 בדיקה: /test');
  console.log('Supabase URL:', process.env.SUPABASE_URL ? 'מוגדר' : 'חסר');
});