const express = require("express");
const app = express();
const userRoutes = require("./app/routes/userRoute");
const sequelize = require("./database");
require("dotenv").config();

app.use(express.json());
app.use("/api", userRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log("Database connected!");
    await sequelize.sync();
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
