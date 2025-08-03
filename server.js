// Simple proxy server to avoid CORS issues for local development
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Proxy all API requests to the Google Apps Script endpoint
const API_BASE = process.env.VITE_API_BASE || 'https://script.google.com/macros/s/AKfycbyze_wPMMhEZmnD1Z5QBJmcMJGJiOUhIY8Qnc9rFIyjRvMN_zlAg8UcxZqc1uwn4g/exec';

app.use('/api', async (req, res) => {
  const url = API_BASE + req.url.replace(/^\/api/, '');
  try {
    const axiosConfig = {
      method: req.method,
      url,
      headers: { ...req.headers, host: undefined },
      data: req.body
    };
    const response = await axios(axiosConfig);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
