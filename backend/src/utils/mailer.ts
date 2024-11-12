import nodemailer from 'nodemailer';
import SiteConfig from '../models/siteconfig';
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

async function sendEmail(to: string, subject: string, text: string, html: string, attachments?: any[]) {
  try{
    const siteConfig = await SiteConfig.findOne();
    const senderEmail = siteConfig?.contact?.email || process.env.DEFAULT_SENDER_EMAIL;
    await transporter.sendMail({
      from: "ByteNosh "+ senderEmail,
      replyTo: senderEmail,
      to,
      subject,
      text,
      html,
      attachments
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export { sendEmail };