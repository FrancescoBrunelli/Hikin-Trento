
require('dotenv').config();
const express = require('express');
const mongoose = require ('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

app.use(express.json()); // Allows the server to accept data from frontend




async function connectoToDatabase() {
  const uri = process.env.MONGODB_URI;

  if(!uri) {
    throw new Error("MongoDB URI not defined")
  }

  await mongoose.connect(uri);
  console.log("MongoDB connection established")

  // START THE SERVER
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`View swagger interface at http://localhost:${PORT}/api-docs`);
  });

  
}

connectoToDatabase();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/structures', require('./routes/structuresRoutes'));



module.exports = connectoToDatabase;



//const { MongoClient } = require('mongodb');
//const uri = process.env.MONGODB_URI;
//const client = new MongoClient(uri);

/*
let db;
async function runServer() {
  try {
    await client.connect();
    db = client.db(); // Uses the DB name from .env string
    console.log("Connected to HikinTrento Cluster!");

    // START THE SERVER
    const PORT = 5000;
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("Failed to connect:", err);
  }
}

runServer();

*/

// ROUTE: Get all trails
/*
app.get('/api/trails', async (req, res) => {
  const trails = await db.collection('trails').find().toArray();
  res.json(trails);
});
*/

// ROUTE: Add a new trail (This replaces the need for your "first" script)
/*
app.post('/api/trails', async (req, res) => {
  try {
    const result = await db.collection('trails').insertOne(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to add trail" });
  }
});

const loginRoutes = require('./routes/loginRoutes');
app.use('/api/auth', loginRoutes);
//runServer();



//const mongoose = require("mongoose")

async function connectoToDatabase() {
  const uri = process.env.MONGODB_URI;

  if(!uri) {
    throw new Error("MongoDB URI not defined")
  }

  await mongoose.connect(uri);
  console.log("MongoDB connection established")

  // START THE SERVER
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });

  
}

connectoToDatabase();

module.exports = connectoToDatabase;
*/