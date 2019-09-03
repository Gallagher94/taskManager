const express = require("express");

const Task = require("../models/task");
const auth = require("../middleware/auth");

const router = new express.Router();

router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// GET /tasks?completed=false || /tasks?completed=true
// limit skip used for pagination
// GET /tasks?limit=10&skip=10
// set 10 results per page
// skip first 10 results i.e 1 full page skipped.
//
// GET /tasks?sortBy=createdAt_asc
// GET /tasks?sortBy=createdAt_desc
//{{url}}/tasks?completed=false&limit=1&skip=1&sortBy=createdAt_asc
router.get("/tasks", auth, async (req, res) => {
  try {
    const match = {};
    const sort = {};

    match.owner = req.user._id;

    if (req.query.completed) {
      match.completed = req.query.completed === "true";
    }
    //because it comes in as a string in db its boolean

    const limitValue = req.query.limit;
    const skipValue = req.query.skip;

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split("_");
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }

    const tasks = await Task.find(match)
      .limit(parseInt(limitValue))
      .skip(parseInt(skipValue))
      .sort(sort);

    res.send(tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id }); //task i created

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (e) {
    res.status(500).send(error);
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedToUpdate = ["completed", "title"];
  let isValidOp = updates.every(update => allowedToUpdate.includes(update));

  if (!isValidOp) {
    return res.status(400).send({ error: "Invalid updates" });
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    await task.save();

    if (!task) {
      return res.status(404).send();
    }
    updates.forEach(update => (task[update] = req.body[update]));

    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    console.log("req.params.id ", req.params.id);
    console.log("req.user._id ", req.user._id);
    console.log("task ", task);
    if (!task) {
      return res.status(404).send("NOT found");
    }

    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
