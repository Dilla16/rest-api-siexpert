const express = require("express");
const cors = require("cors");
const userRoutes = require("./app/routes/userRoute");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use("/api", userRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
