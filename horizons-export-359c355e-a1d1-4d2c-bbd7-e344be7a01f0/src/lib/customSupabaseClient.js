import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rgbxtafkgvrphinutgln.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnYnh0YWZrZ3ZycGhpbnV0Z2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyODg4MDMsImV4cCI6MjA3OTg2NDgwM30.ul0vjoEAI8JBCipExO7IsigF1nUuCS6kE6Tl6i9Qq2E';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
