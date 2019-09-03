const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "ruairidhgallaghers3@gmail.com",
    subject: "Task Manager Application",
    text: `${name} you are now using the task manager app.`
  });
};

const sendDeletionEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "ruairidhgallaghers3@gmail.com",
    subject: "Task Manager Application",
    text: `Goodbye ${name}`
  });
};

module.exports = { sendWelcomeEmail, sendDeletionEmail };
