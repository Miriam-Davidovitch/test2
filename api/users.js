// api/users.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://sbdjiocqwupjrbecvnxa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiZGppb2Nxd3VwanJiZWN2bnhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzIzNDIsImV4cCI6MjA3MjUwODM0Mn0.oSY4YoJpmKGX4-8HNSlkEGFTeGohINepvn9TXgElONw'
);

module.exports = async (req, res) => {
  // CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.log('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Data from Supabase:', data);
    return res.status(200).json(data);
  } catch (err) {
    console.log('Server error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
};
