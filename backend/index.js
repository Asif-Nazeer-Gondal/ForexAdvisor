require('dotenv').config();
const express = require('express');
const supabase = require('./supabaseClient');
const app = express();
const PORT = process.env.PORT || 5000;

// Example: Access Twelve Data API Key
const twelveDataApiKey = process.env.TWELVE_DATA_API_KEY;

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Example route using Supabase
app.get('/users', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 