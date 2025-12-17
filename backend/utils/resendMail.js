import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpMailResend = async (to, otp) => {
  try {
    console.log(`Sending OTP email via Resend to ${to}`);
    
    
    
    const recipientEmail = process.env.EMAIL || 'adarshpriydarshi5646@gmail.com';
    
    const { data, error } = await resend.emails.send({
      from: 'Vingo Food Delivery <onboarding@resend.dev>', 
      to: [recipientEmail], 
      subject: `Reset Your Password - Vingo (OTP for ${to})`,
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
    });

    if (error) {
      console.error('Resend email error:', error);
      throw error;
    }

    console.log('OTP email sent successfully via Resend:', data.id);
    return data;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw error;
  }
};

export const sendDeliveryOtpMailResend = async (user, otp) => {
  try {
    console.log(`Sending delivery OTP email via Resend to ${user.email}`);
    
    
    const recipientEmail = process.env.EMAIL || 'adarshpriydarshi5646@gmail.com';
    
    const { data, error } = await resend.emails.send({
      from: 'Vingo Food Delivery <onboarding@resend.dev>',
      to: [recipientEmail], 
      subject: `Delivery OTP - Vingo (for ${user.fullName})`,
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
    });

    if (error) {
      console.error('Resend email error:', error);
      throw error;
    }

    console.log('Delivery OTP email sent successfully via Resend:', data.id);
    return data;
  } catch (error) {
    console.error('Failed to send delivery OTP email:', error);
    throw error;
  }
};
