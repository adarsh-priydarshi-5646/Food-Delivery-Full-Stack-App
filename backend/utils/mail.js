import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, 
  secure: false, 
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
  tls: {
    rejectUnauthorized: false 
  },
  connectionTimeout: 30000, 
  greetingTimeout: 10000,
  socketTimeout: 30000,
});

export const sendOtpMail = async (to, otp) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject: "Reset Your Password",
      html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`,
    });
    console.log("OTP Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};

export const sendDeliveryOtpMail = async (user, otp) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Delivery OTP",
      html: `<p>Your OTP for delivery is <b>${otp}</b>. It expires in 5 minutes.</p>`,
    });
    console.log("Delivery OTP Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending delivery OTP email:", error);
    throw error;
  }
};
