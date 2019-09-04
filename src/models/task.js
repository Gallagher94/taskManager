const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: false, trim: true },
    completed: { type: Boolean, default: false },
    description: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (value.length < 1) {
          throw new Error("Please provide a good description");
        }
      }
    },
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
