const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./app/routes/userRoute");
require("dotenv").config();
const db = require("./database");

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use("/api", userRoutes);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Bad Request" });
  }
  next();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
