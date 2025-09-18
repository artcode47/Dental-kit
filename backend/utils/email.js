const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

// Debug email configuration
console.log('Email Configuration:');
console.log('Service:', process.env.EMAIL_SERVICE);
console.log('User:', process.env.EMAIL_USER);
console.log('From:', process.env.EMAIL_FROM);
console.log('Pass configured:', !!process.env.EMAIL_PASS);

// Check if email configuration is complete
const isEmailConfigured = process.env.EMAIL_SERVICE && 
                         process.env.EMAIL_USER && 
                         process.env.EMAIL_PASS && 
                         process.env.EMAIL_FROM;

if (!isEmailConfigured) {
  console.warn('⚠️  Email configuration is incomplete. Email sending will fail.');
  console.warn('Required environment variables: EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS, EMAIL_FROM');
}

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Email transporter verification failed:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

function renderTemplate(templateName, context) {
  try {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.hbs`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Email template not found: ${templatePath}`);
    }
    
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);
    return template(context);
  } catch (error) {
    console.error('Template rendering error:', error);
    // Return a simple fallback template
    return `
      <html>
        <body>
          <h2>Email Verification</h2>
          <p>Hello ${context.firstName || 'User'},</p>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${context.verifyUrl}">Verify Email</a>
          <p>If the link doesn't work, copy and paste this URL into your browser:</p>
          <p>${context.verifyUrl}</p>
          <p>Best regards,<br>Dental Kit Store Team</p>
        </body>
      </html>
    `;
  }
}

async function sendEmail({ to, subject, template, context }) {
  try {
    console.log('📧 Attempting to send email to:', to);
    console.log('📧 Email subject:', subject);
    console.log('📧 Email template:', template);
    
    if (!isEmailConfigured) {
      throw new Error('Email configuration is incomplete. Please check your environment variables.');
    }
    
    const html = renderTemplate(template, context);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Email sending failed with details:', {
      code: error.code,
      response: error.response,
      responseCode: error.responseCode,
      command: error.command,
      message: error.message
    });
    throw error;
  }
}

module.exports = sendEmail; 