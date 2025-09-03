const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Task = require("./models/Task");
require("dotenv").config();

// setup mail transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// helper function
function minutesUntil(date) {
  return Math.floor((new Date(date).getTime() - Date.now()) / 60000);
}

// cron job: runs every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("🔔 Checking for upcoming tasks...");
  try {
    const soon = new Date(Date.now() + 60 * 60 * 1000); // within next 60 min
    const tasks = await Task.find({
      completed: false,
      deadline: { $lte: soon },
      reminded: { $ne: true },
    });

    for (const task of tasks) {
      const mins = minutesUntil(task.deadline);
      if (mins <= 30 && mins >= 0) {
        // ✅ format deadline in IST (or your local timezone)
        const formattedDeadline = new Date(task.deadline).toLocaleString("en-IN", {
          dateStyle: "short",
          timeStyle: "short",
          hour12: true,
        });

        await transporter.sendMail({
          from: `"Cloud Task Manager" <${process.env.SMTP_USER}>`,
          to: process.env.REMIND_TO,
          subject: `Reminder: ${task.title} (due in ${mins} min)`,
          text: `Heads up! "${task.title}" is due at ${formattedDeadline}.`,
        });

        task.reminded = true;
        await task.save();
        console.log(`📧 Reminder sent for: ${task.title}`);
      }
    }
  } catch (err) {
    console.error("❌ Reminder job failed:", err.message);
  }
});
