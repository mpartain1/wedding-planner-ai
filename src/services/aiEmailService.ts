import { supabase } from '../lib/supabase';
import type { DbVendor, DbAIConversation, DbAIAction } from '../types';
import { AIEmailGenerator, type EmailContext } from './aiEmailGenerator';
import { SendGridService } from './sendGridService';

export class AIEmailService {
  
  /**
   * Test email configuration for both SendGrid and OpenAI
   */
  static async testEmailConfiguration(testEmail: string): Promise<{
    sendgrid: boolean;
    openai: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let sendgrid = false;
    let openai = false;

    // Test SendGrid configuration
    try {
      const result = await SendGridService.testConfiguration(testEmail);
      sendgrid = result.success;
      if (!result.success) {
        errors.push(`SendGrid: ${result.error}`);
      }
    } catch (error) {
      errors.push(`SendGrid: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test OpenAI configuration
    try {
      // Simple test to verify OpenAI API key is working
      const testContext: EmailContext = {
        vendor: {
          id: 'test',
          name: 'Test Vendor',
          contact_email: testEmail,
          phone: null,
          category_id: 'test',
          status: 'interested',
          price: 1000,
          notes: '',
          last_contact: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        category: {
          id: 'test',
          name: 'Test Category',
          budget: 1000,
          notes: null,
          selected_vendor_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        weddingDetails: {
          plannerName: 'Test Planner',
          date: '2024-12-31',
          guestCount: 100,
          style: 'Test Style',
          budget: 1000
        },
        emailType: 'initial_outreach'
      };

      await AIEmailGenerator.generateEmail(testContext);
      openai = true;
    } catch (error) {
      errors.push(`OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { sendgrid, openai, errors };
  }

  /**
   * Send initial outreach email to vendor using AI generation
   */
  static async sendInitialOutreach(vendorId: string, customMessage?: string): Promise<void> {
    try {
      // Get vendor and category details
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select(`
          *,
          category:vendor_categories(*)
        `)
        .eq('id', vendorId)
        .single();

      if (vendorError || !vendor) {
        throw new Error('Vendor not found');
      }

      // Prepare wedding context
      const weddingDetails = {
        plannerName: import.meta.env.VITE_WEDDING_PLANNER_NAME || "Sarah's Wedding Team",
        date: import.meta.env.VITE_WEDDING_DATE || "September 15, 2024",
        guestCount: parseInt(import.meta.env.VITE_WEDDING_GUEST_COUNT) || 150,
        style: import.meta.env.VITE_WEDDING_STYLE || "Elegant garden-themed wedding",
        budget: vendor.category.budget
      };

      // Build AI context
      const emailContext: EmailContext = {
        vendor,
        category: vendor.category,
        weddingDetails,
        emailType: 'initial_outreach',
        customInstructions: customMessage
      };

      // Generate email using AI
      let generatedEmail;
      if (customMessage) {
        // Use custom message as-is
        generatedEmail = {
          subject: `Wedding Services Inquiry - ${vendor.category.name}`,
          body: customMessage,
          tone: 'professional' as const,
          estimatedResponseTime: '1-2 business days'
        };
      } else {
        // Generate with AI
        generatedEmail = await AIEmailGenerator.generateEmail(emailContext);
      }

      // Send email via SendGrid
      const emailResult = await SendGridService.sendAIGeneratedEmail(
        generatedEmail,
        { email: vendor.contact_email, name: vendor.name },
        vendorId,
        vendor.category.name
      );

      if (!emailResult.success) {
        throw new Error(`Failed to send email: ${emailResult.error}`);
      }

      // Log the conversation
      await this.logConversation(
        vendorId, 
        'outbound', 
        generatedEmail.subject, 
        generatedEmail.body
      );
      
      // Create AI action for follow-up
      await this.createAIAction(
        vendorId, 
        'initial_outreach_sent', 
        `Initial outreach email sent. AI estimated response time: ${generatedEmail.estimatedResponseTime}`
      );

      // Update vendor status and last contact
      await supabase
        .from('vendors')
        .update({ 
          status: 'interested',
          last_contact: new Date().toISOString().split('T')[0] 
        })
        .eq('id', vendorId);
      
      console.log('✅ AI-generated email sent successfully:', {
        vendor: vendor.name,
        email: vendor.contact_email,
        subject: generatedEmail.subject,
        messageId: emailResult.messageId
      });
      
    } catch (error) {
      console.error('Error sending AI-generated outreach:', error);
      throw error;
    }
  }

  /**
   * Process vendor response using AI analysis
   */
  static async processVendorResponse(
    vendorId: string, 
    responseContent: string, 
    priceQuoted?: number
  ): Promise<void> {
    try {
      // Get vendor details
      const { data: vendor, error } = await supabase
        .from('vendors')
        .select(`
          *,
          category:vendor_categories(*)
        `)
        .eq('id', vendorId)
        .single();

      if (error || !vendor) {
        throw new Error('Vendor not found');
      }

      // Log the incoming response
      await this.logConversation(vendorId, 'inbound', 'Response to Inquiry', responseContent);

      // Build context for AI analysis
      const emailContext: EmailContext = {
        vendor,
        category: vendor.category,
        weddingDetails: {
          plannerName: import.meta.env.VITE_WEDDING_PLANNER_NAME || "Sarah's Wedding Team",
          date: import.meta.env.VITE_WEDDING_DATE || "September 15, 2024",
          guestCount: parseInt(import.meta.env.VITE_WEDDING_GUEST_COUNT) || 150,
          style: import.meta.env.VITE_WEDDING_STYLE || "Elegant garden-themed wedding",
          budget: vendor.category.budget
        },
        emailType: 'follow_up'
      };

      // Analyze response with AI
      const analysis = await AIEmailGenerator.analyzeResponseAndSuggestReply(
        responseContent,
        emailContext
      );

      // Update vendor based on analysis
      const updates: Partial<DbVendor> = {
        last_contact: new Date().toISOString().split('T')[0]
      };

      if (priceQuoted || analysis.analysis.priceQuoted) {
        updates.price = priceQuoted || analysis.analysis.priceQuoted!;
      }

      // Update status based on analysis
      if (analysis.analysis.sentiment === 'positive' && analysis.analysis.availability === 'available') {
        updates.status = 'negotiating';
      } else if (analysis.analysis.availability === 'unavailable') {
        updates.status = 'declined';
      }

      await supabase
        .from('vendors')
        .update(updates)
        .eq('id', vendorId);

      // Create appropriate AI action
      const actionDescription = `Vendor responded: ${analysis.analysis.sentiment} sentiment, ${analysis.analysis.availability} availability. ${analysis.analysis.nextAction}`;
      
      await this.createAIAction(
        vendorId,
        'response_analyzed',
        actionDescription,
        analysis.suggestedReply ? true : false,
        analysis.suggestedReply ? 'Review AI-suggested reply and approve sending' : undefined
      );

    } catch (error) {
      console.error('Error processing vendor response:', error);
      throw error;
    }
  }

  /**
   * Send AI-generated follow-up email
   */
  static async sendFollowUp(vendorId: string, customMessage?: string): Promise<void> {
    try {
      const { data: vendor, error } = await supabase
        .from('vendors')
        .select(`
          *,
          category:vendor_categories(*)
        `)
        .eq('id', vendorId)
        .single();

      if (error || !vendor) {
        throw new Error('Vendor not found');
      }

      const emailContext: EmailContext = {
        vendor,
        category: vendor.category,
        weddingDetails: {
          plannerName: import.meta.env.VITE_WEDDING_PLANNER_NAME || "Sarah's Wedding Team",
          date: import.meta.env.VITE_WEDDING_DATE || "September 15, 2024",
          guestCount: parseInt(import.meta.env.VITE_WEDDING_GUEST_COUNT) || 150,
          style: import.meta.env.VITE_WEDDING_STYLE || "Elegant garden-themed wedding",
          budget: vendor.category.budget
        },
        emailType: 'follow_up',
        customInstructions: customMessage
      };

      const generatedEmail = await AIEmailGenerator.generateEmail(emailContext);

      const emailResult = await SendGridService.sendFollowUpEmail(
        generatedEmail.subject,
        generatedEmail.body,
        { email: vendor.contact_email, name: vendor.name },
        vendorId
      );

      if (!emailResult.success) {
        throw new Error(`Failed to send follow-up: ${emailResult.error}`);
      }

      await this.logConversation(vendorId, 'outbound', generatedEmail.subject, generatedEmail.body);
      
      await supabase
        .from('vendors')
        .update({ 
          last_contact: new Date().toISOString().split('T')[0] 
        })
        .eq('id', vendorId);

    } catch (error) {
      console.error('Error sending AI follow-up:', error);
      throw error;
    }
  }

  /**
   * Send AI-generated negotiation email
   */
  static async negotiatePrice(vendorId: string, targetPrice: number, justification: string): Promise<void> {
    try {
      const { data: vendor, error } = await supabase
        .from('vendors')
        .select(`
          *,
          category:vendor_categories(*)
        `)
        .eq('id', vendorId)
        .single();

      if (error || !vendor) {
        throw new Error('Vendor not found');
      }

      const emailContext: EmailContext = {
        vendor,
        category: vendor.category,
        weddingDetails: {
          plannerName: import.meta.env.VITE_WEDDING_PLANNER_NAME || "Sarah's Wedding Team",
          date: import.meta.env.VITE_WEDDING_DATE || "September 15, 2024",
          guestCount: parseInt(import.meta.env.VITE_WEDDING_GUEST_COUNT) || 150,
          style: import.meta.env.VITE_WEDDING_STYLE || "Elegant garden-themed wedding",
          budget: vendor.category.budget
        },
        emailType: 'negotiation'
      };

      const generatedEmail = await AIEmailGenerator.generateEmail(emailContext);

      const emailResult = await SendGridService.sendFollowUpEmail(
        generatedEmail.subject,
        generatedEmail.body,
        { email: vendor.contact_email, name: vendor.name },
        vendorId
      );

      if (!emailResult.success) {
        throw new Error(`Failed to send negotiation email: ${emailResult.error}`);
      }

      await this.logConversation(vendorId, 'outbound', generatedEmail.subject, generatedEmail.body);
      
      await supabase
        .from('vendors')
        .update({ 
          last_contact: new Date().toISOString().split('T')[0] 
        })
        .eq('id', vendorId);

    } catch (error) {
      console.error('Error sending negotiation email:', error);
      throw error;
    }
  }

  /**
   * Log conversation to database
   */
  static async logConversation(
    vendorId: string, 
    messageType: 'outbound' | 'inbound', 
    subject: string, 
    body: string
  ): Promise<DbAIConversation> {
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        vendor_id: vendorId,
        message_type: messageType,
        subject,
        body,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Create AI action
   */
  static async createAIAction(
    vendorId: string,
    actionType: string,
    description: string,
    requiresHumanInput: boolean = false,
    inputNeeded?: string
  ): Promise<DbAIAction> {
    const { data, error } = await supabase
      .from('ai_actions')
      .insert({
        vendor_id: vendorId,
        action_type: actionType,
        description,
        requires_human_input: requiresHumanInput,
        input_needed: inputNeeded,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Get conversation history for vendor
   */
  static async getConversationHistory(vendorId: string): Promise<DbAIConversation[]> {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('sent_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Get pending AI actions
   */
  static async getPendingActions(): Promise<DbAIAction[]> {
    const { data, error } = await supabase
      .from('ai_actions')
      .select(`
        *,
        vendor:vendors (
          name,
          contact_email,
          category:vendor_categories (name)
        )
      `)
      .eq('completed', false)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Accept vendor proposal
   */
  static async acceptVendor(vendorId: string, finalPrice: number): Promise<void> {
    try {
      // Update vendor status
      await supabase
        .from('vendors')
        .update({
          status: 'confirmed',
          price: finalPrice,
          last_contact: new Date().toISOString().split('T')[0],
        })
        .eq('id', vendorId);

      // Get vendor details to update category
      const { data: vendor } = await supabase
        .from('vendors')
        .select('category_id')
        .eq('id', vendorId)
        .single();

      if (vendor) {
        // Set as selected vendor for category
        await supabase
          .from('vendor_categories')
          .update({ selected_vendor_id: vendorId })
          .eq('id', vendor.category_id);
      }

      // Send confirmation email
      const confirmationMessage = `
Great news! We would love to move forward with your services for our wedding.

Final agreed price: $${finalPrice.toLocaleString()}

Next steps:
1. Please send over the contract for review
2. We'll schedule a detailed planning meeting
3. Arrange deposit payment

Thank you for working with us. We're excited to have you as part of our special day!
`;

      await this.logConversation(vendorId, 'outbound', 'Acceptance & Next Steps', confirmationMessage);
      
    } catch (error) {
      console.error('Error accepting vendor:', error);
      throw error;
    }
  }

  /**
   * Decline vendor
   */
  static async declineVendor(vendorId: string, reason: string): Promise<void> {
    try {
      await supabase
        .from('vendors')
        .update({
          status: 'declined',
          notes: reason,
          last_contact: new Date().toISOString().split('T')[0],
        })
        .eq('id', vendorId);

      const declineMessage = `
Thank you for taking the time to provide a quote for our wedding.

After careful consideration, we have decided to go with another vendor that better fits our current needs and budget.

We appreciate your professionalism and wish you all the best.

Best regards,
Wedding Planning Team
`;

      await this.logConversation(vendorId, 'outbound', 'Thank You', declineMessage);
      
    } catch (error) {
      console.error('Error declining vendor:', error);
      throw error;
    }
  }
}