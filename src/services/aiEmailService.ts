import { supabase } from '../lib/supabase';
import type { DbVendor, DbAIConversation, DbAIAction } from '../types';

export class AIEmailService {
  // Send initial outreach email to vendor
  static async sendInitialOutreach(vendorId: string, customMessage?: string): Promise<void> {
    try {
      // Get vendor details
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('*, category:vendor_categories(*)')
        .eq('id', vendorId)
        .single();

      if (vendorError || !vendor) {
        throw new Error('Vendor not found');
      }

      // Create email content
      const emailContent = customMessage || this.generateInitialOutreachTemplate(vendor);
      
      // Log the conversation
      await this.logConversation(vendorId, 'outbound', 'Initial Inquiry', emailContent);
      
      // Create AI action for follow-up
      await this.createAIAction(vendorId, 'initial_outreach_sent', 'Initial outreach email sent, awaiting response');
      
      // In a real implementation, you would integrate with your email service here
      // await this.sendEmail(vendor.contact_email, 'Wedding Vendor Inquiry', emailContent);
      
      console.log('Email sent to:', vendor.contact_email);
      console.log('Content:', emailContent);
      
    } catch (error) {
      console.error('Error sending initial outreach:', error);
      throw error;
    }
  }

  // Generate initial outreach email template
  private static generateInitialOutreachTemplate(vendor: any): string {
    return `
Subject: Wedding Vendor Inquiry - ${vendor.category.name}

Dear ${vendor.name} Team,

I hope this email finds you well. I am currently planning a wedding for September 15, 2024, and am reaching out to inquire about your ${vendor.category.name.toLowerCase()} services.

Event Details:
- Date: September 15, 2024
- Guest Count: 150
- Budget Range: $${(vendor.category.budget * 0.8).toLocaleString()} - $${vendor.category.budget.toLocaleString()}
- Style: Elegant garden-themed wedding with soft pastels

Could you please provide:
1. Your availability for this date
2. Package options and pricing
3. Portfolio or examples of recent work
4. Any additional services you offer

I would love to schedule a consultation to discuss our vision in more detail. Please let me know your availability for a call or meeting in the coming week.

Thank you for your time, and I look forward to hearing from you.

Best regards,
Sarah Johnson
Wedding Planning Team
`;
  }

  // Log conversation to database
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

  // Create AI action
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

  // Get conversation history for vendor
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

  // Get pending AI actions
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

  // Process vendor response (simulated)
  static async processVendorResponse(
    vendorId: string, 
    responseContent: string, 
    priceQuoted?: number
  ): Promise<void> {
    try {
      // Log the incoming response
      await this.logConversation(vendorId, 'inbound', 'Response to Inquiry', responseContent);

      // Update vendor status and price if provided
      const updates: Partial<DbVendor> = {
        status: 'negotiating',
        last_contact: new Date().toISOString().split('T')[0],
      };

      if (priceQuoted) {
        updates.price = priceQuoted;
      }

      await supabase
        .from('vendors')
        .update(updates)
        .eq('id', vendorId);

      // Analyze response and determine next action
      const nextAction = this.analyzeResponse(responseContent, priceQuoted);
      
      await this.createAIAction(
        vendorId,
        nextAction.type,
        nextAction.description,
        nextAction.requiresHumanInput,
        nextAction.inputNeeded
      );

    } catch (error) {
      console.error('Error processing vendor response:', error);
      throw error;
    }
  }

  // Analyze vendor response and determine next action
  private static analyzeResponse(content: string, priceQuoted?: number): {
    type: string;
    description: string;
    requiresHumanInput: boolean;
    inputNeeded?: string;
  } {
    // Simple analysis - in real implementation, use AI/NLP
    if (priceQuoted && priceQuoted > 0) {
      return {
        type: 'price_received',
        description: `Price quote received: $${priceQuoted.toLocaleString()}`,
        requiresHumanInput: true,
        inputNeeded: 'Review price quote and approve/negotiate'
      };
    }

    if (content.toLowerCase().includes('not available') || content.toLowerCase().includes('booked')) {
      return {
        type: 'vendor_unavailable',
        description: 'Vendor reported unavailable for requested date',
        requiresHumanInput: false
      };
    }

    if (content.toLowerCase().includes('portfolio') || content.toLowerCase().includes('examples')) {
      return {
        type: 'portfolio_requested',
        description: 'Vendor requested to see portfolio/examples',
        requiresHumanInput: true,
        inputNeeded: 'Review vendor portfolio and provide feedback'
      };
    }

    return {
      type: 'follow_up_needed',
      description: 'Response received, follow-up required',
      requiresHumanInput: true,
      inputNeeded: 'Review response and determine next steps'
    };
  }

  // Send follow-up email
  static async sendFollowUp(vendorId: string, message: string): Promise<void> {
    await this.logConversation(vendorId, 'outbound', 'Follow-up', message);
    
    // Update last contact
    await supabase
      .from('vendors')
      .update({ 
        last_contact: new Date().toISOString().split('T')[0] 
      })
      .eq('id', vendorId);

    console.log('Follow-up sent to vendor:', vendorId);
  }

  // Negotiate price
  static async negotiatePrice(vendorId: string, targetPrice: number, justification: string): Promise<void> {
    const message = `
Thank you for your quote. After reviewing our budget, we were hoping to work within a range of $${targetPrice.toLocaleString()}. 

${justification}

Would you be able to work within this budget? We're flexible on some aspects of the package if needed.

Looking forward to your response.
`;

    await this.sendFollowUp(vendorId, message);
    
    await this.createAIAction(
      vendorId,
      'price_negotiation_sent',
      `Negotiation email sent for target price: $${targetPrice.toLocaleString()}`
    );
  }

  // Accept vendor proposal
  static async acceptVendor(vendorId: string, finalPrice: number): Promise<void> {
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
  }

  // Decline vendor
  static async declineVendor(vendorId: string, reason: string): Promise<void> {
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
  }
}