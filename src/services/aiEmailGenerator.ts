import OpenAI from 'openai';
import type { DbVendor, DbVendorCategory } from '../types';

// Initialize OpenAI with error handling
let openai: OpenAI | null = null;

try {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (apiKey) {
    openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Only for development - move to backend in production
    });
  }
} catch (error) {
  console.warn('OpenAI not initialized:', error);
}

export interface EmailContext {
  vendor: DbVendor;
  category: DbVendorCategory;
  weddingDetails: {
    plannerName: string;
    date: string;
    guestCount: number;
    style: string;
    budget: number;
  };
  emailType: 'initial_outreach' | 'follow_up' | 'negotiation' | 'acceptance' | 'decline';
  customInstructions?: string;
  priceNegotiation?: {
    currentPrice: number;
    targetPrice: number;
    justification: string;
  };
}

export interface GeneratedEmail {
  subject: string;
  body: string;
  tone: 'professional' | 'friendly' | 'formal';
  estimatedResponseTime: string;
}

export class AIEmailGenerator {
  
  /**
   * Check if OpenAI is properly configured
   */
  static isConfigured(): boolean {
    return openai !== null;
  }

  /**
   * Generate an email using ChatGPT based on context
   */
  static async generateEmail(context: EmailContext): Promise<GeneratedEmail> {
    // If OpenAI is not configured, return a fallback template
    if (!openai) {
      console.warn('OpenAI not configured, using fallback template');
      return this.generateFallbackEmail(context);
    }

    const prompt = this.buildPrompt(context);
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt()
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0].message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return this.parseEmailResponse(response, context.emailType);
      
    } catch (error) {
      console.error('Error generating email with AI:', error);
      console.log('Falling back to template email');
      return this.generateFallbackEmail(context);
    }
  }

  /**
   * Generate fallback email when OpenAI is not available
   */
  private static generateFallbackEmail(context: EmailContext): GeneratedEmail {
    const { vendor, category, weddingDetails, emailType } = context;

    let subject: string;
    let body: string;

    switch (emailType) {
      case 'initial_outreach':
        subject = `Wedding Services Inquiry - ${category.name}`;
        body = `Dear ${vendor.name} Team,

I hope this email finds you well. I am currently planning a wedding for ${weddingDetails.date} and am reaching out to inquire about your ${category.name.toLowerCase()} services.

Event Details:
- Date: ${weddingDetails.date}
- Guest Count: ${weddingDetails.guestCount}
- Style: ${weddingDetails.style}
- Budget Range for ${category.name}: ${Math.round(category.budget * 0.8).toLocaleString()} - ${category.budget.toLocaleString()}

${category.notes ? `Our Vision for ${category.name}:
${category.notes}

` : ''}Could you please provide:
1. Your availability for this date
2. Package options and pricing within our budget range
3. Portfolio examples of recent work${category.notes ? ' that align with our vision' : ''}

I would love to schedule a consultation to discuss our vision in more detail. Please let me know your availability for a call or meeting.

Thank you for your time, and I look forward to hearing from you.

Best regards,
${weddingDetails.plannerName}`;
        break;

      case 'follow_up':
        subject = `Follow-up: Wedding Services Inquiry - ${category.name}`;
        body = `Dear ${vendor.name} Team,

I hope you're doing well. I wanted to follow up on my previous email regarding ${category.name.toLowerCase()} services for our wedding on ${weddingDetails.date}.

I understand you may be busy, but I wanted to check if you had a chance to review our inquiry. We're excited about the possibility of working with you and would appreciate any information you can share about your availability and services.

As a reminder, our budget for ${category.name} is ${category.budget.toLocaleString()}.${category.notes ? `

Our specific vision for this category:
${category.notes}` : ''}

If you need any additional details about our event, please don't hesitate to ask.

Thank you for your time, and I look forward to hearing from you soon.

Best regards,
${weddingDetails.plannerName}`;
        break;

      case 'negotiation':
        const currentPrice = context.priceNegotiation?.currentPrice || vendor.price;
        const targetPrice = context.priceNegotiation?.targetPrice || currentPrice * 0.9;
        const justification = context.priceNegotiation?.justification || 'budget considerations';

        subject = `Re: Wedding Services - Budget Discussion`;
        body = `Dear ${vendor.name},

Thank you for your proposal for our wedding ${category.name.toLowerCase()} services. We're very impressed with your work and would love to move forward.

After reviewing our overall wedding budget, we were wondering if there might be some flexibility in the pricing. Our current budget allocation for ${category.name.toLowerCase()} is $${targetPrice.toLocaleString()}, given ${justification}.

We understand the value of quality service and are hoping we can find a solution that works for both of us. Perhaps we could discuss:
- Alternative package options
- Adjustments to the service scope
- Payment plan arrangements

We're committed to working with you and hope we can reach an agreement that works for everyone.

Thank you for your understanding, and I look forward to your response.

Best regards,
${weddingDetails.plannerName}`;
        break;

      case 'acceptance':
        subject = `Excited to Move Forward - Wedding Services Confirmation`;
        body = `Dear ${vendor.name},

Wonderful news! We're thrilled to confirm that we'd like to move forward with your ${category.name.toLowerCase()} services for our wedding on ${weddingDetails.date}.

Your proposal aligns perfectly with our vision, and we're excited to have you as part of our special day.

Next steps:
- Please send over the contract for review
- Let us know about deposit requirements and payment schedule
- We'd love to schedule a detailed planning meeting at your earliest convenience

Thank you for your patience throughout this process. We can't wait to start working together!

Best regards,
${weddingDetails.plannerName}`;
        break;

      case 'decline':
        subject = `Thank You - Wedding Services Decision`;
        body = `Dear ${vendor.name},

Thank you so much for taking the time to provide a proposal for our wedding ${category.name.toLowerCase()} services. We truly appreciate the effort you put into understanding our needs and creating a thoughtful proposal.

After careful consideration, we have decided to go with a different vendor whose services more closely align with our current needs and budget constraints.

This was not an easy decision, as we were impressed by your professionalism and the quality of your work. We hope there may be opportunities to work together in the future.

Thank you again for your time and consideration. We wish you all the best with your business.

Warm regards,
${weddingDetails.plannerName}`;
        break;

      default:
        subject = `Wedding Services Inquiry - ${category.name}`;
        body = `Dear ${vendor.name},

I hope this email finds you well. I am reaching out regarding ${category.name.toLowerCase()} services for our upcoming wedding.

Please let me know if you would be available to discuss our needs in more detail.

Thank you for your time.

Best regards,
${weddingDetails.plannerName}`;
    }

    return {
      subject,
      body,
      tone: 'professional',
      estimatedResponseTime: '1-2 business days'
    };
  }

  /**
   * System prompt that defines the AI's role and behavior
   */
  private static getSystemPrompt(): string {
    return `You are an AI assistant helping a wedding planner send professional, warm, and effective emails to vendors.

Your emails should be:
- Professional yet personable
- Clear and specific about requirements
- Respectful of the vendor's time
- Include relevant wedding details
- Have clear calls to action

Always respond with a JSON object containing:
{
  "subject": "Email subject line",
  "body": "Full email body with proper formatting and line breaks",
  "tone": "professional|friendly|formal",
  "estimatedResponseTime": "Expected response timeframe"
}

Use proper email etiquette, be concise but informative, and maintain a warm, professional tone throughout.`;
  }

  /**
   * Build the prompt for ChatGPT based on context
   */
  private static buildPrompt(context: EmailContext): string {
    const { vendor, category, weddingDetails, emailType, customInstructions } = context;
    
    let basePrompt = `Generate a professional email for a wedding planner.

VENDOR: ${vendor.name}
CATEGORY: ${category.name}
VENDOR EMAIL: ${vendor.contact_email}

WEDDING DETAILS:
- Planner: ${weddingDetails.plannerName}
- Date: ${weddingDetails.date}
- Guests: ${weddingDetails.guestCount}
- Style: ${weddingDetails.style}
- Category Budget: $${weddingDetails.budget}

EMAIL TYPE: ${emailType.replace('_', ' ').toUpperCase()}`;

    switch (emailType) {
      case 'initial_outreach':
        basePrompt += `\n\nTASK: Write an initial inquiry email asking about availability, pricing, and services. Be professional, provide key wedding details, and request a consultation or meeting.`;
        break;
        
      case 'follow_up':
        basePrompt += `\n\nTASK: Write a polite follow-up email. Assume the vendor hasn't responded to a previous inquiry. Be understanding but express continued interest.`;
        break;
        
      case 'negotiation':
        basePrompt += `\n\nTASK: Write a diplomatic price negotiation email. Current price: $${context.priceNegotiation?.currentPrice}, Target: $${context.priceNegotiation?.targetPrice}.
JUSTIFICATION: ${context.priceNegotiation?.justification}
Be diplomatic and offer flexibility on terms while staying within budget.`;
        break;
        
      case 'acceptance':
        basePrompt += `\n\nTASK: Accept their proposal and move forward with booking. Express enthusiasm and outline next steps for contracts and deposits.`;
        break;
        
      case 'decline':
        basePrompt += `\n\nTASK: Politely decline their services. Be gracious, professional, and leave the door open for future opportunities.`;
        break;
    }

    if (customInstructions) {
      basePrompt += `\n\nADDITIONAL INSTRUCTIONS: ${customInstructions}`;
    }

    return basePrompt;
  }

  /**
   * Parse the AI response and extract email components
   */
  private static parseEmailResponse(response: string, emailType: string): GeneratedEmail {
    try {
      const parsed = JSON.parse(response);
      return {
        subject: parsed.subject || `Wedding Services Inquiry - ${emailType.replace('_', ' ')}`,
        body: parsed.body || response, // Fallback to raw response if not JSON
        tone: parsed.tone || 'professional',
        estimatedResponseTime: parsed.estimatedResponseTime || '1-2 business days'
      };
    } catch (error) {
      // If not valid JSON, treat as plain text response
      return {
        subject: `Wedding Services Inquiry - ${emailType.replace('_', ' ')}`,
        body: response,
        tone: 'professional',
        estimatedResponseTime: '1-2 business days'
      };
    }
  }

  /**
   * Generate multiple email variations for A/B testing
   */
  static async generateEmailVariations(context: EmailContext, count: number = 3): Promise<GeneratedEmail[]> {
    const variations: GeneratedEmail[] = [];
    
    for (let i = 0; i < count; i++) {
      const variationContext = {
        ...context,
        customInstructions: `${context.customInstructions || ''} Create variation ${i + 1} with a ${i === 0 ? 'formal' : i === 1 ? 'friendly' : 'balanced'} tone.`
      };
      
      const email = await this.generateEmail(variationContext);
      variations.push(email);
    }
    
    return variations;
  }

  /**
   * Analyze vendor response and suggest reply
   */
  static async analyzeResponseAndSuggestReply(
    vendorResponse: string, 
    context: EmailContext
  ): Promise<{
    analysis: {
      sentiment: 'positive' | 'negative' | 'neutral';
      priceQuoted?: number;
      availability: 'available' | 'unavailable' | 'checking';
      nextAction: string;
    };
    suggestedReply?: GeneratedEmail;
  }> {
    // If OpenAI is not configured, return basic analysis
    if (!openai) {
      return this.generateFallbackAnalysis(vendorResponse, context);
    }

    try {
      const analysisPrompt = `Analyze this vendor response and provide insights:

VENDOR RESPONSE: "${vendorResponse}"

Provide a JSON response with:
{
  "analysis": {
    "sentiment": "positive|negative|neutral",
    "priceQuoted": number or null,
    "availability": "available|unavailable|checking",
    "nextAction": "suggested next step"
  }
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing vendor communications for wedding planning. Extract key information and suggest appropriate next actions."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const response = completion.choices[0].message?.content;
      if (response) {
        const parsed = JSON.parse(response);
        return parsed;
      }
    } catch (error) {
      console.error('Error analyzing vendor response:', error);
    }

    return this.generateFallbackAnalysis(vendorResponse, context);
  }

  /**
   * Generate fallback analysis when OpenAI is not available
   */
  private static generateFallbackAnalysis(
    vendorResponse: string, 
    context: EmailContext
  ): {
    analysis: {
      sentiment: 'positive' | 'negative' | 'neutral';
      priceQuoted?: number;
      availability: 'available' | 'unavailable' | 'checking';
      nextAction: string;
    };
    suggestedReply?: GeneratedEmail;
  } {
    const lowerResponse = vendorResponse.toLowerCase();
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let availability: 'available' | 'unavailable' | 'checking' = 'checking';
    
    // Simple keyword analysis
    if (lowerResponse.includes('yes') || lowerResponse.includes('available') || lowerResponse.includes('interested')) {
      sentiment = 'positive';
      availability = 'available';
    } else if (lowerResponse.includes('no') || lowerResponse.includes('unavailable') || lowerResponse.includes('booked')) {
      sentiment = 'negative';
      availability = 'unavailable';
    }

    // Try to extract price
    const priceMatch = vendorResponse.match(/\$[\d,]+/);
    const priceQuoted = priceMatch ? parseInt(priceMatch[0].replace(/[$,]/g, '')) : undefined;

    const nextAction = availability === 'available' 
      ? 'Schedule consultation or request detailed proposal'
      : availability === 'unavailable'
      ? 'Thank vendor and mark as unavailable'
      : 'Request clarification on availability and pricing';

    return {
      analysis: {
        sentiment,
        priceQuoted,
        availability,
        nextAction
      }
    };
  }
}