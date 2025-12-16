#!/usr/bin/env node

/**
 * Test Registration Without Gender Requirement
 */

async function testRegistrationWithoutGender() {
  console.log('🧪 Testing Registration Without Gender Requirement...\n');
  
  try {
    const testUser = {
      username: `test_user_${Date.now()}`,
      password: 'testpassword123',
      emailConsent: true
    };
    
    console.log('📝 Test Registration Data:');
    console.log(`   Username: ${testUser.username}`);
    console.log(`   Password: ${testUser.password}`);
    console.log(`   Email Consent: ${testUser.emailConsent}`);
    console.log(`   Gender: Not provided (should be optional)`);
    console.log(`   SMS Consent: Not provided (should be disabled)`);
    
    const response = await fetch('http://localhost:56000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });
    
    const data = await response.json();
    
    console.log('\n📊 Response:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${response.ok}`);
    console.log(`   Message: ${data.message || 'No message'}`);
    
    if (response.ok) {
      console.log('\n✅ Registration successful!');
      console.log(`   User ID: ${data.user?.id || 'Not provided'}`);
      console.log(`   Token: ${data.token ? 'Provided' : 'Not provided'}`);
    } else {
      console.log('\n❌ Registration failed:');
      console.log(`   Error: ${data.message || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRegistrationWithoutGender().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
