import nodemailer from "nodemailer";
import Bull from "bull";
const emailQueue = new Bull("emails", {
  redis: {
    port: 31909,
    host: "roundhouse.proxy.rlwy.net",
    password: "3HomEKhaahcf3mFDf1i3lFObj4GJEMel",
  },
});

async function sendEmail(email, subject, content) {
  emailQueue.add({ to: email, subject: subject, body: content });
}

emailQueue.process(async (job) => {
  const { to, subject, body } = job.data;
  const transporter = nodemailer.createTransport({
    host: "smtp.titan.email",
    port: 465,
    secure: true,
    auth: {
      user: "noreply@faindit.fi",
      pass: "EEvertVaavert9999___!",
    },
  });

  console.log("sending email");

  await transporter.sendMail({
    from: '"FAINDI" <noreply@faindit.fi>',
    to: to,
    subject: "Faindi: " + subject,
    text: body,
  });

  console.log("sent email");
});

export { sendEmail };
