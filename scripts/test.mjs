import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uwaskoziwgwisfmtjomv.supabase.co';
const supabaseKey = 'sb_publishable_PpSzBTdNnW1BjINPC7ZlOw_IfHLiWGz';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  const { data, error } = await supabase.from('universities').select('*');
  console.log('Data:', data);
  console.log('Error:', error);
}

testQuery();
