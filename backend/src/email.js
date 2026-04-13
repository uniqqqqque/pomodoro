const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendWelcomeEmail(email, username) {
  await transporter.sendMail({
    from: `Pomodoro <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to Pomodoro!",
    html: `<h1>Welcome, ${username}!</h1><p>Your account has been created successfully.</p>`,
  });
}

async function sendPasswordResetEmail(email, resetToken) {
  await transporter.sendMail({
    from: `Pomodoro <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset",
    html: `<h1>Password Reset</h1><p>Click the link to reset your password:</p><a href="https://pomodoro.poliscuks.id.lv/reset-password.html?token=${resetToken}">Reset Password</a><p>Link expires in 1 hour.</p>`,
  });
}

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };
