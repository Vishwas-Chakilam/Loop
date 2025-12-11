import { GoogleGenAI } from "@google/genai";
import { AppData } from '../types';

export const getHabitInsights = async (data: AppData): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please configure it to get AI insights.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Prepare a summary of data for the AI
  // We don't want to send too much token data, so we summarize the last 14 days.
  const today = new Date();
  const logsSummary = Object.entries(data.logs)
    .sort((a, b) => b[0].localeCompare(a[0])) // Sort desc
    .slice(0, 14) // Last 14 entries
    .map(([date, log]) => ({
      date,
      completedCount: log.completedHabits.length,
      sleep: log.sleepHours
    }));

  const habitNames = data.habits.map(h => h.title).join(", ");
  const userContext = `User ${data.profile.name} is tracking these habits: ${habitNames}.`;

  const prompt = `
    You are an enthusiastic and wise habit coach for an app called "Loop".
    Analyze the user's recent performance based on this JSON summary:
    ${JSON.stringify(logsSummary)}
    
    User Context: ${userContext}
    
    Provide a short, punchy, and motivating insight (max 2 sentences). 
    If they are doing well, praise them. If they are struggling with consistency or sleep, give a gentle tip.
    Do not use markdown formatting like bold or italics, just plain text with emojis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Keep pushing! You're doing great.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not fetch insights at this moment. Stay consistent!";
  }
};
