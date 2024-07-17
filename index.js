const express = require("express");
const corsMiddleware = require("./cors");
const userRoutes = require("./app/routes/userRoute");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(corsMiddleware); // Use CORS middleware
app.use(express.json());
app.use("/api", userRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
