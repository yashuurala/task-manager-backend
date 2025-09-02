const express = require("express");
const Task = require("../models/Task");
const router = express.Router();

// Create a new task
router.post("/", async (req, res) => {
  try {
    const { title, description, deadline, completed } = req.body;

    const task = new Task({
      title,
      description,
      deadline: new Date(deadline), // ✅ ensure proper Date object
      completed: completed || false,
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ deadline: 1 }); // ✅ sort by nearest deadline
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a task
router.put("/:id", async (req, res) => {
  try {
    const { title, description, deadline, completed } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        deadline: deadline ? new Date(deadline) : undefined, // ✅ convert only if provided
        completed,
      },
      { new: true }
    );

    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a task
router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; // ✅ important
