import { GoogleGenAI } from "@google/genai";
import { Expense, Participant, SettlementResult } from "../types";

// Initialize client
// Note: In a real production app, you might proxy this through a backend to hide the key,
// or require the user to input their own key if it's a client-side tool.
// For this demo, we assume the env var is available or handled securely.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIReport = async (
  participants: Participant[],
  expenses: Expense[],
  settlement: SettlementResult
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "請配置 API Key 以啟用 AI 智能分析功能。";
  }

  const dataContext = {
    participants,
    expenses: expenses.map(e => ({
      title: e.title,
      amount: e.amount,
      payer: participants.find(p => p.id === e.payerId)?.name,
      involvedCount: e.involvedIds.length
    })),
    settlement: {
      balances: settlement.balances.map(b => ({
        name: participants.find(p => p.id === b.participantId)?.name,
        net: b.amount
      })),
      actions: settlement.actions.map(a => ({
        from: participants.find(p => p.id === a.fromId)?.name,
        to: participants.find(p => p.id === a.toId)?.name,
        amount: a.amount
      }))
    }
  };

  const prompt = `
    你是一個幽默且專業的財務助理。請根據以下的分帳數據，產生一份繁體中文的總結報告。
    
    數據 (JSON):
    ${JSON.stringify(dataContext, null, 2)}

    請包含以下三個部分：
    1. 📝 **消費點評**：簡短分析大家的消費習慣，誰是「大金主」（付最多錢的人），誰是「蹭飯王」（參與最多但付最少的人），語氣可以稍微幽默一點。
    2. 📊 **結算概況**：用一句話總結這次活動的總花費與人均花費。
    3. 💡 **貼心提醒**：提醒還款的人記得轉帳，並給出一個有趣的結尾。

    請直接輸出純文字內容，不要Markdown代碼塊。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "AI 暫時無法產生報告。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 分析發生錯誤，請稍後再試。";
  }
};