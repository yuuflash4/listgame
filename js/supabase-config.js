// Supabase Configuration & Initialization for Grandia Game Tavern

// Supabase Project Credentials
const SUPABASE_URL = window.SUPABASE_URL || 'https://wtmqitogzavrrvlejeki.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0bXFpdG9nemF2cnJ2bGVqZWtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NzU5MDgsImV4cCI6MjEwMjE1MTkwOH0.K0IpvR05GS9IuwNNQOgwN16cST-Ppt0Cbav89uoM-Lk';

// Initialize Supabase client globally
if (typeof supabase !== 'undefined') {
  try {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase Client initialized successfully.");
  } catch (e) {
    console.warn("Supabase initialization error:", e);
  }
} else {
  console.warn("Supabase SDK belum dimuat di HTML. Pastikan CDN @supabase/supabase-js dipasang.");
}

