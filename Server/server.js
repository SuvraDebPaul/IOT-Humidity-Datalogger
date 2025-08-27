require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/api/temperature", require("./routes/temperatureRoutes"));
app.use("/api/humidity", require("./routes/humidityRoutes"));
app.use("/api/config", require("./routes/configRoutes"));

// Start server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
