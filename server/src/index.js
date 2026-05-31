require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  }),
);

async function connectoToDatabase() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("MongoDB URI not defined");
    }

    await mongoose.connect(uri);
    console.log("MongoDB connection established");

  // START THE SERVER
  if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT; // port 5000 creates some problems with macOS's Control Center
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
      console.log(
        `View swagger interface at http://localhost:${PORT}/api-docs`,
      );
    });
  }
    // Register routes AFTER DB is ready
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/auth', require('./routes/structureLoginRoutes'));
    app.use('/api/structures', require('./routes/structuresRoutes'));
    app.use('/api/user', require('./routes/usersRoutes'));
    app.use('/api/trails', require('./routes/trailsRoutes'));
    app.use('/api/planning', require('./routes/planningRoutes'));
    app.use('/api/pis', require('./routes/pisRoutes'));

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
        console.log(`View swagger interface at http://localhost:${PORT}/api-docs`);
    });
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/structures', require('./routes/structuresRoutes'));
app.use('/api/user', require('./routes/usersRoutes'));
app.use('/api/trails', require('./routes/trailsRoutes'));
app.use('/api/auth', require('./routes/structureLoginRoutes'));
app.use('/api/planning', require('./routes/planningRoutes'));
app.use('/api/pis', require('./routes/pisRoutes'));
connectoToDatabase().catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/structures", require("./routes/structuresRoutes"));
app.use("/api/user", require("./routes/usersRoutes"));
app.use("/api/trails", require("./routes/trailsRoutes"));
app.use("/api/auth", require("./routes/structureLoginRoutes"));
app.use("/api/planning", require("./routes/planningRoutes"));
app.use("/api/pis", require("./routes/pisRoutes"));
app.use("/api/managedStructure", require("./routes/managedStructureRoutes"));
app.use("/api/favourites", require("./routes/favouritesRoutes"));
app.use("/api/structures", require("./routes/eventsRoutes"));
app.use("/api/structures", require("./routes/announcementsRoutes"));
app.use("/api/reports", require("./routes/reportsRoutes"));

module.exports = app;
