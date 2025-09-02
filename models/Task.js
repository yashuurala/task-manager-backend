const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    default: "No description provided",
  },
  deadline: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value > new Date();
      },
      message: "Deadline must be in the future",
    },
  },
  completed: {
    type: Boolean,
    default: false,
  },
  reminded: {
    type: Boolean,
    default: false, // helps track if a reminder email was already sent
  },
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
