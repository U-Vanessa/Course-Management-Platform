const mysql = require('mysql2');
const { exec } = require('child_process');

console.log('🔍 MySQL Connection Diagnostic Tool');
console.log('=====================================\n');

// Step 1: Check if MySQL service is running
console.log('Step 1: Checking MySQL service status...');
exec('sc query MySQL80', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ MySQL80 service not found, trying other service names...');
    exec('sc query mysql', (error2, stdout2, stderr2) => {
      if (error2) {
        console.log('❌ No MySQL service found running');
        console.log('🔧 Try: net start MySQL80');
      } else {
        console.log('✅ MySQL service found:', stdout2.includes('RUNNING') ? 'RUNNING' : 'STOPPED');
      }
    });
  } else {
    console.log('✅ MySQL80 service status:', stdout.includes('RUNNING') ? 'RUNNING' : 'STOPPED');
  }
});

// Step 2: Try to connect to MySQL on different ports
console.log('\nStep 2: Testing MySQL connection on different ports...');
const ports = [3306, 3307, 3308, 33060];
const testPort = (port) => {
  return new Promise((resolve) => {
    const connection = mysql.createConnection({
      host: '127.0.0.1',
      port: port,
      user: 'root',
      password: '',
      connectTimeout: 3000
    });

    connection.connect((err) => {
      if (err) {
        console.log(`❌ Port ${port}: ${err.code === 'ECONNREFUSED' ? 'No MySQL server' : err.message.substring(0, 40) + '...'}`);
        resolve(false);
      } else {
        console.log(`✅ Port ${port}: Connection successful!`);
        connection.end();
        resolve(port);
      }
    });
  });
};

// Test all ports
Promise.all(ports.map(testPort)).then(results => {
  const workingPort = results.find(port => port !== false);
  
  if (workingPort) {
    console.log(`\n🎉 Found working port: ${workingPort}`);
    console.log('\nStep 3: Testing different authentication methods on working port...');
    testAuthentication(workingPort);
  } else {
    console.log('\n❌ No MySQL server found on any common port');
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Start MySQL service: net start MySQL80');
    console.log('2. Check if MySQL is installed: dir "C:\\Program Files\\MySQL"');
    console.log('3. Check Windows services: services.msc');
    console.log('4. Try XAMPP/WAMP if installed');
  }
});

// Test different authentication methods
async function testAuthentication(port) {
  const authMethods = [
    { user: 'root', password: '', desc: 'Root with empty password' },
    { user: 'root', password: 'root', desc: 'Root with "root" password' },
    { user: 'root', password: 'mysql', desc: 'Root with "mysql" password' },
    { user: 'root', password: 'password', desc: 'Root with "password" password' },
    { user: 'root', password: 'Mine@1234', desc: 'Root with "Mine@1234" password' },
    { user: '', password: '', desc: 'Anonymous user' },
  ];

  console.log(`\nTesting authentication methods on port ${port}:`);
  
  for (const method of authMethods) {
    try {
      const success = await testConnection(port, method.user, method.password);
      if (success) {
        console.log(`🎉 SUCCESS: ${method.desc}`);
        console.log(`\n📝 Update your config.json with:`);
        console.log(`   "username": "${method.user}",`);
        console.log(`   "password": "${method.password}",`);
        console.log(`   "port": ${port},`);
        
        // Try to set standard password
        await setStandardPassword(port, method.user, method.password);
        return;
      }
    } catch (err) {
      console.log(`❌ ${method.desc}: ${err.message.substring(0, 40)}...`);
    }
  }
  
  console.log('\n❌ No authentication method worked');
  console.log('\n🔧 MANUAL RESET REQUIRED:');
  console.log('1. Stop MySQL: net stop MySQL80');
  console.log('2. Start in safe mode: mysqld --skip-grant-tables');
  console.log('3. Connect: mysql -u root');
  console.log('4. Reset: ALTER USER \'root\'@\'localhost\' IDENTIFIED BY \'Mine@1234\';');
  console.log('5. Restart: net start MySQL80');
}

function testConnection(port, user, password) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: '127.0.0.1',
      port: port,
      user: user,
      password: password,
      connectTimeout: 3000
    });

    connection.connect((err) => {
      if (err) {
        connection.destroy();
        reject(err);
      } else {
        connection.end();
        resolve(true);
      }
    });
  });
}

async function setStandardPassword(port, currentUser, currentPassword) {
  console.log('\n🔄 Attempting to set standard password...');
  
  try {
    const connection = mysql.createConnection({
      host: '127.0.0.1',
      port: port,
      user: currentUser,
      password: currentPassword
    });

    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise((resolve, reject) => {
      connection.query("ALTER USER 'root'@'localhost' IDENTIFIED BY 'Mine@1234';", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise((resolve, reject) => {
      connection.query('FLUSH PRIVILEGES;', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    connection.end();
    console.log('✅ Password set to "Mine@1234" successfully!');
    console.log('\n🎉 You can now run: npm run db:create');
    
  } catch (err) {
    console.log(`❌ Failed to set standard password: ${err.message}`);
  }
}
