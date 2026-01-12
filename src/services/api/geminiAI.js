import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini AI Service
 * Handles AI interactions using Google's Gemini API
 */

class GeminiAIService {
  constructor() {
    const apiKey = import.meta.env?.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('Gemini API key not configured');
      this.genAI = null;
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI?.getGenerativeModel({ model: 'gemini-pro' });
    this.chatSessions = new Map();
  }

  /**
   * Check if Gemini AI is configured
   */
  isConfigured() {
    return this.genAI !== null;
  }

  /**
   * Generate text response from prompt
   */
  async generateText(prompt, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('Gemini AI is not configured. Please add VITE_GEMINI_API_KEY to your .env file');
    }

    try {
      const result = await this.model?.generateContent(prompt);
      const response = await result?.response;
      return response?.text();
    } catch (error) {
      console.error('Gemini AI generation error:', error);
      throw error;
    }
  }

  /**
   * Start a chat session
   */
  startChat(sessionId, history = []) {
    if (!this.isConfigured()) {
      throw new Error('Gemini AI is not configured');
    }

    let chat = this.model?.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    this.chatSessions?.set(sessionId, chat);
    return chat;
  }

  /**
   * Send message in existing chat session
   */
  async sendChatMessage(sessionId, message) {
    if (!this.isConfigured()) {
      throw new Error('Gemini AI is not configured');
    }

    let chat = this.chatSessions?.get(sessionId);
    
    if (!chat) {
      chat = this.startChat(sessionId);
    }

    try {
      const result = await chat?.sendMessage(message);
      const response = await result?.response;
      return response?.text();
    } catch (error) {
      console.error('Chat message error:', error);
      throw error;
    }
  }

  /**
   * End chat session
   */
  endChat(sessionId) {
    this.chatSessions?.delete(sessionId);
  }

  /**
   * Generate menu recommendations based on preferences
   */
  async generateMenuRecommendations(userPreferences, menuItems) {
    const prompt = `Based on the following user preferences: ${JSON.stringify(userPreferences)}, 
    recommend 3 menu items from this list: ${JSON.stringify(menuItems)}. 
    Provide a brief explanation for each recommendation.`;

    return await this.generateText(prompt);
  }

  /**
   * Generate personalized reward suggestions
   */
  async generateRewardSuggestions(userHistory, availableRewards) {
    const prompt = `Based on user order history: ${JSON.stringify(userHistory)}, 
    suggest the most relevant rewards from: ${JSON.stringify(availableRewards)}. 
    Explain why each reward would be valuable to this user.`;

    return await this.generateText(prompt);
  }

  /**
   * Generate customer service response
   */
  async generateCustomerServiceResponse(customerQuery, context = {}) {
    const prompt = `You are a helpful restaurant customer service assistant for Benedict Cafe. 
    Customer query: "${customerQuery}"
    Context: ${JSON.stringify(context)}
    Provide a helpful, friendly, and professional response.`;

    return await this.generateText(prompt);
  }

  /**
   * Analyze order patterns and generate insights
   */
  async analyzeOrderPatterns(orderHistory) {
    const prompt = `Analyze these order patterns: ${JSON.stringify(orderHistory)}
    Provide insights about:
    1. Most frequently ordered items
    2. Preferred ordering times
    3. Average order value trends
    4. Recommendations for loyalty rewards`;

    return await this.generateText(prompt);
  }

  /**
   * Generate promotional content
   */
  async generatePromotionalContent(productInfo, targetAudience) {
    const prompt = `Create engaging promotional content for: ${JSON.stringify(productInfo)}
    Target audience: ${targetAudience}
    Include: catchy headline, description, and call-to-action.`;

    return await this.generateText(prompt);
  }
}

// Export singleton instance
export const geminiAI = new GeminiAIService();
export default geminiAI;