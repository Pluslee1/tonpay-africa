import axios from 'axios';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@tonpayafrica.com';

const sendEmailViaSendGrid = async (to, subject, html, text) => {
  if (!SENDGRID_API_KEY) {
    console.log('SendGrid not configured, skipping email to:', to);
    return { success: false, error: 'SendGrid not configured' };
  }

  try {
    await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: FROM_EMAIL, name: 'TONPay Africa' },
        subject,
        content: [
          { type: 'text/plain', value: text || subject },
          { type: 'text/html', value: html || text }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

const sendSMSViaTwilio = async (to, message) => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.log('Twilio not configured, skipping SMS to:', to);
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    
    await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      new URLSearchParams({
        To: to,
        From: TWILIO_PHONE_NUMBER,
        Body: message
      }),
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return { success: true };
  } catch (error) {
    console.error('Twilio error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to TONPay Africa! 🎉';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Welcome to TONPay Africa!</h1>
      <p>Hi ${user.profile?.firstName || 'there'},</p>
      <p>Thank you for joining TONPay Africa. Your account has been successfully created.</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Your Referral Code:</strong> ${user.referral?.code}</p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">Share this code with friends and earn rewards!</p>
      </div>
      <p>Get started by:</p>
      <ul>
        <li>Connecting your TON wallet</li>
        <li>Completing KYC verification for higher limits</li>
        <li>Making your first transaction</li>
      </ul>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br>The TONPay Africa Team</p>
    </div>
  `;
  
  return await sendEmailViaSendGrid(user.email, subject, html);
};

export const sendTransactionNotification = async (user, transaction) => {
  const typeLabels = {
    airtime: 'Airtime Purchase',
    data: 'Data Purchase',
    payout: 'Bank Transfer',
    gift: 'Gift Conversion'
  };

  const subject = `Transaction ${transaction.status}: ${typeLabels[transaction.type] || transaction.type}`;
  const statusEmoji = transaction.status === 'completed' ? '✅' : transaction.status === 'failed' ? '❌' : '⏳';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">${statusEmoji} Transaction ${transaction.status}</h1>
      <p>Hi ${user.profile?.firstName || 'there'},</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Type:</strong> ${typeLabels[transaction.type] || transaction.type}</p>
        <p style="margin: 10px 0 0 0;"><strong>Amount:</strong> ${transaction.amountTON} TON (₦${transaction.amountNGN?.toLocaleString()})</p>
        ${transaction.fee ? `<p style="margin: 10px 0 0 0;"><strong>Fee:</strong> ₦${transaction.fee.toLocaleString()}</p>` : ''}
        <p style="margin: 10px 0 0 0;"><strong>Status:</strong> ${transaction.status}</p>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">Transaction ID: ${transaction._id}</p>
      </div>
      <p>Thank you for using TONPay Africa!</p>
    </div>
  `;

  const smsMessage = `TONPay: ${statusEmoji} ${typeLabels[transaction.type]} ${transaction.status}. Amount: ${transaction.amountTON} TON (₦${transaction.amountNGN?.toLocaleString()})`;

  const promises = [];
  
  if (user.email && user.preferences?.notifications?.email) {
    promises.push(sendEmailViaSendGrid(user.email, subject, html));
  }
  
  if (user.phone && user.preferences?.notifications?.sms) {
    promises.push(sendSMSViaTwilio(user.phone, smsMessage));
  }

  await Promise.allSettled(promises);
};

export const sendKYCStatusEmail = async (user, status) => {
  const subject = `KYC Verification ${status === 'verified' ? 'Approved' : 'Update'}`;
  const statusEmoji = status === 'verified' ? '✅' : status === 'rejected' ? '❌' : '⏳';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">${statusEmoji} KYC ${status}</h1>
      <p>Hi ${user.profile?.firstName || 'there'},</p>
      <p>Your KYC verification status has been updated to: <strong>${status}</strong></p>
      ${status === 'verified' ? `
        <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;">🎉 Congratulations! Your account is now verified.</p>
          <p style="margin: 10px 0 0 0;">Your daily limit has been increased to ₦${user.limits?.daily?.toLocaleString()}</p>
        </div>
      ` : ''}
      ${status === 'rejected' ? `
        <p>Unfortunately, we couldn't verify your information. Please contact support for assistance.</p>
      ` : ''}
    </div>
  `;

  return await sendEmailViaSendGrid(user.email, subject, html);
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  const subject = 'Reset Your Password - TONPay Africa';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Reset Your Password</h1>
      <p>You requested to reset your password for your TONPay Africa account.</p>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link in your browser:</p>
      <p style="font-size: 12px; color: #6b7280; word-break: break-all;">${resetLink}</p>
      <p style="font-size: 14px; color: #ef4444; margin-top: 30px;">This link will expire in 1 hour.</p>
      <p style="font-size: 14px; color: #6b7280;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  return await sendEmailViaSendGrid(email, subject, html);
};

export default {
  sendWelcomeEmail,
  sendTransactionNotification,
  sendKYCStatusEmail,
  sendPasswordResetEmail
};
