import nodemailer from 'nodemailer';
import SiteConfig from './siteconfig';
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

async function sendEmail(to: string, subject: string, text: string) {
  try{
    const siteConfig = await SiteConfig.findOne();
    const senderEmail = siteConfig?.contact?.email || process.env.DEFAULT_SENDER_EMAIL;
    await transporter.sendMail({
      from: "Your App "+ senderEmail,
      replyTo: senderEmail,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export { sendEmail };