const mysql = require('mysql2');

// Test connecting to the Module 1 database to see if it works
const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'Mine@1234',
  database: 'course_management_db_dev' // Module 1 database
});

console.log('Testing connection to Module 1 database...');

connection.connect((err) => {
  if (err) {
    console.error('❌ Cannot connect to Module 1 database either:', err.message);
    console.log('\n🔧 Solution: Create a new MySQL user for this project');
    console.log('In MySQL Workbench or phpMyAdmin, run:');
    console.log("   CREATE USER 'fat_user'@'localhost' IDENTIFIED BY 'fat_password';");
    console.log("   GRANT ALL PRIVILEGES ON *.* TO 'fat_user'@'localhost';");
    console.log("   FLUSH PRIVILEGES;");
  } else {
    console.log('✅ Module 1 database connection works!');
    console.log('We can create the FAT database in the same MySQL instance.');
    
    // Try to create the FAT database
    connection.query('CREATE DATABASE IF NOT EXISTS fat_development', (err, results) => {
      if (err) {
        console.error('❌ Failed to create FAT database:', err.message);
      } else {
        console.log('✅ FAT database created successfully!');
        console.log('\n🎉 You can now run: npm run db:migrate');
      }
      connection.end();
    });
  }
});
