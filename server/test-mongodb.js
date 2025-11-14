import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing MongoDB Connection...\n');
console.log('Using URI:', process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@')); // Hide password

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000 // 10 second timeout
})
  .then(() => {
    console.log('\n✅ MongoDB Atlas Connected Successfully!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    process.exit(0);
  })
  .catch(err => {
    console.log('\n❌ MongoDB Connection Failed!');
    console.error('Error:', err.message);
    console.error('\nPossible fixes:');
    console.error('1. Check if your IP is whitelisted in MongoDB Atlas');
    console.error('   - Go to Network Access in Atlas');
    console.error('   - Click "Add IP Address"');
    console.error('   - Choose "Allow Access from Anywhere" (0.0.0.0/0)');
    console.error('2. Verify connection string is correct');
    console.error('3. Check if database user has proper permissions\n');
    process.exit(1);
  });
