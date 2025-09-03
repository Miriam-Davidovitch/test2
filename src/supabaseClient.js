import { createClient } from '@supabase/supabase-js'

// כאן את שם ה-URL וה-API Key שלך
const supabaseUrl = 'https://sbdjiocqwupjrbecvnxa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiZGppb2Nxd3VwanJiZWN2bnhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzIzNDIsImV4cCI6MjA3MjUwODM0Mn0.oSY4YoJpmKGX4-8HNSlkEGFTeGohINepvn9TXgElONw'

export const supabase = createClient(supabaseUrl, supabaseKey)
