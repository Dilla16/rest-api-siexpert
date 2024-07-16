const express = require("express");
const userRoutes = require("./app/routes/userRoute");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", userRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
