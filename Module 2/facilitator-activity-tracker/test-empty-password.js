const mysql = require('mysql2');

console.log('Testing empty password for root user...');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '' // Empty password
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Empty password failed:', err.message);
    console.log('\n🔧 Next: Try the password reset script or check installation notes');
  } else {
    console.log('🎉 SUCCESS! Empty password works!');
    console.log('Connected as id:', connection.threadId);
    
    // Set the password to our desired one
    console.log('\n🔄 Setting password to "Mine@1234"...');
    connection.query("ALTER USER 'root'@'localhost' IDENTIFIED BY 'Mine@1234';", (err) => {
      if (err) {
        console.error('❌ Failed to set password:', err.message);
      } else {
        console.log('✅ Password updated successfully!');
        
        connection.query('FLUSH PRIVILEGES;', (err) => {
          if (err) {
            console.error('❌ Failed to flush privileges:', err.message);
          } else {
            console.log('✅ Privileges flushed!');
            console.log('\n🎉 You can now use password "Mine@1234" for root user');
            console.log('\nNext steps:');
            console.log('1. npm run db:create');
            console.log('2. npm run db:migrate');
            console.log('3. npm run db:seed');
          }
          connection.end();
        });
      }
    });
  }
});
