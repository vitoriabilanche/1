
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jutxfunuqslrflegdcje.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1dHhmdW51cXNscmZsZWdkY2plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MDIzNzksImV4cCI6MjA2MTk3ODM3OX0.nhTiXTcUQ31mKJVikbtP2pTgSsNzzXhpXrL_R6bTvt0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
