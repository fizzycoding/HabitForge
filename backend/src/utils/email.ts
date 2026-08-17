import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = new Resend(env.RESEND_API_KEY || process.env.RESEND_API_KEY);

interface SendVerificationEmailOptions {
  to: string;
  name: string;
  token: string;
  otp: string;
}

interface SendPasswordResetEmailOptions {
  to: string;
  name: string;
  token: string;
}

export async function sendVerificationEmail({
  to,
  name,
  token,
  otp,
}: SendVerificationEmailOptions) {
  const verifyLink = `${env.CLIENT_URL}/verify-email?token=${token}`;
  const subject = 'Verify your HabitForge Account 🛡️';
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #070A12; color: #F8FAFC; padding: 30px; border-radius: 16px;">
      <h1 style="color: #6366F1; margin-bottom: 8px;">HABIT<span style="color: #A855F7;">FORGE</span></h1>
      <h2>Welcome, ${name}! 👋</h2>
      <p style="color: #94A3B8;">Thank you for joining HabitForge. Please verify your email address to complete registration.</p>
      
      <div style="background-color: #0F172A; border: 1px solid #1E293B; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
        <p style="color: #94A3B8; margin-bottom: 8px; font-size: 14px;">Your 6-Digit Verification Code:</p>
        <h1 style="font-size: 36px; letter-spacing: 8px; color: #38BDF8; margin: 0;">${otp}</h1>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${verifyLink}" style="background: linear-gradient(to right, #4F46E5, #9333EA); color: #FFFFFF; padding: 14px 28px; border-radius: 12px; font-weight: bold; text-decoration: none; display: inline-block;">
          Verify Email Address
        </a>
      </div>

      <p style="color: #64748B; font-size: 12px; margin-top: 30px;">
        If you didn't create an account on HabitForge, please ignore this email.
      </p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM || 'HabitForge <onboarding@resend.dev>',
    to,
    subject,
    html,
  });

  if (error) {
    console.error('[Resend Error]', error);
  } else {
    console.log(`[Resend] Verification email sent: ${data?.id}`);
  }
}

export async function sendPasswordResetEmail({
  to,
  name,
  token,
}: SendPasswordResetEmailOptions) {
  const resetLink = `${env.CLIENT_URL}/reset-password?token=${token}`;
  const subject = 'Reset Your HabitForge Password 🔑';
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #070A12; color: #F8FAFC; padding: 30px; border-radius: 16px;">
      <h1 style="color: #6366F1; margin-bottom: 8px;">HABIT<span style="color: #A855F7;">FORGE</span></h1>
      <h2>Hello, ${name}</h2>
      <p style="color: #94A3B8;">We received a request to reset the password for your HabitForge account.</p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${resetLink}" style="background: linear-gradient(to right, #4F46E5, #9333EA); color: #FFFFFF; padding: 14px 28px; border-radius: 12px; font-weight: bold; text-decoration: none; display: inline-block;">
          Reset Password
        </a>
      </div>

      <p style="color: #94A3B8; font-size: 13px;">Or copy and paste this link in your browser:</p>
      <p style="color: #38BDF8; font-size: 12px; word-break: break-all;">${resetLink}</p>

      <p style="color: #64748B; font-size: 12px; margin-top: 30px;">
        If you didn't request a password reset, you can safely ignore this email. Link expires in 1 hour.
      </p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM || 'HabitForge <onboarding@resend.dev>',
    to,
    subject,
    html,
  });

  if (error) {
    console.error('[Resend Error]', error);
  } else {
    console.log(`[Resend] Password reset email sent: ${data?.id}`);
  }
}
