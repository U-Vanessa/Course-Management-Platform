const mysql = require('mysql2');

// Test different authentication methods
const authMethods = [
  {
    name: 'Windows Authentication (no password)',
    config: {
      host: '127.0.0.1',
      port: 3306,
      user: process.env.USERNAME || 'Administrator', // Windows username
      password: ''
    }
  },
  {
    name: 'Windows Authentication (with domain)',
    config: {
      host: '127.0.0.1',
      port: 3306,
      user: `${process.env.USERDOMAIN || 'localhost'}\\${process.env.USERNAME || 'Administrator'}`,
      password: ''
    }
  },
  {
    name: 'MySQL Native Authentication',
    config: {
      host: '127.0.0.1',
      port: 3306,
      user: 'mysql.infoschema',
      password: ''
    }
  },
  {
    name: 'Default MySQL User',
    config: {
      host: '127.0.0.1',
      port: 3306,
      user: 'mysql.sys',
      password: ''
    }
  }
];

async function testAlternativeAuth() {
  console.log('🔍 Testing alternative MySQL authentication methods...\n');
  console.log(`Current Windows User: ${process.env.USERNAME}`);
  console.log(`Current Domain: ${process.env.USERDOMAIN || 'localhost'}\n`);
  
  for (let i = 0; i < authMethods.length; i++) {
    const method = authMethods[i];
    console.log(`Testing ${i + 1}/${authMethods.length}: ${method.name}`);
    console.log(`  User: "${method.config.user}"`);
    
    try {
      await testConnection(method.config);
      console.log(`\n🎉 SUCCESS with ${method.name}!`);
      console.log('\n📝 Update your config.json with these settings:');
      console.log(`   "username": "${method.config.user}",`);
      console.log(`   "password": "${method.config.password}",`);
      return method.config;
    } catch (err) {
      console.log(`   ❌ Failed: ${err.message.substring(0, 50)}...`);
    }
  }
  
  return null;
}

function testConnection(config) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(config);

    connection.connect((err) => {
      if (err) {
        connection.destroy();
        reject(err);
      } else {
        console.log(`   ✅ Connected! Thread ID: ${connection.threadId}`);
        
        // Test if we can see databases
        connection.query('SHOW DATABASES', (err, results) => {
          if (err) {
            console.log(`   ⚠️  Connected but limited access: ${err.message}`);
          } else {
            console.log(`   ✅ Full access - can see ${results.length} databases`);
          }
          connection.end();
          resolve();
        });
      }
    });
  });
}

testAlternativeAuth().then((workingConfig) => {
  if (!workingConfig) {
    console.log('\n❌ No alternative authentication methods worked.');
    console.log('\n🔧 RECOMMENDED NEXT STEPS:');
    console.log('\n1. **Run the password reset script:**');
    console.log('   .\\reset-mysql-root-password.bat');
    console.log('\n2. **Check MySQL installation method:**');
    console.log('   - Was MySQL installed standalone?');
    console.log('   - Part of XAMPP/WAMP?');
    console.log('   - Using MySQL Installer?');
    console.log('\n3. **Manual password reset:**');
    console.log('   - Stop MySQL service');
    console.log('   - Start with --skip-grant-tables');
    console.log('   - Connect and reset password');
    console.log('   - Restart normally');
    console.log('\n4. **Contact system administrator if on managed system');
  }
});
