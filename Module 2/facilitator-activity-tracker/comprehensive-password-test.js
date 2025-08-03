const mysql = require('mysql2');

// Extended list of common MySQL passwords to try
const passwords = [
  '', // Empty password
  'root',
  'mysql',
  'password',
  'admin',
  '123456',
  'Mine@1234',
  'password123',
  'admin123',
  'root123',
  'mysql123',
  '12345678',
  'qwerty',
  'test',
  'user'
];

async function findWorkingPassword() {
  console.log('🔍 Testing MySQL root passwords systematically...\n');
  
  for (let i = 0; i < passwords.length; i++) {
    const password = passwords[i];
    console.log(`Testing ${i + 1}/${passwords.length}: "${password || '(empty)'}"`);
    
    try {
      await testConnection(password);
      console.log(`\n🎉 SUCCESS! Working password found: "${password || '(empty)'}"`);
      console.log('\n📝 Next steps:');
      console.log('1. Update your config.json with this password');
      console.log('2. Or standardize it to "Mine@1234" using this command in MySQL:');
      console.log(`   ALTER USER 'root'@'localhost' IDENTIFIED BY 'Mine@1234';`);
      return password;
    } catch (err) {
      console.log(`   ❌ Failed: ${err.message.substring(0, 50)}...`);
    }
  }
  
  console.log('\n❌ None of the common passwords worked.');
  console.log('\n🔧 Advanced troubleshooting needed - see suggestions below.');
  return null;
}

function testConnection(password) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: password,
      timeout: 5000
    });

    connection.connect((err) => {
      if (err) {
        connection.destroy();
        reject(err);
      } else {
        console.log(`   ✅ Connected! Thread ID: ${connection.threadId}`);
        connection.end();
        resolve();
      }
    });
  });
}

findWorkingPassword().then((workingPassword) => {
  if (!workingPassword && workingPassword !== '') {
    console.log('\n🆘 ADVANCED SOLUTIONS:');
    console.log('\n1. **Reset MySQL Root Password (Safe Mode):**');
    console.log('   - Stop MySQL service: net stop MySQL80');
    console.log('   - Start in safe mode: mysqld --skip-grant-tables');
    console.log('   - Connect: mysql -u root');
    console.log('   - Reset: ALTER USER \'root\'@\'localhost\' IDENTIFIED BY \'Mine@1234\';');
    console.log('   - Restart: net start MySQL80');
    console.log('\n2. **Check MySQL Installation Type:**');
    console.log('   - XAMPP: Password might be empty or "xampp"');
    console.log('   - WAMP: Password might be empty or "wamp"');
    console.log('   - Standalone: Check installation notes');
    console.log('\n3. **Create New Admin User:**');
    console.log('   - If you can access MySQL as any user, create new admin');
    console.log('   - Use phpMyAdmin or MySQL Workbench with different credentials');
  }
});
