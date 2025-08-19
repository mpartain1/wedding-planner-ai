import sgMail from '@sendgrid/mail';
import type { GeneratedEmail } from './aiEmailGenerator';

// Initialize SendGrid
const apiKey = import.meta.env.VITE_SENDGRID_API_KEY;
if (apiKey) {
  sgMail.setApiKey(apiKey);
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  content: string; // Base64 encoded
  filename: string;
  type?: string;
  disposition?: 'attachment' | 'inline';
}

export interface SendEmailOptions {
  to: EmailRecipient;
  from?: EmailRecipient;
  replyTo?: EmailRecipient;
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
  categories?: string[];
  customArgs?: Record<string, string>;
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
  statusCode?: number;
}

export class SendGridService {
  private static readonly DEFAULT_FROM = {
    email: import.meta.env.VITE_SENDGRID_FROM_EMAIL || 'noreply@weddingplanner.com',
    name: import.meta.env.VITE_WEDDING_PLANNER_NAME || 'Wedding Planner AI'
  };

  /**
   * Send a single email
   */
  static async sendEmail(options: SendEmailOptions): Promise<EmailDeliveryResult> {
    if (!apiKey) {
      console.error('SendGrid API key not configured');
      return { success: false, error: 'SendGrid not configured' };
    }

    try {
      const msg: any = {
        to: options.to.email,
        from: (options.from || this.DEFAULT_FROM).email,
        replyTo: options.replyTo?.email,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
        templateId: options.templateId,
        dynamicTemplateData: options.dynamicTemplateData,
        categories: options.categories || ['wedding-planner'],
        customArgs: {
          source: 'wedding-planner-ai',
          ...options.customArgs
        }
      };

      const [response] = await sgMail.send(msg);
      
      return {
        success: true,
        messageId: response.headers['x-message-id'],
        statusCode: response.statusCode
      };

    } catch (error: any) {
      console.error('SendGrid error:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to send email',
        statusCode: error.code
      };
    }
  }

  /**
   * Send AI-generated email to vendor
   */
  static async sendAIGeneratedEmail(
    generatedEmail: GeneratedEmail,
    recipient: EmailRecipient,
    vendorId: string,
    categoryName: string
  ): Promise<EmailDeliveryResult> {
    
    const htmlBody = this.convertTextToHtml(generatedEmail.body);
    
    const result = await this.sendEmail({
      to: recipient,
      subject: generatedEmail.subject,
      text: generatedEmail.body,
      html: htmlBody,
      categories: ['wedding-planner', 'vendor-outreach', categoryName.toLowerCase()],
      customArgs: {
        vendor_id: vendorId,
        email_type: 'ai_generated',
        tone: generatedEmail.tone
      }
    });

    // Log the email send attempt
    console.log(`Email sent to ${recipient.email}:`, {
      success: result.success,
      subject: generatedEmail.subject,
      messageId: result.messageId
    });

    return result;
  }

  /**
   * Send bulk emails to multiple vendors
   */
  static async sendBulkEmails(
    emails: Array<{
      generatedEmail: GeneratedEmail;
      recipient: EmailRecipient;
      vendorId: string;
      categoryName: string;
    }>
  ): Promise<EmailDeliveryResult[]> {
    
    const results: EmailDeliveryResult[] = [];
    
    // Send emails with a delay to avoid rate limiting
    for (const emailData of emails) {
      const result = await this.sendAIGeneratedEmail(
        emailData.generatedEmail,
        emailData.recipient,
        emailData.vendorId,
        emailData.categoryName
      );
      
      results.push(result);
      
      // Add delay between emails (SendGrid allows 600 emails/minute)
      if (emails.length > 1) {
        await this.delay(100); // 100ms delay
      }
    }
    
    return results;
  }

  /**
   * Send follow-up email
   */
  static async sendFollowUpEmail(
    originalSubject: string,
    followUpBody: string,
    recipient: EmailRecipient,
    vendorId: string
  ): Promise<EmailDeliveryResult> {
    
    const subject = originalSubject.startsWith('Re:') 
      ? originalSubject 
      : `Re: ${originalSubject}`;
    
    return this.sendEmail({
      to: recipient,
      subject,
      text: followUpBody,
      html: this.convertTextToHtml(followUpBody),
      categories: ['wedding-planner', 'follow-up'],
      customArgs: {
        vendor_id: vendorId,
        email_type: 'follow_up'
      }
    });
  }

  /**
   * Send negotiation email
   */
  static async sendNegotiationEmail(
    subject: string,
    body: string,
    recipient: EmailRecipient,
    vendorId: string,
    originalPrice: number,
    targetPrice: number
  ): Promise<EmailDeliveryResult> {
    
    return this.sendEmail({
      to: recipient,
      subject,
      text: body,
      html: this.convertTextToHtml(body),
      categories: ['wedding-planner', 'negotiation'],
      customArgs: {
        vendor_id: vendorId,
        email_type: 'price_negotiation',
        original_price: originalPrice.toString(),
        target_price: targetPrice.toString()
      }
    });
  }

  /**
   * Send acceptance email
   */
  static async sendAcceptanceEmail(
    subject: string,
    body: string,
    recipient: EmailRecipient,
    vendorId: string,
    finalPrice: number
  ): Promise<EmailDeliveryResult> {
    
    return this.sendEmail({
      to: recipient,
      subject,
      text: body,
      html: this.convertTextToHtml(body),
      categories: ['wedding-planner', 'acceptance'],
      customArgs: {
        vendor_id: vendorId,
        email_type: 'vendor_acceptance',
        final_price: finalPrice.toString()
      }
    });
  }

  /**
   * Send decline email
   */
  static async sendDeclineEmail(
    subject: string,
    body: string,
    recipient: EmailRecipient,
    vendorId: string,
    reason: string
  ): Promise<EmailDeliveryResult> {
    
    return this.sendEmail({
      to: recipient,
      subject,
      text: body,
      html: this.convertTextToHtml(body),
      categories: ['wedding-planner', 'decline'],
      customArgs: {
        vendor_id: vendorId,
        email_type: 'vendor_decline',
        decline_reason: reason
      }
    });
  }

  /**
   * Convert plain text to HTML with basic formatting
   */
  private static convertTextToHtml(text: string): string {
    return text
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
      .replace(/<p><\/p>/g, '<p>&nbsp;</p>');
  }

  /**
   * Add delay for rate limiting
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get email delivery statistics
   */
  static async getEmailStats(startDate?: string, endDate?: string): Promise<any> {
    // This would require SendGrid's Stats API
    // For now, return placeholder data
    return {
      delivered: 0,
      bounces: 0,
      opens: 0,
      clicks: 0,
      unsubscribes: 0
    };
  }

  /**
   * Validate email configuration
   */
  static validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!apiKey) {
      errors.push('SENDGRID_API_KEY environment variable is required');
    }
    
    if (!import.meta.env.VITE_SENDGRID_FROM_EMAIL) {
      errors.push('SENDGRID_FROM_EMAIL environment variable is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Test email configuration by sending a test email
   */
  static async testConfiguration(testEmail: string): Promise<EmailDeliveryResult> {
    const validation = this.validateConfiguration();
    
    if (!validation.isValid) {
      return {
        success: false,
        error: `Configuration errors: ${validation.errors.join(', ')}`
      };
    }

    return this.sendEmail({
      to: { email: testEmail },
      subject: 'Wedding Planner AI - Test Email',
      text: 'This is a test email to verify SendGrid configuration is working correctly.',
      html: '<p>This is a test email to verify SendGrid configuration is working correctly.</p>',
      categories: ['test']
    });
  }
}