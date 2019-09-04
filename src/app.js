const express = require("express");

require("./db/mongoose"); // file runs - mongoose connects to db

const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();

app.use(express.json()); // parse incoming data to be json.
app.use(userRouter); // hook our routers to main application
app.use(taskRouter);

module.exports = app;
