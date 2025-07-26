const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function renderTemplate(templateName, context) {
  const templatePath = path.join(__dirname, '../templates', `${templateName}.hbs`);
  const source = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(source);
  return template(context);
}

async function sendEmail({ to, subject, template, context }) {
  const html = renderTemplate(template, context);
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail; 