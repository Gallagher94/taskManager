const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
// require("./__mocks__/@sendgrid/mail"); not neded
// when mocking a node modules library if placed in the
// __mocks__ directory then its automatically mocked.
// only need to manully mock if its a user module

const User = require("../../src/models/user");
const Task = require("../../src/models/task");

const userOneId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();

const userOne = {
  _id: userOneId,
  name: "userOne",
  email: "user@one.com",
  password: "userOne123",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }
  ]
};

const userTwo = {
  _id: userTwoId,
  name: "userThree",
  email: "user@three.com",
  password: "userTwo123",
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }
  ]
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: "Task One Description",
  completed: false,
  owner: userOne._id
};

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: "Task Two Description",
  completed: false,
  owner: userTwo._id
};

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: "Task Three Description",
  completed: true,
  owner: userOne._id
};
const setUpDB = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();

  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  setUpDB,
  userOne,
  userOneId,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  userTwoId
};
