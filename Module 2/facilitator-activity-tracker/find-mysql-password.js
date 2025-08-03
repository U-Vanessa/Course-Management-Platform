const mysql = require('mysql2');

// Common default passwords to try
const passwords = ['', 'root', 'Mine@1234', 'mysql', 'password', '123456'];

async function testPasswords() {
  console.log('🔍 Testing common MySQL root passwords...\n');
  
  for (const password of passwords) {
    try {
      const connection = mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: password
      });

      await new Promise((resolve, reject) => {
        connection.connect((err) => {
          if (err) {
            console.log(`❌ Password '${password || '(empty)'}': ${err.message}`);
            reject(err);
          } else {
            console.log(`✅ SUCCESS! Password '${password || '(empty)'}' works!`);
            console.log('Connected as id:', connection.threadId);
            resolve();
          }
          connection.end();
        });
      });

      // If we get here, password worked
      console.log(`\n🎉 Found working password: '${password || '(empty)'}'`);
      console.log('\n📝 Update your config.json with this password:');
      console.log(`   "password": "${password}",`);
      break;

    } catch (err) {
      // Continue to next password
      continue;
    }
  }
}

testPasswords().catch(() => {
  console.log('\n❌ None of the common passwords worked.');
  console.log('\n🔧 Next steps:');
  console.log('1. Open MySQL Workbench');
  console.log('2. Try connecting with different passwords');
  console.log('3. Once connected, run: ALTER USER \'root\'@\'localhost\' IDENTIFIED BY \'Mine@1234\';');
  console.log('4. Then run: FLUSH PRIVILEGES;');
});
