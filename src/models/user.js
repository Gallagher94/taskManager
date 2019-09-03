const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Task = require("./task");
// we have created the userSchema so we can apply middlewares -lecture 104
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercare: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      }
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be greater than 0");
        }
      }
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (value.length < 6) {
          throw new Error("Not Enough characters in this password");
        }
        if (value.toLowerCase().includes("password")) {
          throw new Error(
            "Do not include the string 'password' within the password"
          );
        }
      }
    },
    tokens: [
      {
        token: { type: String, required: true }
      }
    ],
    avatar: { type: Buffer }
  },
  { timestamps: true }
);

// virtual data - relatiship between two documents find what user created what task
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner"
});

userSchema.methods.generateAuthToken = async function() {
  const user = this; // not needed but makes things easier to read
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  user.save();
  return token;
};

//toJSON
userSchema.methods.toJSON = function() {
  const user = this;

  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

// we can access on user model as static function
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("No user found, unable to log in");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Not a match, unable to log in");
  }
  return user;
};

/*
Mongoose supports mongoose middleware
register a function to run befroe or after an event ocurs

middleware for Hashing plain text password before saving to db

in js when we call ..save() this function is called
as this save() is saving to the DB so this runs before the data is saved
 */

userSchema.pre("save", async function(next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// delete user tasks when user is deleted
userSchema.pre("remove", async function(next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
