const nodemailer = require("nodemailer");

async function sendMessage(usedTemplate, userEmail, subjectEmail) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use TLS connection
    auth: {
      user: "yakashikii@gmail.com",
      pass: "dmza qkxz sjcg wbyi", // Or 'your_regular_gmail_password' if using "Less Secure Apps" (not recommended)
    },
  });

  const mailOptions = {
    from: "yakashikii@gmail.com",
    to: userEmail,
    subject: subjectEmail,
    html: usedTemplate,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

module.exports = sendMessage;
