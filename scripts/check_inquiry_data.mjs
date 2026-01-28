
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://192.168.123.120:54321';
const supabaseKey = 'eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwODQ3NzY3Nzd9.2LvmxYqOncUTrWJnrrI9j9LMPdLn-5RZUh0O_AeRxgE8zajtm9mRYhE6pEM1OqB7dPwgyzmjyDxdc6tQPCmiBA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInquiry() {
  console.log('Checking all inquiries...');
  const { data, error } = await supabase
    .from('inquiries')
    .select('*');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Found', data.length, 'inquiries.');
    data.forEach(inq => {
      console.log(`ID: ${inq.id}, Name: ${inq.customer_name}, Data Size: ${inq.assessment_data ? Object.keys(inq.assessment_data).length : 0}`);
      if (inq.assessment_data) {
        console.log('Data Keys:', Object.keys(inq.assessment_data));
      }
    });
  }
}

checkInquiry();
