const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  // Configure your email service here
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.submitContactForm = catchAsync(async (req, res, next) => {
  const { name, email, subject, message } = req.body;

  // Validate input
  if (!name || !email || !subject || !message) {
    return next(new AppError('Please provide all required fields', 400));
  }

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  // Configure email content
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: process.env.ADMIN_EMAIL,
    subject: `New Contact Form Submission: ${subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `
  };

  // Send email
  await transporter.sendMail(mailOptions);

  // Send auto-reply to user
  const autoReplyOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Thank you for contacting us',
    html: `
      <h2>Thank you for reaching out!</h2>
      <p>Dear ${name},</p>
      <p>We have received your message and will get back to you as soon as possible.</p>
      <p>Best regards,<br>Your Team</p>
    `
  };

  await transporter.sendMail(autoReplyOptions);

  res.status(200).json({
    status: 'success',
    message: 'Your message has been sent successfully!'
  });
});