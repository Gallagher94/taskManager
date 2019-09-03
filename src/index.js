const express = require("express");

require("./db/mongoose"); // file runs - mongoose connects to db

const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();
const port = process.env.PORT;

app.use(express.json()); // parse incoming data to be json.
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log("Server listneing on port ", port);
});
