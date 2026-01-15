const express = require("express");
const cors = require("cors");
const { infoLogger, errorLogger } = require("./middleware/logger");


const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

app.use(cors());

app.use(infoLogger);
app.use(errorLogger);
app.use(express.json());

app.use("/auth",authRoutes);
app.use("/tasks",taskRoutes);
app.use("/users", userRoutes); 

module.exports = app;