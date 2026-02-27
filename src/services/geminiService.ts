export interface ChatHistoryItem {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface ScamAnalysis {
  scam_probability: number;
  risk_level: 'Safe' | 'Medium Risk' | 'High Risk' | 'Critical';
  scam_type: string;
  explanation: string[];
  highlighted_keywords: string[];
  safety_recommendation: string;
}

export const analyzeContent = async (text: string, imageBase64?: string): Promise<ScamAnalysis> => {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      imageBase64,
    }),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const data = (await response.json()) as any;
      detail = data?.error ? `: ${data.error}` : "";
    } catch {
      // ignore
    }
    throw new Error(`Failed to analyze content${detail}`);
  }

  return (await response.json()) as ScamAnalysis;
};

export const getChatResponse = async (history: ChatHistoryItem[], message: string) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      history,
      message,
    }),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const data = (await response.json()) as any;
      detail = data?.error ? `: ${data.error}` : "";
    } catch {
      // ignore
    }
    throw new Error(`Failed to get chat response${detail}`);
  }

  const data = (await response.json()) as { reply: string };
  return data.reply;
};
