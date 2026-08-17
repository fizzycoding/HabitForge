import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = new Resend(env.RESEND_API_KEY || process.env.RESEND_API_KEY);

interface SendVerificationEmailOptions {
  to: string;
  name: string;
  url: string;
}

interface SendPasswordResetEmailOptions {
  to: string;
  name: string;
  url: string;
}

export async function sendVerificationEmail({
  to,
  name,
  url,
}: SendVerificationEmailOptions) {
  const subject = 'Verify your HabitForge Account 🛡️';
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #070A12; color: #F8FAFC; padding: 36px; border-radius: 20px; max-width: 500px; margin: 0 auto; border: 1px solid #1E293B;">
      <h1 style="color: #6366F1; margin-bottom: 8px; font-size: 28px; tracking: -0.5px;">HABIT<span style="color: #A855F7;">FORGE</span></h1>
      <h2 style="font-size: 20px; color: #F1F5F9; margin-top: 16px;">Welcome to HabitForge, ${name}! 👋</h2>
      <p style="color: #94A3B8; font-size: 15px; line-height: 1.6;">Thank you for joining. Please click the button below to verify your email address and activate your account.</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${url}" style="background: linear-gradient(to right, #4F46E5, #9333EA); color: #FFFFFF; padding: 16px 36px; border-radius: 12px; font-weight: bold; font-size: 16px; text-decoration: none; display: inline-block; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);">
          Verify Email Address
        </a>
      </div>

      <p style="color: #64748B; font-size: 13px; margin-top: 24px; word-break: break-all;">
        Or copy and paste this link in your browser:<br/>
        <a href="${url}" style="color: #6366F1; text-decoration: underline;">${url}</a>
      </p>

      <p style="color: #475569; font-size: 12px; margin-top: 32px; border-t: 1px solid #1E293B; padding-top: 16px;">
        If you didn't create an account on HabitForge, you can safely ignore this email.
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
  url,
}: SendPasswordResetEmailOptions) {
  const subject = 'Reset Your HabitForge Password 🔑';
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #070A12; color: #F8FAFC; padding: 36px; border-radius: 20px; max-width: 500px; margin: 0 auto; border: 1px solid #1E293B;">
      <h1 style="color: #6366F1; margin-bottom: 8px; font-size: 28px; tracking: -0.5px;">HABIT<span style="color: #A855F7;">FORGE</span></h1>
      <h2 style="font-size: 20px; color: #F1F5F9; margin-top: 16px;">Hello, ${name}</h2>
      <p style="color: #94A3B8; font-size: 15px; line-height: 1.6;">We received a request to reset the password for your HabitForge account.</p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${url}" style="background: linear-gradient(to right, #4F46E5, #9333EA); color: #FFFFFF; padding: 16px 36px; border-radius: 12px; font-weight: bold; font-size: 16px; text-decoration: none; display: inline-block; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);">
          Reset Password
        </a>
      </div>

      <p style="color: #64748B; font-size: 13px; margin-top: 24px; word-break: break-all;">
        Or copy and paste this link in your browser:<br/>
        <a href="${url}" style="color: #6366F1; text-decoration: underline;">${url}</a>
      </p>

      <p style="color: #475569; font-size: 12px; margin-top: 32px; border-t: 1px solid #1E293B; padding-top: 16px;">
        If you didn't request a password reset, you can safely ignore this email.
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
