require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  
  await db.collection('structures').updateMany({}, { $set: { type: 'structure' } });
  console.log('structures updated');
  
  await db.collection('trails').updateMany({}, { $set: { type: 'trail' } });
  console.log('trails updated');
  
  mongoose.disconnect();
});