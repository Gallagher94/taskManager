const request = require("supertest");

const app = require("../src/app");
const User = require("../src/models/user");
// require("./__mocks__/@sendgrid/mail"); not neded
// when mocking a node modules library if placed in the
// __mocks__ directory then its automatically mocked.
// only need to manully mock if its a user module

const { setUpDB, userOne, userOneId } = require("./fixtures/db");

beforeEach(setUpDB);

test("Should sign up a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({ name: "userTwo", email: "user@two.com", password: "userTwo123" })
    .expect(201);

  const user = await User.findById(response.body.user._id);
  expect(user).not.toEqual(null);
  expect(response.body).toMatchObject({
    user: {
      name: "userTwo",
      email: "user@two.com"
    }
  });
});

test("Should login in existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({ email: userOne.email, password: userOne.password })
    .expect(200);
  const user = await User.findById(userOneId);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test("Should not login non existing user", async () => {
  await request(app)
    .post("/users/login")
    .send({ email: "FakeEmail", password: "FakePassword" })
    .expect(400);
});

test("Should get profile for user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`) // set header
    .send()
    .expect(200);
});

test("Should not get profile for unauthenticated user", async () => {
  await request(app)
    .get("/users/me")
    .send()
    .expect(401);
});

test("Should delete account for user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`) // set header
    .send()
    .expect(200);
  const user = await User.findById(userOneId); //db read is async
  expect(user).toBeNull();
});

test("Should not delete account for unauthenticated user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `wrong secret auth code`) // set header
    .send()
    .expect(401);
});

test("Should upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`) // set header
    .attach("avatar", "tests/fixtures/profile-pic.jpg")
    .expect(200);
  const user = await User.findById(userOne._id);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should update user field", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`) // set header
    .send({ name: "updatedName" })
    .expect(200);

  const user = await User.findById(userOne._id);
  expect(user.name).toBe("updatedName");
});

test("Should not update invalid user field", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`) // set header
    .send({ location: "Jamica" })
    .expect(400);

  const user = await User.findById(userOne._id);
  expect(user.location).toEqual(undefined);
});

/**
 * Difference between ToBe and toEqual
 *
 * You can use toBe for primitives like strings, numbers or booleans.
 * toBe is used to test exact equality
 *
 * If you want to check the value of an object, use toEqual instead:
 * You can use toEqual for everything else.
 */
