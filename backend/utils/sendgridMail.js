import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendOtpMailSendGrid = async (to, otp) => {
  try {
    console.log(`Sending OTP email via SendGrid to ${to}`);
    
    const msg = {
      to: to, 
      from: process.env.EMAIL || 'priydarshiadarsh3@gmail.com', 
      subject: 'Reset Your Password - Vingo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff4d2d;">Password Reset OTP</h2>
          <p>Your OTP for password reset is:</p>
          <h1 style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 5px;">
            ${otp}
          </h1>
          <p style="color: #666;">This OTP will expire in <strong>5 minutes</strong>.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    const response = await sgMail.send(msg);
    console.log('OTP email sent successfully via SendGrid:', response[0].statusCode);
    return response;
  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error.message);
    throw error;
  }
};

export const sendDeliveryOtpMailSendGrid = async (user, otp) => {
  try {
    console.log(`Sending delivery OTP email via SendGrid to ${user.email}`);
    
    const msg = {
      to: user.email, 
      from: process.env.EMAIL || 'priydarshiadarsh3@gmail.com',
      subject: 'Delivery OTP - Vingo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff4d2d;">Delivery Verification OTP</h2>
          <p>Hello <strong>${user.fullName}</strong>,</p>
          <p>Your delivery person has arrived! Please share this OTP to confirm delivery:</p>
          <h1 style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 5px;">
            ${otp}
          </h1>
          <p style="color: #666;">This OTP will expire in <strong>5 minutes</strong>.</p>
          <p style="color: #999; font-size: 12px;">Thank you for ordering with Vingo!</p>
        </div>
      `,
    };

    const response = await sgMail.send(msg);
    console.log('Delivery OTP email sent successfully via SendGrid:', response[0].statusCode);
    return response;
  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error.message);
    throw error;
  }
};
