const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const User = require("../models/user");
const auth = require("../middleware/auth");
const { sendWelcomeEmail, sendDeletionEmail } = require("../emails/account");

const router = new express.Router();

router.post("/users", async (req, res) => {
  const user = new User(req.body);

  //surround await calls with try catch
  try {
    await user.save(); // save called so mongoose middleware is called
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken(); // method on instacne and not on super class.
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken(); // method on instacne and not on super class.

    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.user.save(); // remove called so mongoose middleware is called
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

// middelware added.
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.get("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedToUpdate = ["name", "email", "password", "age"];
  let isValidOp = updates.every(update => allowedToUpdate.includes(update));

  if (!isValidOp) {
    return res.status(400).send({ error: "Invalid updates" });
  }

  try {
    updates.forEach(update => (req.user[update] = req.body[update]));
    //computed value for dynamic update

    await req.user.save();

    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove(); // remove called so mongoose middleware is called
    sendDeletionEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("File must be of corect type, should be an image"));
    }
    cb(undefined, true);
  }
});

//image uploads
router.post(
  "/users/me/avatar",
  auth, //middlware
  upload.single("avatar"), //middleware
  async (req, res) => {
    // req.user.avatar = req.file.buffer;
    const buffer = await sharp(req.file.buffer)
      .png()
      .resize({ width: 250, height: 250 })
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
