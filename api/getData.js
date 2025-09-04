const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  // CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  // Prevent caching
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  
  try {
    console.log('=== API CALL STARTED ===');
    console.log('Connecting to Supabase cloud database...');
    
    // חיבור רק למסד נתונים בענן
    const { data, error } = await supabase.from('users').select('*');
    
    console.log('Supabase response - data:', data);
    console.log('Supabase response - error:', error);
    
    if (error) {
      console.log('=== SUPABASE ERROR ===');
      console.log('Error message:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
      return res.status(500).json({ 
        error: 'Database connection failed: ' + error.message,
        message: 'Could not connect to cloud database',
        details: error
      });
    }

    console.log('=== SUCCESS ===');
    console.log('Successfully fetched from cloud database:', data);
    return res.status(200).json({ 
      source: 'supabase_cloud', 
      message: 'Data retrieved from Supabase cloud database',
      count: data ? data.length : 0,
      data: data || []
    });
    
  } catch (err) {
    console.log('Server error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};