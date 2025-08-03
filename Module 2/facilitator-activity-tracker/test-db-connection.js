const mysql = require('mysql2');

// Test connection with current credentials
const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'Mine@1234'
});

console.log('Testing MySQL connection...');

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    console.error('Error Code:', err.code);
    console.error('SQL State:', err.sqlState);
    
    // Provide troubleshooting suggestions
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 Possible solutions:');
      console.log('1. Password might be incorrect');
      console.log('2. User might not exist or lack privileges');
      console.log('3. Host restrictions might apply');
      console.log('\n📝 Try these commands in MySQL Workbench or phpMyAdmin:');
      console.log("   ALTER USER 'root'@'localhost' IDENTIFIED BY 'Mine@1234';");
      console.log("   FLUSH PRIVILEGES;");
    }
  } else {
    console.log('✅ Connection successful!');
    console.log('Connected as id:', connection.threadId);
    
    // Test creating database
    connection.query('CREATE DATABASE IF NOT EXISTS fat_development', (err, results) => {
      if (err) {
        console.error('❌ Database creation failed:', err.message);
      } else {
        console.log('✅ Database creation successful (or already exists)');
      }
      connection.end();
    });
  }
});
