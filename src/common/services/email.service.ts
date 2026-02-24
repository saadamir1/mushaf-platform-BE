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

  // Store compiled templates
  private templates: Map<string, handlebars.TemplateDelegate> = new Map();

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
    
    // Pre-compile templates on service initialization
    this.compileTemplates();
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
      
      files.forEach(file => {
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
