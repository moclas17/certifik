const bcrypt = require('bcrypt');

const saltRounds = 10; 
const myPlaintextPassword = 'adminpassword'; // Replace with the password you want to hash

bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Hashed Password:', hash);
  // You can now use this hash to manually update your database
});
