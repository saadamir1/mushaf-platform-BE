import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;
  private fromEmail: string;
  private frontendUrl: string;

  // Common email styles
  private readonly emailStyles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .email-wrapper { background-color: #f8f9fa; padding: 40px 20px; }
      .email-content { background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      .logo { text-align: center; margin-bottom: 30px; }
      .logo-icon { font-size: 48px; }
      h1 { color: #1a472a; font-size: 28px; margin-bottom: 20px; text-align: center; }
      h2 { color: #1a472a; font-size: 22px; margin-bottom: 15px; }
      p { margin-bottom: 15px; color: #555; }
      .button { display: inline-block; background: linear-gradient(135deg, #1a472a 0%, #2d5a3f 100%); color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
      .button:hover { background: linear-gradient(135deg, #2d5a3f 0%, #3d7a5f 100%); }
      .link { color: #1a472a; text-decoration: underline; word-break: break-all; }
      .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
      .footer p { font-size: 12px; color: #999; }
      .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
      .success { background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px; }
    </style>
  `;

  constructor(private configService: ConfigService) {
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPass = this.configService.get<string>('EMAIL_PASS');
    
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
    
    this.fromEmail = emailUser || 'noreply@mushafplatform.com';
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
  }

  private getVerificationEmailHtml(verificationUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${this.emailStyles}
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="email-content">
        <div class="logo">
          <div class="logo-icon">🕌</div>
        </div>
        <h1>Welcome to Mushaf Platform</h1>
        <p>Assalamu Alaikum! Thank you for joining us on your Quran journey.</p>
        <p>To get started, please verify your email address by clicking the button below:</p>
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p><a href="${verificationUrl}" class="link">${verificationUrl}</a></p>
        <div class="warning">
          <strong>Note:</strong> This verification link will expire in 24 hours.
        </div>
        <p>If you didn't create an account with Mushaf Platform, please ignore this email.</p>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Mushaf Platform. All rights reserved.</p>
          <p>Your companion in Quranic learning</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getPasswordResetEmailHtml(resetUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${this.emailStyles}
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="email-content">
        <div class="logo">
          <div class="logo-icon">🕌</div>
        </div>
        <h1>Reset Your Password</h1>
        <p>Assalamu Alaikum! We received a request to reset your password.</p>
        <p>Click the button below to create a new password:</p>
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p><a href="${resetUrl}" class="link">${resetUrl}</a></p>
        <div class="warning">
          <strong>Important:</strong> This reset link will expire in 15 minutes for security reasons.
        </div>
        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Mushaf Platform. All rights reserved.</p>
          <p>Your companion in Quranic learning</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: this.fromEmail,
      to: email,
      subject: '🔐 Reset Your Password - Mushaf Platform',
      html: this.getPasswordResetEmailHtml(resetUrl),
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendEmailVerification(email: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: this.fromEmail,
      subject: '✅ Verify Your Email - Welcome to Mushaf Platform!',
      html: this.getVerificationEmailHtml(verificationUrl),
      to: email,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
