// scripts/config.js
// Configuração global do Supabase
const supabaseUrl = 'https://cmotgxmepisuobieybzz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtb3RneG1lcGlzdW9iaWV5Ynp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MzM4NDcsImV4cCI6MjA3MzMwOTg0N30.wYlO8N5flb_agcMipu_PVh4U4Qn2XNn_g2L0mT6FX4k';

// Inicializar Supabase globalmente
const supabase = supabaseJs.createClient(supabaseUrl, supabaseKey);