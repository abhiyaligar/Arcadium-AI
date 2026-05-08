import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from 'react-hot-toast';

let aiInstance: any = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. AI features will be disabled.");
      return null;
    }
    aiInstance = new GoogleGenerativeAI(apiKey);
  }
  return aiInstance;
}

export class EmailService {
  private static async generateEmailContent(prompt: string): Promise<string> {
    try {
      const ai = getAI();
      if (!ai) return "Notification from Arcadium AI (AI features disabled).";
      
      // Using standard generative model access
      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-flash", 
      });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || "Notification from Arcadium AI.";
    } catch (e) {
      console.error("Gemini Email Gen Error:", e);
      return "Notification from Arcadium AI.";
    }
  }

  private static logEmail(to: string, subject: string, body: string) {
    console.group(`📧 EMAIL SENT TO: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    console.groupEnd();
    toast.success(`Email simulated for ${to}`);
  }

  static async sendJoinSquadRequest(leaderEmail: string, leaderName: string, applicantName: string, teamName: string) {
    const prompt = `Generate a notification to ${leaderName} (${leaderEmail}) informing them that ${applicantName} wants to join their squad "${teamName}" in Arcadium AI. Keep it short and high-stakes.`;
    const body = await this.generateEmailContent(prompt);
    this.logEmail(leaderEmail, `New Squad Request: ${applicantName} wants to join ${teamName}`, body);
  }

  static async sendJoinSquadApproval(applicantEmail: string, applicantName: string, teamName: string) {
    const prompt = `Generate a celebratory notification to ${applicantName} (${applicantEmail}) informing them that their request to join the squad "${teamName}" has been APPROVED. Welcome them to the team.`;
    const body = await this.generateEmailContent(prompt);
    this.logEmail(applicantEmail, `Squad Approved: Welcome to ${teamName}`, body);
  }

  static async sendEventRegistrationConfirmation(userEmail: string, userName: string, eventTitle: string, ticketId: string) {
    const prompt = `Generate a confirmation email to ${userName} (${userEmail}) for their registration in the event "${eventTitle}". Mention their Ticket ID: ${ticketId}. Make it sound official and exciting.`;
    const body = await this.generateEmailContent(prompt);
    this.logEmail(userEmail, `Registration Confirmed: ${eventTitle}`, body);
  }
}
