import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = 4000; // You can change this port if needed

app.use(cors());
app.use(express.json());

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyze_wPMMhEZmnD1Z5QBJmcMJGJiOUhIY8Qnc9rFIyjRvMN_zlAg8UcxZqc1uwn4g/exec';



// Only proxy /api requests to Google Apps Script
app.use('/api', async (req, res) => {
  try {
    const method = req.method.toLowerCase();
    const url = GOOGLE_SCRIPT_URL;
    const options = {
      method,
      url,
      headers: { ...req.headers, host: undefined },
      data: req.body,
      params: req.query,
    };
    const response = await axios(options);
    res.status(response.status).json(response.data);
  } catch (err) {
    // Log detailed error for debugging
    if (err.response) {
      console.error('Proxy error:', err.response.status, err.response.data);
      res.status(err.response.status).json({
        error: err.response.data || err.message,
        status: err.response.status
      });
    } else {
      console.error('Proxy error:', err.message);
      res.status(500).json({ error: err.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
