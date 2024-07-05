const express = require("express");
const app = express();
require("dotenv").config();

const userRoutes = require("./app/routes/userRoutes");

app.use(express.json());
app.use("/api/users", userRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
