import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private transporter;
  private fromEmail: string;
  private frontendUrl: string;
  private logoUrl: string = '';

  // Store compiled templates
  private templates: Map<string, handlebars.TemplateDelegate> = new Map();

  constructor(private configService: ConfigService) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPass = this.configService.get<string>('EMAIL_PASS');

    // Use Resend if API key is available (production)
    if (resendApiKey) {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
          user: 'resend',
          pass: resendApiKey,
        },
      });
      this.fromEmail = 'noreply@mushafplatform.com';
      console.log('✓ Email service: Resend SMTP');
    } else if (emailUser && emailPass) {
      // Fallback to Gmail (development)
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });
      this.fromEmail = emailUser;
      console.log('✓ Email service: Gmail SMTP');
    } else {
      console.error('✗ No email service configured');
    }

    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    // Pre-compile templates and load assets on service initialization
    this.compileTemplates();
    this.loadLogo();
  }

  private loadLogo(): void {
    // First try env variable for Cloudinary URL
    const cloudinaryUrl = this.configService.get<string>('CLOUDINARY_LOGO_URL');
    if (cloudinaryUrl) {
      this.logoUrl = cloudinaryUrl;
      console.log('✓ Logo URL from env:', this.logoUrl);
      return;
    }
    
    // Fallback to local file as base64
    const possiblePaths = [
      path.join(__dirname, '..', 'templates', 'images', 'logo.png'),
      path.join(process.cwd(), 'src', 'common', 'templates', 'images', 'logo.png'),
    ];

    for (const logoPath of possiblePaths) {
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        this.logoUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        console.log('✓ Logo loaded from:', logoPath);
        return;
      }
    }

    console.warn('⚠ Logo not found. Tried paths:', possiblePaths);
  }

  private compileTemplates(): void {
    // Try multiple possible paths for templates directory
    const possiblePaths = [
      path.join(__dirname, '..', 'templates', 'email'),
      path.join(process.cwd(), 'src', 'common', 'templates', 'email'),
    ];

    let templatesDir = '';

    // Find the first existing directory
    for (const dir of possiblePaths) {
      if (fs.existsSync(dir)) {
        templatesDir = dir;
        break;
      }
    }

    if (!templatesDir) {
      console.error('Email templates directory not found. Tried:', possiblePaths);
      return;
    }

    console.log('Loading email templates from:', templatesDir);

    try {
      const files = fs.readdirSync(templatesDir);
      console.log('Found template files:', files);

      files.forEach((file) => {
        if (file.endsWith('.hbs')) {
          const templateName = file.replace('.hbs', '');
          const templatePath = path.join(templatesDir, file);
          const templateContent = fs.readFileSync(templatePath, 'utf-8');

          // Compile and cache the template
          const compiled = handlebars.compile(templateContent);
          this.templates.set(templateName, compiled);
          console.log(`✓ Compiled email template: ${templateName}`);
        }
      });

      console.log('Loaded templates:', Array.from(this.templates.keys()));
    } catch (error) {
      console.error('Failed to compile email templates:', error);
    }
  }

  private getTemplate(templateName: string, data: Record<string, string>): string {
    const template = this.templates.get(templateName);

    if (!template) {
      console.error('Available templates:', Array.from(this.templates.keys()));
      throw new Error(`Template not found: ${templateName}`);
    }

    return template(data);
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${resetToken}`;

    const html = this.getTemplate('password-reset', {
      resetUrl,
      logoUrl: this.logoUrl,
      year: new Date().getFullYear().toString(),
    });

    const mailOptions = {
      from: this.fromEmail,
      to: email,
      subject: '🔐 Reset Your Password - Mushaf Platform',
      html,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendEmailVerification(email: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${verificationToken}`;

    const html = this.getTemplate('verification', {
      verificationUrl,
      logoUrl: this.logoUrl,
      year: new Date().getFullYear().toString(),
    });

    const mailOptions = {
      from: this.fromEmail,
      subject: '✅ Verify Your Email - Welcome to Mushaf Platform!',
      html,
      to: email,
    };

    await this.transporter.sendMail(mailOptions);
  }
}