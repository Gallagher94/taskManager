const request = require("supertest");

const app = require("../src/app");
const Task = require("../src/models/task");

const {
  setUpDB,
  userOne,
  userOneId,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  userTwoId
} = require("./fixtures/db");

beforeEach(setUpDB);

test("Should create task for user", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`) // set header
    .send({
      title: "New Title of task",
      completed: false,
      description: "This is a description"
    })
    .expect(201);
  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  // expect(task).toEqual({});
  expect(task.completed).toEqual(false);
});

test("Should fetch all tasks for this user", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`) // set header
    .expect(200);

  expect(response.body.length).toBe(2);
});

test("Should not delete other users tasks", async () => {
  const response = await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`) // set header
    .send()
    .expect(404);

  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});
