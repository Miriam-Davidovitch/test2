const express = require('express');
const usersHandler = require('./api/users');
const getDataHandler = require('./api/getData');
const app = express();
const PORT = 8080;

// API routes
app.get('/api/users', usersHandler);
app.get('/api/getData', getDataHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});