const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  res.json({ message: 'Hello World!' });
});

const server = app.listen(5000, '0.0.0.0', () => {
  console.log('✅ Server is running on http://localhost:5000');
  console.log('Test: curl http://localhost:5000/test');
});

server.on('error', (err) => {
  console.error('Server error:', err);
});